import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddProperty = ({ showToast }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    rentAmount: '',
    propertyType: 'Apartment',
    furnishingStatus: 'Furnished',
    bedrooms: '1',
    bathrooms: '1',
    amenities: '',
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
      await axios.post('/api/owners/properties', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showToast('Property listed successfully!', 'success');
      navigate('/owner');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed listing property', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-1 py-2 px-3 mb-3"
          onClick={() => navigate('/owner')}
          style={{ borderRadius: '10px' }}
        >
          <ArrowBackIcon fontSize="small" /> Back to Dashboard
        </button>
        <h2 className="fw-bold mb-1 gradient-text">Add New Rental House</h2>
        <p className="text-secondary">Provide details to list your property on HouseHunt</p>
      </div>

      <div className="glass-card p-4">
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Property Title */}
            <div className="col-md-12 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Property Title</label>
              <input
                type="text"
                name="title"
                className="form-control custom-input"
                placeholder="e.g. Spacious Luxury Apartment near Downtown"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="col-md-12 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Property Description</label>
              <textarea
                name="description"
                className="form-control custom-input"
                rows="4"
                placeholder="Describe key highlights, surrounding environment, lease requirements, etc."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Rent, Type & Furnishing */}
            <div className="col-md-4 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Monthly Rent ($)</label>
              <input
                type="number"
                name="rentAmount"
                className="form-control custom-input"
                placeholder="2500"
                value={formData.rentAmount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Property Type</label>
              <select name="propertyType" className="form-select custom-input" value={formData.propertyType} onChange={handleChange}>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Villa">Villa</option>
                <option value="PG">PG</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Furnishing Status</label>
              <select name="furnishingStatus" className="form-select custom-input" value={formData.furnishingStatus} onChange={handleChange}>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            {/* Address */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Street Address</label>
              <input
                type="text"
                name="address"
                className="form-control custom-input"
                placeholder="123 Main St"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>City</label>
              <input
                type="text"
                name="city"
                className="form-control custom-input"
                placeholder="Los Angeles"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>State</label>
              <input
                type="text"
                name="state"
                className="form-control custom-input"
                placeholder="CA"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            {/* Beds & Baths */}
            <div className="col-md-3 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                className="form-control custom-input"
                min="1"
                value={formData.bedrooms}
                onChange={handleChange}
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
                step="0.5"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
            </div>

            {/* Amenities */}
            <div className="col-md-6 mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Amenities (comma-separated)</label>
              <input
                type="text"
                name="amenities"
                className="form-control custom-input"
                placeholder="e.g. WiFi, Pool, Parking, Gym, AC"
                value={formData.amenities}
                onChange={handleChange}
              />
            </div>

            {/* Image Uploads */}
            <div className="col-md-12 mb-4">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Property Photos</label>
              <div className="d-flex flex-column align-items-center justify-content-center p-4 border border-dashed rounded-3 text-center" style={{ borderColor: 'var(--border-color)', minHeight: '140px', background: 'var(--input-bg)' }}>
                <PhotoCameraIcon className="text-secondary mb-2" style={{ fontSize: '40px' }} />
                <p className="text-secondary mb-2" style={{ fontSize: '14px' }}>Select multiple images of your house</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control custom-input w-50"
                  style={{ fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn custom-btn-primary py-3 px-5 d-flex align-items-center gap-2"
            disabled={loading}
          >
            {loading ? 'Creating Listing...' : 'Publish Property Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
