import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const RenterHome = ({ user, showToast, onLogout }) => {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentLocation: user?.currentLocation || '',
    password: '',
  });
  
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'submissions', 'listProperty', 'profile'
  const [updating, setUpdating] = useState(false);

  // Property Submission State
  const [propertyForm, setPropertyForm] = useState({
    title: '',
    description: '',
    address: '',
    city: 'Mumbai', // Default to Mumbai
    state: '',
    rentAmount: '',
    propertyType: 'Apartment',
    furnishingStatus: 'Furnished',
    bedrooms: '1',
    bathrooms: '1',
    amenities: '',
  });
  const [propertyImages, setPropertyImages] = useState([]);
  const [submittingProperty, setSubmittingProperty] = useState(false);

  // Submissions lists State
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await axios.get('/api/users/bookings');
      setBookings(response.data);
    } catch (error) {
      console.log('Failed fetching renter bookings, using empty history.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const response = await axios.get('/api/users/properties/submissions');
      setSubmissions(response.data);
    } catch (error) {
      console.log('Failed fetching property submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchSubmissions();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await axios.put('/api/users/profile', {
        name: profile.name,
        phone: profile.phone,
        currentLocation: profile.currentLocation,
        password: profile.password || undefined
      });
      showToast('Profile updated successfully!', 'success');
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfile(prev => ({ ...prev, password: '' }));
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Property submit handlers
  const handlePropertyChange = (e) => {
    setPropertyForm({ ...propertyForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPropertyImages(e.target.files);
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    setSubmittingProperty(true);

    const data = new FormData();
    Object.keys(propertyForm).forEach((key) => {
      data.append(key, propertyForm[key]);
    });

    if (propertyImages && propertyImages.length > 0) {
      for (let i = 0; i < propertyImages.length; i++) {
        data.append('images', propertyImages[i]);
      }
    }

    try {
      await axios.post('/api/users/properties/submit', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showToast('Property submitted for admin approval! Once approved, you will become an Owner.', 'success');
      // Reset form
      setPropertyForm({
        title: '',
        description: '',
        address: '',
        city: 'Mumbai',
        state: '',
        rentAmount: '',
        propertyType: 'Apartment',
        furnishingStatus: 'Furnished',
        bedrooms: '1',
        bathrooms: '1',
        amenities: '',
      });
      setPropertyImages([]);
      fetchSubmissions(); // Reload submissions list
      setActiveTab('submissions'); // Redirect to submissions tab
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit property', 'error');
    } finally {
      setSubmittingProperty(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
      case 'Approved':
        return <span className="custom-badge badge-success d-flex align-items-center gap-1"><VerifiedUserIcon fontSize="inherit" /> Approved</span>;
      case 'Rejected':
        return <span className="custom-badge badge-danger d-flex align-items-center gap-1"><HighlightOffIcon fontSize="inherit" /> Rejected</span>;
      default:
        return <span className="custom-badge badge-warning d-flex align-items-center gap-1"><HourglassEmptyIcon fontSize="inherit" /> Pending</span>;
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* User Card & Navigation */}
        <div className="col-lg-4 mb-4">
          <div className="glass-card p-4 text-center">
            <div className="mb-3">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="rounded-circle shadow" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              ) : (
                <AccountCircleIcon className="text-secondary" style={{ fontSize: '100px' }} />
              )}
            </div>
            <h4 className="fw-bold mb-1">{user?.name}</h4>
            <span className="custom-badge badge-info mb-4">Tenant Account</span>

            <div className="text-start mt-4 border-top pt-3" style={{ fontSize: '14px' }}>
              <p className="mb-2 text-secondary d-flex align-items-center gap-2"><EmailIcon fontSize="small" /> {user?.email}</p>
              <p className="mb-2 text-secondary d-flex align-items-center gap-2"><PhoneIcon fontSize="small" /> {user?.phone || 'N/A'}</p>
              <p className="mb-0 text-secondary d-flex align-items-center gap-2"><MapsHomeWorkIcon fontSize="small" /> {user?.currentLocation || 'N/A'}</p>
            </div>

            <div className="mt-4 d-grid gap-2">
              <button
                className={`btn py-2.5 text-start px-3 d-flex align-items-center gap-2 ${activeTab === 'bookings' ? 'custom-btn-primary text-white' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('bookings')}
                style={{ borderRadius: '10px' }}
              >
                My Bookings Requests
              </button>
              <button
                className={`btn py-2.5 text-start px-3 d-flex align-items-center gap-2 ${activeTab === 'submissions' ? 'custom-btn-primary text-white' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('submissions')}
                style={{ borderRadius: '10px' }}
              >
                My Listings Submissions
              </button>
              <button
                className={`btn py-2.5 text-start px-3 d-flex align-items-center gap-2 ${activeTab === 'listProperty' ? 'custom-btn-primary text-white' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('listProperty')}
                style={{ borderRadius: '10px' }}
              >
                List Your Property
              </button>
              <button
                className={`btn py-2.5 text-start px-3 d-flex align-items-center gap-2 ${activeTab === 'profile' ? 'custom-btn-primary text-white' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('profile')}
                style={{ borderRadius: '10px' }}
              >
                Edit Profile
              </button>
              <button className="btn btn-outline-danger mt-3 py-2" onClick={onLogout} style={{ borderRadius: '10px' }}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="col-lg-8">
          {/* Active Lease Bookings */}
          {activeTab === 'bookings' && (
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-4 gradient-text">Lease Booking Requests</h4>

              {loadingBookings ? (
                <div className="py-4 text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-secondary mb-3">You haven't requested any property bookings yet.</p>
                  <a href="/" className="btn custom-btn-primary">
                    Browse Properties
                  </a>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle text-dark-theme-toggle">
                    <thead>
                      <tr>
                        <th>Property Details</th>
                        <th>Lease Dates</th>
                        <th>Landlord</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={booking.propertyId?.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=80&q=80'}
                                alt="property"
                                className="rounded"
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              />
                              <div>
                                <span className="fw-bold d-block text-truncate" style={{ maxWidth: '180px' }}>
                                  {booking.propertyId?.title || 'Unknown Property'}
                                </span>
                                <small className="text-secondary">
                                  {booking.propertyId?.city || 'N/A'}, Rent: ${booking.propertyId?.rentAmount}/mo
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="d-block" style={{ fontSize: '13px' }}>
                              From: {new Date(booking.startDate).toLocaleDateString()}
                            </span>
                            <span className="text-secondary" style={{ fontSize: '13px' }}>
                              To: {new Date(booking.endDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '13px' }}>
                              <span className="fw-semibold d-block">
                                {booking.propertyId?.ownerId?.name || 'Owner'}
                              </span>
                              <span className="text-secondary block">
                                Phone: {booking.propertyId?.ownerId?.phone || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td>{getStatusBadge(booking.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Listings Submissions Status */}
          {activeTab === 'submissions' && (
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-4 gradient-text">My Property Listings Submissions</h4>
              <p className="text-secondary" style={{ fontSize: '14px' }}>
                Once approved by the Admin, the house becomes active, and your account upgrades to **Owner**.
              </p>

              {loadingSubmissions ? (
                <div className="py-4 text-center">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-secondary mb-3">You haven't submitted any house listings yet.</p>
                  <button className="btn custom-btn-primary" onClick={() => setActiveTab('listProperty')}>
                    Submit First House
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle text-dark-theme-toggle">
                    <thead>
                      <tr>
                        <th>House Title</th>
                        <th>City / Address</th>
                        <th>Monthly Rent</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub._id}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={sub.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=80&q=80'}
                                alt="property"
                                className="rounded"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                              <span className="fw-bold text-truncate" style={{ maxWidth: '200px' }}>
                                {sub.title}
                              </span>
                            </div>
                          </td>
                          <td>
                            <small className="d-block">{sub.city}</small>
                            <small className="text-secondary">{sub.address}</small>
                          </td>
                          <td>${sub.rentAmount}</td>
                          <td>{getStatusBadge(sub.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* List Property Form */}
          {activeTab === 'listProperty' && (
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-1 gradient-text">Submit House for Verification</h4>
              <p className="text-secondary mb-4" style={{ fontSize: '13px' }}>
                Fill in the details of your property. Admin review is required before approval.
              </p>

              <form onSubmit={handlePropertySubmit}>
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>House Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control custom-input"
                      placeholder="e.g. 2 BHK Modern Flat in Bandra West"
                      value={propertyForm.title}
                      onChange={handlePropertyChange}
                      required
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>House Description</label>
                    <textarea
                      name="description"
                      className="form-control custom-input"
                      rows="3"
                      placeholder="Mention surrounding spots, building details..."
                      value={propertyForm.description}
                      onChange={handlePropertyChange}
                      required
                    ></textarea>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Rent / Month ($)</label>
                    <input
                      type="number"
                      name="rentAmount"
                      className="form-control custom-input"
                      placeholder="45000"
                      value={propertyForm.rentAmount}
                      onChange={handlePropertyChange}
                      required
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Property Type</label>
                    <select name="propertyType" className="form-select custom-input" value={propertyForm.propertyType} onChange={handlePropertyChange}>
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Villa">Villa</option>
                      <option value="PG">PG</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Furnishing Status</label>
                    <select name="furnishingStatus" className="form-select custom-input" value={propertyForm.furnishingStatus} onChange={handlePropertyChange}>
                      <option value="Furnished">Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Street Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control custom-input"
                      placeholder="e.g. Carter Road"
                      value={propertyForm.address}
                      onChange={handlePropertyChange}
                      required
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>City</label>
                    <select name="city" className="form-select custom-input" value={propertyForm.city} onChange={handlePropertyChange}>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Chennai">Chennai</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control custom-input"
                      placeholder="Maharashtra"
                      value={propertyForm.state}
                      onChange={handlePropertyChange}
                      required
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      className="form-control custom-input"
                      min="1"
                      value={propertyForm.bedrooms}
                      onChange={handlePropertyChange}
                      required
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      className="form-control custom-input"
                      min="1"
                      value={propertyForm.bathrooms}
                      onChange={handlePropertyChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Amenities (comma separated)</label>
                    <input
                      type="text"
                      name="amenities"
                      className="form-control custom-input"
                      placeholder="WiFi, Gym, Parking, AC"
                      value={propertyForm.amenities}
                      onChange={handlePropertyChange}
                    />
                  </div>
                  <div className="col-md-12 mb-4">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Select House Photos</label>
                    <div className="d-flex flex-column align-items-center justify-content-center p-3 border border-dashed rounded-3" style={{ background: 'var(--input-bg)', minHeight: '100px' }}>
                      <PhotoCameraIcon className="text-secondary mb-1" />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="form-control custom-input w-50"
                        style={{ fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn custom-btn-primary py-2.5 px-4"
                  disabled={submittingProperty}
                >
                  {submittingProperty ? 'Submitting House...' : 'Submit Listing'}
                </button>
              </form>
            </div>
          )}

          {/* Profile Edit */}
          {activeTab === 'profile' && (
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-4 gradient-text">Edit Profile</h4>
              <form onSubmit={handleProfileSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control custom-input"
                      value={profile.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control custom-input"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="col-md-12 mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Current City</label>
                    <input
                      type="text"
                      name="currentLocation"
                      className="form-control custom-input"
                      value={profile.currentLocation}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="col-md-12 mb-4">
                    <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Update Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control custom-input"
                      placeholder="Enter new strong password"
                      value={profile.password}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn custom-btn-primary px-4"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Save Profile Details'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenterHome;
