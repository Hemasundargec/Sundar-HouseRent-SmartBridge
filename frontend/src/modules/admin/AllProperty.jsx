import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AllProperty = ({ showToast }) => {
  const [properties, setProperties] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admins/properties');
      // Filter out pending from the main list so they are separated neatly
      const activeList = response.data.filter(p => p.status !== 'Pending');
      setProperties(activeList);
    } catch (error) {
      console.log('Failed fetching properties list, loading mocks.');
      setProperties([
        {
          _id: 'temp-2',
          title: 'Skyline Penthouse Bandra',
          rentAmount: 120000,
          propertyType: 'Apartment',
          status: 'Booked',
          city: 'Mumbai',
          ownerId: { name: 'Bruce Wayne', email: 'bruce@gmail.com' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingProperties = async () => {
    setLoadingPending(true);
    try {
      const response = await axios.get('/api/admins/properties/pending');
      setPendingProperties(response.data);
    } catch (error) {
      console.log('Failed fetching pending properties, loading mocks.');
      setPendingProperties([
        {
          _id: 'temp-1',
          title: 'Imperial Glass Villa',
          rentAmount: 75000,
          propertyType: 'Villa',
          status: 'Pending',
          city: 'Bangalore',
          ownerId: { name: 'Diana Prince', email: 'diana@gmail.com', phone: '9876543210' }
        }
      ]);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchPendingProperties();
  }, []);

  const handleApproveProperty = async (id) => {
    try {
      const response = await axios.put(`/api/admins/properties/${id}/approve`);
      showToast(response.data.message || 'Property approved successfully!', 'success');
      fetchProperties();
      fetchPendingProperties();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error approving property listing', 'error');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property listing? This will cancel all bookings.')) {
      try {
        await axios.delete(`/api/admins/properties/${id}`);
        showToast('Property listing deleted successfully', 'success');
        fetchProperties();
        fetchPendingProperties();
      } catch (err) {
        showToast('Error deleting property listing', 'error');
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Audit Listed Properties</h2>
        <p className="text-secondary">Verify new submissions, review status, or remove listings</p>
      </div>

      {/* Section 1: Pending Approvals Queue */}
      <div className="mb-5">
        <h4 className="fw-bold mb-3 text-warning">Awaiting Verification Queue ({pendingProperties.length})</h4>
        {loadingPending ? (
          <div className="text-center py-4 glass-card">
            <div className="spinner-border text-warning" role="status"></div>
          </div>
        ) : pendingProperties.length === 0 ? (
          <div className="text-center py-4 glass-card">
            <p className="text-secondary mb-0">No property submissions awaiting approval.</p>
          </div>
        ) : (
          <div className="glass-card p-4 border border-warning" style={{ borderStyle: 'dashed !important' }}>
            <div className="table-responsive">
              <table className="table align-middle text-dark-theme-toggle">
                <thead>
                  <tr>
                    <th>Submitting House</th>
                    <th>Location Details</th>
                    <th>Rent</th>
                    <th>Submitted By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProperties.map((prop) => (
                    <tr key={prop._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={prop.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=80&q=80'}
                            alt="property"
                            className="rounded"
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                          <span className="fw-bold">{prop.title}</span>
                        </div>
                      </td>
                      <td>
                        <small className="d-block">{prop.city}, {prop.state}</small>
                        <small className="text-secondary">{prop.address}</small>
                      </td>
                      <td>${prop.rentAmount}/mo</td>
                      <td>
                        <span className="fw-semibold d-block">{prop.ownerId?.name}</span>
                        <small className="text-secondary">{prop.ownerId?.email}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-success d-flex align-items-center gap-1 py-1.5 px-3"
                            onClick={() => handleApproveProperty(prop._id)}
                            style={{ borderRadius: '8px' }}
                          >
                            <CheckCircleIcon fontSize="inherit" /> Approve & List
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger p-1.5"
                            onClick={() => handleDeleteProperty(prop._id)}
                            title="Reject Submission"
                            style={{ borderRadius: '8px' }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Active Properties Audit List */}
      <div>
        <h4 className="fw-bold mb-3">Active Listings database</h4>
        {loading ? (
          <div className="text-center py-5 glass-card">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-5 glass-card">
            <p className="text-secondary mb-0">No active listings in database.</p>
          </div>
        ) : (
          <div className="glass-card p-4">
            <div className="table-responsive">
              <table className="table align-middle text-dark-theme-toggle">
                <thead>
                  <tr>
                    <th>House Title</th>
                    <th>Location</th>
                    <th>Monthly Rent</th>
                    <th>House Type</th>
                    <th>Listed By (Owner)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property._id}>
                      <td>
                        <span className="fw-bold d-block text-truncate" style={{ maxWidth: '240px' }}>
                          {property.title}
                        </span>
                      </td>
                      <td>{property.city}</td>
                      <td>${property.rentAmount}</td>
                      <td>{property.propertyType}</td>
                      <td>
                        <span className="fw-semibold d-block">{property.ownerId?.name || 'Owner'}</span>
                        <small className="text-secondary">{property.ownerId?.email}</small>
                      </td>
                      <td>
                        <span className={`custom-badge ${property.status === 'Available' ? 'badge-success' : property.status === 'Booked' ? 'badge-warning' : 'badge-danger'}`}>
                          {property.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger p-1"
                          onClick={() => handleDeleteProperty(property._id)}
                          title="Delete Property Listing"
                          style={{ borderRadius: '6px' }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProperty;
