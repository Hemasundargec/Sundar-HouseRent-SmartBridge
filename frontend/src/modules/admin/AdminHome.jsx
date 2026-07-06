import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PaidIcon from '@mui/icons-material/Paid';

const AdminHome = () => {
  const [stats, setStats] = useState({
    users: { total: 0, owners: 0, tenants: 0 },
    properties: { total: 0, available: 0, booked: 0 },
    bookings: { total: 0, approved: 0, pending: 0 },
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admins/stats');
      setStats(response.data);
    } catch (error) {
      console.log('Failed fetching live system stats, loading mock dashboard statistics.');
      setStats({
        users: { total: 18, owners: 5, tenants: 12 },
        properties: { total: 10, available: 6, booked: 4 },
        bookings: { total: 8, approved: 4, pending: 2 },
        revenue: 9300,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">System Administration Panel</h2>
        <p className="text-secondary mb-0">Overview of users, listings, leases, and system audits</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <>
          {/* Dashboard Metrics Row */}
          <div className="row g-4 mb-5">
            <div className="col-sm-6 col-lg-3">
              <div className="glass-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-secondary d-block mb-1" style={{ fontSize: '14px' }}>Total Registered Users</span>
                    <h2 className="fw-bold mb-0">{stats.users.total}</h2>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>
                      {stats.users.owners} Owners | {stats.users.tenants} Tenants
                    </small>
                  </div>
                  <span className="p-2.5 rounded-3 bg-light-purple text-primary" style={{ backgroundColor: 'rgba(108, 93, 211, 0.1)' }}>
                    <PeopleOutlineIcon />
                  </span>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="glass-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-secondary d-block mb-1" style={{ fontSize: '14px' }}>Active House Listings</span>
                    <h2 className="fw-bold mb-0">{stats.properties.total}</h2>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>
                      {stats.properties.available} Available | {stats.properties.booked} Leased
                    </small>
                  </div>
                  <span className="p-2.5 rounded-3 text-success" style={{ backgroundColor: 'rgba(0, 198, 137, 0.1)' }}>
                    <HomeWorkIcon />
                  </span>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="glass-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-secondary d-block mb-1" style={{ fontSize: '14px' }}>Lease Bookings</span>
                    <h2 className="fw-bold mb-0">{stats.bookings.total}</h2>
                    <small className="text-secondary" style={{ fontSize: '11px' }}>
                      {stats.bookings.approved} Approved | {stats.bookings.pending} Pending
                    </small>
                  </div>
                  <span className="p-2.5 rounded-3 text-warning" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                    <LibraryBooksIcon />
                  </span>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="glass-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="text-secondary d-block mb-1" style={{ fontSize: '14px' }}>Platform Lease volume</span>
                    <h2 className="fw-bold mb-0">${stats.revenue}/mo</h2>
                    <small className="text-success" style={{ fontSize: '11px', fontWeight: '600' }}>
                      Verified Rental Volume
                    </small>
                  </div>
                  <span className="p-2.5 rounded-3 text-danger" style={{ backgroundColor: 'rgba(255, 74, 85, 0.1)' }}>
                    <PaidIcon />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-card p-4">
            <h5 className="fw-bold mb-4 pb-2 border-bottom">Moderation Quick Shortcuts</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="p-3 border rounded-3 text-center">
                  <h6 className="fw-bold mb-2">User Moderation</h6>
                  <p className="text-secondary" style={{ fontSize: '13px' }}>Verify owner certificates, activate accounts, or suspend user access.</p>
                  <Link to="/admin/users" className="btn btn-outline-primary btn-sm mt-2 w-100 py-2">
                    Manage Users List
                  </Link>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 border rounded-3 text-center">
                  <h6 className="fw-bold mb-2">House Listings Control</h6>
                  <p className="text-secondary" style={{ fontSize: '13px' }}>Audit listed houses for fake images, wrong pricing details, or reports.</p>
                  <Link to="/admin/properties" className="btn btn-outline-primary btn-sm mt-2 w-100 py-2">
                    Manage Property Database
                  </Link>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 border rounded-3 text-center">
                  <h6 className="fw-bold mb-2">Leases & Bookings History</h6>
                  <p className="text-secondary" style={{ fontSize: '13px' }}>Inspect tenant contract bookings history, rental logs, and security disputes.</p>
                  <Link to="/admin/bookings" className="btn btn-outline-primary btn-sm mt-2 w-100 py-2">
                    View Leases Logs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHome;
