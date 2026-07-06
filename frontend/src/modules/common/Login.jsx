import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const Login = ({ setUser, showToast }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false);
    
    if (!formData.email || !formData.password) {
      showToast('Please enter email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/users/login', formData);
      const user = response.data;
      
      // Save auth token & details locally
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      
      // Set parent app state
      setUser(user);
      
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      // Role based routing redirects
      if (user.role === 'Admin') {
        navigate('/admin');
      } else if (user.role === 'Owner') {
        navigate('/owner');
      } else {
        navigate('/renter');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Login failed, check credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-container auth-card">
        <div className="text-center mb-4">
          <h2 className="fw-bold gradient-text">Welcome Back</h2>
          <p className="text-secondary" style={{ fontSize: '14px' }}>Sign in to manage your house hunting</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderColor: 'var(--border-color)' }}>
                <MailOutlineIcon fontSize="small" />
              </span>
              <input
                type="email"
                name="email"
                className="form-control custom-input border-start-0 w-75"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Password</label>
              <Link to="/forgot-password" style={{ color: 'var(--primary-color)', fontSize: '13px', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderColor: 'var(--border-color)' }}>
                <LockOpenIcon fontSize="small" />
              </span>
              <input
                type="password"
                name="password"
                className="form-control custom-input border-start-0 w-75"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn custom-btn-primary w-100 py-3 mb-3 d-flex align-items-center justify-content-center"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-3" style={{ fontSize: '14px' }}>
          <span className="text-secondary">Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
