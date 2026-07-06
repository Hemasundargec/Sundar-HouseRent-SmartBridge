import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const ForgotPassword = ({ showToast }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'warning');
      return;
    }
    setLoading(true);
    // Simulate reset email trigger
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      showToast('Password reset link sent to your email', 'success');
    }, 1500);
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-container auth-card">
        <div className="text-center mb-4">
          <h2 className="fw-bold gradient-text">Reset Password</h2>
          <p className="text-secondary" style={{ fontSize: '14px' }}>We'll send you instructions to reset your password</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label text-secondary" style={{ fontSize: '13px' }}>Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-secondary" style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', borderColor: 'var(--border-color)' }}>
                  <MailOutlineIcon fontSize="small" />
                </span>
                <input
                  type="email"
                  className="form-control custom-input border-start-0 w-75"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="mb-3 text-success" style={{ fontSize: '48px' }}>✓</div>
            <h5 className="fw-bold text-primary">Instructions Sent</h5>
            <p className="text-secondary mt-2" style={{ fontSize: '14px' }}>
              Please check your Gmail inbox at <strong>{email}</strong> for instructions on completing the password reset.
            </p>
          </div>
        )}

        <div className="text-center mt-3" style={{ fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
