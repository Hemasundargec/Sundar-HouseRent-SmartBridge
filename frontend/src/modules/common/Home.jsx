import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const FALLBACK_PROPERTIES = [
  {
    _id: 'temp-1',
    title: 'Imperial Glass Villa',
    description: 'A premium architectural villa with a private swimming pool, terrace garden, and premium brass fittings. Located in Bengaluru\'s prime Indiranagar neighborhood.',
    address: '12th Main Road, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    rentAmount: 75000,
    propertyType: 'Villa',
    furnishingStatus: 'Furnished',
    bedrooms: 4,
    bathrooms: 4.5,
    amenities: ['Pool', 'Gym', 'WiFi', 'Parking', 'Home Theater', 'Power Backup'],
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
    status: 'Available',
    ownerId: { name: 'Arjun Mehta', email: 'arjun@gmail.com', phone: '9876543210' }
  },
  {
    _id: 'temp-2',
    title: 'Skyline Penthouse Bandra',
    description: 'Sea-facing high-rise penthouse with double-height ceiling, panoramic glass walls, private elevator, and modular kitchen. Located in Mumbai\'s upscale Bandra West.',
    address: 'Carter Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    rentAmount: 120000,
    propertyType: 'Apartment',
    furnishingStatus: 'Furnished',
    bedrooms: 3,
    bathrooms: 3,
    amenities: ['Concierge', 'Gym', 'WiFi', 'Rooftop Access', 'Sea View'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    status: 'Available',
    ownerId: { name: 'Rajesh Khanna', email: 'rajesh@gmail.com', phone: '9812345678' }
  },
  {
    _id: 'temp-3',
    title: 'Elegant Heritage Bungalow',
    description: 'Luxury colonial-style villa featuring a sprawling private courtyard, marble flooring, high ceilings, and 24/7 security. Prime location in Hyderabad\'s Jubilee Hills.',
    address: 'Road No. 36, Jubilee Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    rentAmount: 95000,
    propertyType: 'House',
    furnishingStatus: 'Semi-Furnished',
    bedrooms: 3,
    bathrooms: 3,
    amenities: ['Garden', 'Fireplace', 'Parking', 'WiFi', 'Servant Quarters'],
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
    status: 'Available',
    ownerId: { name: 'Vikram Reddy', email: 'vikram@gmail.com', phone: '9900112233' }
  }
];

const Home = ({ user, showToast }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [rentMax, setRentMax] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');

  // Selected property for details modal
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Booking dates
  const [bookingDates, setBookingDates] = useState({
    startDate: '',
    endDate: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (city) params.city = city;
      if (propertyType) params.propertyType = propertyType;
      if (rentMax) params.rentMax = rentMax;
      if (bedrooms) params.bedrooms = bedrooms;
      if (bathrooms) params.bathrooms = bathrooms;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get('/api/users/properties', { params });
      setProperties(response.data);
    } catch (error) {
      console.log('Failed fetching from DB, using fallback mock properties.', error);
      // Local filtering
      let filtered = [...FALLBACK_PROPERTIES];
      if (city) filtered = filtered.filter(p => p.city.toLowerCase().includes(city.toLowerCase()));
      if (propertyType) filtered = filtered.filter(p => p.propertyType === propertyType);
      if (rentMax) filtered = filtered.filter(p => p.rentAmount <= Number(rentMax));
      if (bedrooms) filtered = filtered.filter(p => p.bedrooms === Number(bedrooms));
      if (bathrooms) filtered = filtered.filter(p => p.bathrooms >= Number(bathrooms));
      if (searchQuery) {
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setProperties(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [city, propertyType, rentMax, bedrooms, bathrooms]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to request a booking', 'warning');
      return;
    }
    if (user.role !== 'Tenant' && user.role !== 'Owner') {
      showToast('Only Tenant or Owner accounts can book properties', 'error');
      return;
    }
    const propertyOwnerId = selectedProperty.ownerId?._id || selectedProperty.ownerId;
    if (propertyOwnerId === user._id) {
      showToast('You cannot book your own property listing', 'error');
      return;
    }
    if (!bookingDates.startDate || !bookingDates.endDate) {
      showToast('Please enter both start and end booking dates', 'warning');
      return;
    }

    setBookingLoading(true);
    try {
      await axios.post('/api/users/bookings', {
        propertyId: selectedProperty._id,
        startDate: bookingDates.startDate,
        endDate: bookingDates.endDate
      });
      showToast('Booking request sent successfully to the property owner!', 'success');
      setSelectedProperty(null);
      setBookingDates({ startDate: '', endDate: '' });
    } catch (error) {
      showToast(error.response?.data?.message || 'Error processing booking', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      
      {/* Premium Split-Hero Section */}
      <section className="py-5 d-flex align-items-center" style={{ minHeight: '75vh', position: 'relative' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            {/* Left Column: Heading and Subtitle */}
            <div className="col-lg-6">
              <span className="custom-badge badge-info mb-3">Premium Living Redefined</span>
              <h1 className="display-4 fw-extrabold Outfit text-dark-theme-toggle mb-3" style={{ lineHeight: '1.2' }}>
                Discover Your <br />
                <span className="gradient-text">Dream Luxury House</span>
              </h1>
              <p className="text-secondary lead mb-4" style={{ fontSize: '18px', fontWeight: '400' }}>
                Find verified luxury houses, villas, and apartments in India's prime hotspots. Connect directly with owners with fully automated lease contracts.
              </p>

              {/* Floating search pill */}
              <form onSubmit={handleSearchSubmit} className="glass-container p-3 mb-2 d-flex align-items-center gap-2">
                <div className="d-flex align-items-center flex-grow-1 px-2">
                  <SearchIcon style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    className="form-control bg-transparent border-0 text-dark-theme-toggle"
                    placeholder="Search by neighborhood, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
                <button type="submit" className="btn custom-btn-primary px-4 py-2.5">
                  Find House
                </button>
              </form>
            </div>

            {/* Right Column: Hero Graphic Image */}
            <div className="col-lg-6 d-none d-lg-block">
              <div style={{ position: 'relative' }}>
                {/* Decorative gold background circle */}
                <div 
                  className="position-absolute rounded-circle opacity-10" 
                  style={{ width: '450px', height: '450px', backgroundColor: 'var(--primary-color)', top: '-50px', right: '-30px', filter: 'blur(80px)', zIndex: 1 }}
                ></div>
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                  alt="Premium Luxury Villa"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ 
                    position: 'relative', 
                    zIndex: 2, 
                    transform: 'perspective(800px) rotateY(-5deg)',
                    border: '1px solid var(--border-color)',
                    maxHeight: '440px',
                    width: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Horizontal Filter Bar */}
      <section className="py-4 border-top border-bottom" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="row g-3 align-items-center">
            {/* Indicator label */}
            <div className="col-lg-2 col-md-12 d-flex align-items-center gap-2">
              <FilterAltIcon style={{ color: 'var(--primary-color)' }} />
              <h6 className="fw-bold mb-0 text-dark-theme-toggle">Quick Filters</h6>
            </div>

            {/* Filters selectors */}
            <div className="col-lg-10 col-md-12">
              <div className="row g-2">
                <div className="col-md-3">
                  <select 
                    className="form-select custom-input py-2" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">All Indian Cities</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <select 
                    className="form-select custom-input py-2" 
                    value={propertyType} 
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">All House Types</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Villa">Villa</option>
                    <option value="PG">PG</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <select 
                    className="form-select custom-input py-2" 
                    value={bedrooms} 
                    onChange={(e) => setBedrooms(e.target.value)}
                    style={{ fontSize: '14px' }}
                  >
                    <option value="">Bedrooms</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                  </select>
                </div>

                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control custom-input py-2"
                    placeholder="Max Rent"
                    value={rentMax}
                    onChange={(e) => setRentMax(e.target.value)}
                    style={{ fontSize: '14px' }}
                  />
                </div>

                <div className="col-md-2">
                  <button 
                    onClick={() => { setCity(''); setPropertyType(''); setRentMax(''); setBedrooms(''); setBathrooms(''); setSearchQuery(''); }}
                    className="btn btn-outline-secondary py-2 w-100"
                    style={{ borderRadius: '12px', fontSize: '14px', fontWeight: '500' }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0 text-dark-theme-toggle">Exclusive Properties</h3>
            <span className="text-secondary fw-medium" style={{ fontSize: '14px' }}>
              Showing {properties.length} results
            </span>
          </div>

          {loading ? (
            <div className="row g-4">
              {[1, 2, 3].map((n) => (
                <div className="col-md-4" key={n}>
                  <div className="glass-card" style={{ height: '380px' }}>
                    <div className="skeleton" style={{ height: '200px', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}></div>
                    <div className="p-4">
                      <div className="skeleton mb-2" style={{ height: '22px', width: '80%' }}></div>
                      <div className="skeleton mb-3" style={{ height: '15px', width: '50%' }}></div>
                      <div className="skeleton" style={{ height: '40px', borderRadius: '12px' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-5 glass-card">
              <h5 className="text-secondary mb-2">No properties match your filter preferences.</h5>
              <button onClick={() => { setCity(''); setPropertyType(''); setRentMax(''); setBedrooms(''); setBathrooms(''); setSearchQuery(''); }} className="btn custom-btn-primary mt-2">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {properties.map((property) => (
                <div className="col-md-4 col-sm-6" key={property._id}>
                  <div className="glass-card h-100 d-flex flex-column overflow-hidden">
                    <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
                      <img
                        src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                        alt={property.title}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover', transition: 'transform 0.4s ease-out' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <span className="position-absolute top-0 end-0 m-3 custom-badge badge-info shadow">
                        {property.propertyType}
                      </span>
                      <div className="position-absolute bottom-0 start-0 m-3 px-3 py-1.5 glass-container text-white fw-bold shadow">
                        ${property.rentAmount}/mo
                      </div>
                    </div>

                    <div className="p-4 d-flex flex-column flex-grow-1">
                      <h5 className="fw-bold mb-1 text-dark-theme-toggle text-truncate" title={property.title}>
                        {property.title}
                      </h5>
                      <p className="text-secondary d-flex align-items-center gap-1 mb-3" style={{ fontSize: '13px' }}>
                        <FmdGoodIcon fontSize="small" className="text-danger" /> {property.city}, {property.state}
                      </p>

                      <div className="d-flex justify-content-between mb-4 border-top border-bottom py-2" style={{ fontSize: '13px' }}>
                        <span className="d-flex align-items-center gap-1 text-secondary">
                          <HotelIcon fontSize="small" /> {property.bedrooms} BHK
                        </span>
                        <span className="d-flex align-items-center gap-1 text-secondary">
                          <BathtubIcon fontSize="small" /> {property.bathrooms} Baths
                        </span>
                        <span className="text-secondary fw-semibold">
                          {property.furnishingStatus}
                        </span>
                      </div>

                      <button
                        className="btn custom-btn-primary w-100 mt-auto py-2.5"
                        onClick={() => { setSelectedProperty(property); }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
            <div className="modal-content glass-card border-0 text-dark-theme-toggle" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-bottom-0 pb-0 d-flex justify-content-between">
                <h5 className="modal-title fw-bold text-dark-theme-toggle">{selectedProperty.title}</h5>
                <button type="button" className="btn-close" onClick={() => { setSelectedProperty(null); }}></button>
              </div>

              <div className="modal-body p-4 text-dark-theme-toggle">
                <div className="row">
                  {/* Left Column: Image & Details */}
                  <div className="col-md-7 mb-3">
                    <img
                      src={selectedProperty.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                      alt={selectedProperty.title}
                      className="w-100 rounded-3 mb-3 shadow-sm"
                      style={{ height: '300px', objectFit: 'cover' }}
                    />
                    <h6 className="fw-bold mb-2 text-dark-theme-toggle">Description</h6>
                    <p className="text-secondary" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {selectedProperty.description}
                    </p>

                    <h6 className="fw-bold mb-2 mt-4 text-dark-theme-toggle">Amenities</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedProperty.amenities.map((amenity, i) => (
                        <span key={i} className="custom-badge badge-info" style={{ fontSize: '10px' }}>
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Booking panel */}
                  <div className="col-md-5">
                    <div className="glass-container p-4 mb-4 border" style={{ borderColor: 'var(--border-color)' }}>
                      <h4 className="fw-bold gradient-text mb-3">${selectedProperty.rentAmount}/mo</h4>
                      <p className="text-secondary" style={{ fontSize: '13px' }}>
                        Address: <strong>{selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}</strong>
                      </p>

                      <hr style={{ color: 'var(--border-color)' }} />

                      <form onSubmit={handleBooking}>
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark-theme-toggle">
                          <CalendarMonthIcon style={{ color: 'var(--primary-color)' }} /> Request Booking
                        </h6>

                        <div className="mb-3">
                          <label className="form-label text-secondary" style={{ fontSize: '12px' }}>Start Lease Date</label>
                          <input
                            type="date"
                            className="form-control custom-input"
                            value={bookingDates.startDate}
                            onChange={(e) => setBookingDates({ ...bookingDates, startDate: e.target.value })}
                            required
                          />
                        </div>

                        <div className="mb-4">
                          <label className="form-label text-secondary" style={{ fontSize: '12px' }}>End Lease Date</label>
                          <input
                            type="date"
                            className="form-control custom-input"
                            value={bookingDates.endDate}
                            onChange={(e) => setBookingDates({ ...bookingDates, endDate: e.target.value })}
                            required
                          />
                        </div>

                        {user ? (
                          <button
                            type="submit"
                            className="btn custom-btn-accent w-100 py-2.5"
                            disabled={bookingLoading}
                          >
                            {bookingLoading ? 'Sending request...' : 'Book House'}
                          </button>
                        ) : (
                          <div className="text-center">
                            <Link to="/login" className="btn custom-btn-primary w-100 py-2.5">
                              Login to Book
                            </Link>
                            <span className="text-secondary mt-2 d-inline-block" style={{ fontSize: '12px' }}>
                              Verification is required for bookings.
                            </span>
                          </div>
                        )}
                      </form>
                    </div>

                    <div className="p-3 border rounded-3" style={{ borderColor: 'var(--border-color)' }}>
                      <h6 className="fw-bold mb-2 text-dark-theme-toggle">Listed By</h6>
                      <p className="mb-1 fw-semibold text-dark-theme-toggle text-truncate">{selectedProperty.ownerId?.name || 'Owner'}</p>
                      <p className="mb-1 text-secondary" style={{ fontSize: '12px' }}>Email: {selectedProperty.ownerId?.email}</p>
                      <p className="mb-0 text-secondary" style={{ fontSize: '12px' }}>Phone: {selectedProperty.ownerId?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
