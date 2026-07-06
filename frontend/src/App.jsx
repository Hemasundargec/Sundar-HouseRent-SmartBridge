import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

// Icons
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VillaIcon from '@mui/icons-material/Villa';

// Common Components
import Home from './modules/common/Home';
import Login from './modules/common/Login';
import Register from './modules/common/Register';
import ForgotPassword from './modules/common/ForgotPassword';
import Toast from './modules/common/Toast';

// Renter Components
import RenterHome from './modules/user/renter/RenterHome';
import RenterAllProperties from './modules/user/renter/AllProperties';

// Owner Components
import OwnerHome from './modules/user/owner/OwnerHome';
import OwnerAddProperty from './modules/user/owner/AddProperty';
import OwnerAllProperties from './modules/user/owner/AllProperties';
import OwnerAllBookings from './modules/user/owner/AllBookings';

// Admin Components
import AdminHome from './modules/admin/AdminHome';
import AdminAllUsers from './modules/admin/AllUsers';
import AdminAllProperty from './modules/admin/AllProperty';
import AdminAllBookings from './modules/admin/AllBookings';

const Navigation = ({ user, theme, toggleTheme, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLinkActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar sticky-top navbar-dark py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <VillaIcon style={{ color: 'var(--primary-color)', fontSize: '28px' }} />
          <span className="fw-bold Outfit text-dark-theme-toggle" style={{ letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
            House<span style={{ color: 'var(--primary-color)' }}>Hunt</span>
          </span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-2">
            <li className="nav-item">
              <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/')}`} to="/">
                Explore Homes
              </Link>
            </li>

            {/* Renter Specific Links */}
            {user?.role === 'Tenant' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/renter')}`} to="/renter">
                    Tenant Hub
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/renter/properties')}`} to="/renter/properties">
                    Rent Houses
                  </Link>
                </li>
              </>
            )}

            {/* Owner Specific Links */}
            {user?.role === 'Owner' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/owner')}`} to="/owner">
                    Landlord Hub
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/owner/properties')}`} to="/owner/properties">
                    My Houses
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/owner/bookings')}`} to="/owner/bookings">
                    Booking Requests
                  </Link>
                </li>
              </>
            )}

            {/* Admin Specific Links */}
            {user?.role === 'Admin' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/admin')}`} to="/admin">
                    Admin Stats
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/admin/users')}`} to="/admin/users">
                    Users List
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/admin/properties')}`} to="/admin/properties">
                    Audit Houses
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link px-3 sidebar-nav-link ${isLinkActive('/admin/bookings')}`} to="/admin/bookings">
                    Lease Logs
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle Sun Moon Theme"
            >
              {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-secondary d-none d-lg-inline" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  Hello, <strong>{user.name}</strong>
                </span>
                <button
                  className="btn btn-outline-danger btn-sm py-2 px-3"
                  onClick={onLogout}
                  style={{ borderRadius: '8px' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-link text-decoration-none px-3 py-2 text-dark-theme-toggle" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  Login
                </Link>
                <Link to="/register" className="btn custom-btn-primary py-2 px-3">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Route Guards
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own dashboard
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Owner') return <Navigate to="/owner" replace />;
    return <Navigate to="/renter" replace />;
  }

  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    // Restore user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Set axios header default authorization token
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }

    // Initialize theme layout attribute
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    showToast('Logged out successfully', 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  return (
    <Router>
      <div className="app-container">
        <Navigation user={user} theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home user={user} showToast={showToast} />} />
            <Route path="/login" element={<Login setUser={setUser} showToast={showToast} />} />
            <Route path="/register" element={<Register showToast={showToast} />} />
            <Route path="/forgot-password" element={<ForgotPassword showToast={showToast} />} />

            {/* Tenant / Renter Routes */}
            <Route
              path="/renter"
              element={
                <ProtectedRoute user={user} allowedRoles={['Tenant']}>
                  <RenterHome user={user} showToast={showToast} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/renter/properties"
              element={
                <ProtectedRoute user={user} allowedRoles={['Tenant']}>
                  <RenterAllProperties showToast={showToast} />
                </ProtectedRoute>
              }
            />

            {/* Owner Routes */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute user={user} allowedRoles={['Owner']}>
                  <OwnerHome showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/add-property"
              element={
                <ProtectedRoute user={user} allowedRoles={['Owner']}>
                  <OwnerAddProperty showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/properties"
              element={
                <ProtectedRoute user={user} allowedRoles={['Owner']}>
                  <OwnerAllProperties showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/bookings"
              element={
                <ProtectedRoute user={user} allowedRoles={['Owner']}>
                  <OwnerAllBookings showToast={showToast} />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute user={user} allowedRoles={['Admin']}>
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute user={user} allowedRoles={['Admin']}>
                  <AdminAllUsers showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/properties"
              element={
                <ProtectedRoute user={user} allowedRoles={['Admin']}>
                  <AdminAllProperty showToast={showToast} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute user={user} allowedRoles={['Admin']}>
                  <AdminAllBookings />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="container py-5 text-center auth-wrapper">
                  <div className="glass-card p-5">
                    <h1 className="display-1 fw-bold text-danger">404</h1>
                    <h3 className="fw-bold my-3">Oops! Page Not Found</h3>
                    <p className="text-secondary mb-4">The house hunting link you followed seems to have expired or moved location.</p>
                    <Link to="/" className="btn custom-btn-primary">
                      Return to Safety
                    </Link>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="py-4 border-top text-center mt-auto" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="container">
            <p className="mb-1 text-secondary" style={{ fontSize: '14px' }}>
              © {new Date().getFullYear()} <strong>HouseHunt</strong>. Made with care for premium landlords & verified tenants.
            </p>
            <small className="text-muted" style={{ fontSize: '11px' }}>
              Built using Vite + React + Express + MongoDB. All lease transactions are subject to local real estate laws.
            </small>
          </div>
        </footer>

        {/* Global Notification Banner */}
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      </div>
    </Router>
  );
};

export default App;
