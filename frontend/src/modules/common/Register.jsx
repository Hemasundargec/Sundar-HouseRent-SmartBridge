import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CheckIcon from '@mui/icons-material/Check';
import KeyIcon from '@mui/icons-material/Key';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';

const Register = ({ showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Tenant',
    verificationCode: '',
    currentLocation: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState(''); // Store simulated code for easy local copy-paste

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      showToast('Please enter an email address first', 'warning');
      return;
    }

    setLoadingOtp(true);
    try {
      const response = await axios.post('/api/users/send-otp', { email: formData.email });
      setOtpSent(true);
      showToast(response.data.message || 'Verification code sent!', 'success');
      
      // In development mode, the backend returns otpCode for immediate testing convenience
      if (response.data.otpCode) {
        setSimulatedOtp(response.data.otpCode);
        setFormData(prev => ({ ...prev, verificationCode: response.data.otpCode }));
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error sending verification code', 'error');
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      showToast('Please request a verification code first', 'warning');
      return;
    }

    setLoadingRegister(true);
    try {
      await axios.post('/api/users/register', formData);
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (error) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-container auth-card">
        <div className="text-center mb-4">
          <h2 className="fw-bold gradient-text">Create Account</h2>
          <p className="text-secondary" style={{ fontSize: '14px' }}>Join HouseHunt today</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Toggle */}
          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Register As</label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn flex-fill py-2 d-flex align-items-center justify-content-center gap-2 ${formData.role === 'Tenant' ? 'custom-btn-primary' : 'btn-outline-secondary'}`}
                style={{ borderRadius: '10px' }}
                onClick={() => setFormData({ ...formData, role: 'Tenant' })}
              >
                Tenant
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 d-flex align-items-center justify-content-center gap-2 ${formData.role === 'Owner' ? 'custom-btn-primary' : 'btn-outline-secondary'}`}
                style={{ borderRadius: '10px' }}
                onClick={() => setFormData({ ...formData, role: 'Owner' })}
              >
                Owner
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderColor: 'var(--border-color)' }}>
                <PersonOutlineIcon fontSize="small" />
              </span>
              <input
                type="text"
                name="name"
                className="form-control custom-input border-start-0 w-75"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Email Address (Gmail)</label>
            <div className="d-flex gap-2">
              <div className="input-group flex-grow-1">
                <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderColor: 'var(--border-color)' }}>
                  <MailOutlineIcon fontSize="small" />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control custom-input border-start-0 w-75"
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={otpSent}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                />
              </div>
              <button
                type="button"
                className="btn custom-btn-accent py-2 px-3 text-nowrap"
                style={{ borderRadius: '10px' }}
                onClick={handleSendOtp}
                disabled={loadingOtp || otpSent || !formData.email}
              >
                {loadingOtp ? 'Sending...' : otpSent ? 'Sent ✓' : 'Send Code'}
              </button>
            </div>
          </div>

          {/* OTP Code */}
          {otpSent && (
            <div className="mb-3">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Gmail Verification Code</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderColor: 'var(--border-color)' }}>
                  <KeyIcon fontSize="small" />
                </span>
                <input
                  type="text"
                  name="verificationCode"
                  className="form-control custom-input border-start-0 w-75"
                  placeholder="Enter 6 digit code"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  required
                  maxLength={6}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                />
              </div>
              {simulatedOtp && (
                <div className="form-text text-success" style={{ fontSize: '12px' }}>
                  Testing OTP code pre-filled from console simulation.
                </div>
              )}
            </div>
          )}

          {/* Phone Number */}
          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Phone Number</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderColor: 'var(--border-color)' }}>
                <PhoneAndroidIcon fontSize="small" />
              </span>
              <input
                type="tel"
                name="phone"
                className="form-control custom-input border-start-0 w-75"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            </div>
          </div>

          {/* Current Location */}
          <div className="mb-3">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Current City</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderColor: 'var(--border-color)' }}>
                <MapsHomeWorkIcon fontSize="small" />
              </span>
              <input
                type="text"
                name="currentLocation"
                className="form-control custom-input border-start-0 w-75"
                placeholder="e.g. Mumbai, Bangalore"
                value={formData.currentLocation}
                onChange={handleChange}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderColor: 'var(--border-color)' }}>
                <LockOpenIcon fontSize="small" />
              </span>
              <input
                type="password"
                name="password"
                className="form-control custom-input border-start-0 w-75"
                placeholder="Choose a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn custom-btn-primary w-100 py-3 mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={loadingRegister}
          >
            {loadingRegister ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-3" style={{ fontSize: '14px' }}>
          <span className="text-secondary">Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
