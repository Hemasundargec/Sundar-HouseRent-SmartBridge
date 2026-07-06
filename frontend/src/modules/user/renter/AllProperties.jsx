import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AllPropertiesCards from '../AllPropertiesCards';
import SearchIcon from '@mui/icons-material/Search';

const AllProperties = ({ showToast }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const loadProperties = async () => {
    setLoading(true);
    try {
      const params = { status: 'Available' };
      if (search) params.search = search;
      if (city) params.city = city;
      
      const res = await axios.get('/api/users/properties', { params });
      setProperties(res.data);
    } catch (err) {
      console.error(err);
      showToast('Error loading properties list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [city]);

  return (
    <div className="container py-5">
      <div className="glass-card p-4 mb-4">
        <h4 className="fw-bold mb-3 gradient-text">Explore Available Rental Houses</h4>
        <form onSubmit={(e) => { e.preventDefault(); loadProperties(); }} className="row g-2">
          <div className="col-md-7">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderColor: 'var(--border-color)', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                <SearchIcon fontSize="small" />
              </span>
              <input
                type="text"
                className="form-control custom-input border-start-0 w-75"
                placeholder="Search location, amenities, title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select custom-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn custom-btn-primary w-100 py-2.5">
              Search
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-5 glass-card">
          <p className="text-secondary">No houses currently listed as available in this sector.</p>
        </div>
      ) : (
        <AllPropertiesCards
          properties={properties}
          actionLabel="Book House"
          onAction={(property) => {
            // Trigger redirection to home details/booking section or quick booking logic
            window.location.href = `/?search=${property.title}`;
          }}
        />
      )}
    </div>
  );
};

export default AllProperties;
