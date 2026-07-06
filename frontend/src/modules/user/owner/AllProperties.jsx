import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AllPropertiesCards from '../AllPropertiesCards';
import EditIcon from '@mui/icons-material/Edit';

const AllProperties = ({ showToast }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    rentAmount: '',
    propertyType: '',
    furnishingStatus: '',
    status: '',
    bedrooms: '',
    bathrooms: '',
    amenities: '',
  });

  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/owners/properties');
      setProperties(res.data);
    } catch (err) {
      console.log('Failed fetching owner properties, using fallback mock.');
      setProperties([
        {
          _id: 'temp-1',
          title: 'Imperial Glass Villa',
          description: 'A beautiful architectural masterpiece with a pool.',
          address: '12th Main Road, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          rentAmount: 75000,
          propertyType: 'Villa',
          furnishingStatus: 'Furnished',
          bedrooms: 4,
          bathrooms: 4.5,
          amenities: ['Pool', 'Gym', 'WiFi'],
          images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
          status: 'Available'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleEditClick = (property) => {
    setEditingProperty(property);
    setEditFormData({
      title: property.title,
      description: property.description,
      rentAmount: property.rentAmount,
      propertyType: property.propertyType,
      furnishingStatus: property.furnishingStatus,
      status: property.status,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      amenities: property.amenities.join(', '),
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/owners/properties/${editingProperty._id}`, editFormData);
      showToast('Property updated successfully!', 'success');
      setEditingProperty(null);
      loadProperties();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating property', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property? This will cancel all bookings.')) {
      try {
        await axios.delete(`/api/owners/properties/${id}`);
        showToast('Property deleted successfully', 'success');
        loadProperties();
      } catch (err) {
        showToast('Error deleting property', 'error');
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Your Listed Properties</h2>
        <p className="text-secondary">Manage availability status, details, and delete entries</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-5 glass-card">
          <p className="text-secondary">You haven't listed any houses yet.</p>
        </div>
      ) : (
        <AllPropertiesCards
          properties={properties}
          isOwner={true}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}

      {/* Edit Modal */}
      {editingProperty && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card text-dark-theme-toggle" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <div className="modal-header border-0 pb-0 d-flex justify-content-between">
                <h5 className="modal-title fw-bold">Edit Property Details</h5>
                <button type="button" className="btn-close" onClick={() => setEditingProperty(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '12px' }}>Title</label>
                    <input type="text" name="title" className="form-control custom-input" value={editFormData.title} onChange={handleEditChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary" style={{ fontSize: '12px' }}>Description</label>
                    <textarea name="description" className="form-control custom-input" rows="3" value={editFormData.description} onChange={handleEditChange} required></textarea>
                  </div>
                  <div className="row g-2">
                    <div className="col-6 mb-3">
                      <label className="form-label text-secondary" style={{ fontSize: '12px' }}>Rent ($)</label>
                      <input type="number" name="rentAmount" className="form-control custom-input" value={editFormData.rentAmount} onChange={handleEditChange} required />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label text-secondary" style={{ fontSize: '12px' }}>Availability</label>
                      <select name="status" className="form-select custom-input" value={editFormData.status} onChange={handleEditChange}>
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col-6 mb-3">
                      <label className="form-label text-secondary" style={{ fontSize: '12px' }}>Bedrooms</label>
                      <input type="number" name="bedrooms" className="form-control custom-input" value={editFormData.bedrooms} onChange={handleEditChange} required />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label text-secondary" style={{ fontSize: '12px' }}>Bathrooms</label>
                      <input type="number" name="bathrooms" className="form-control custom-input" value={editFormData.bathrooms} onChange={handleEditChange} required />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditingProperty(null)}>Cancel</button>
                  <button type="submit" className="btn custom-btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProperties;
