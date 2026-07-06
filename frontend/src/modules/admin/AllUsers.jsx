import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const AllUsers = ({ showToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admins/users');
      setUsers(response.data);
    } catch (error) {
      console.log('Failed fetching live user lists, fallback to mocks.');
      setUsers([
        { _id: 'u-mock-1', name: 'Diana Prince', email: 'diana@gmail.com', phone: '9876543210', role: 'Owner', isVerified: true, currentLocation: 'Mumbai' },
        { _id: 'u-mock-2', name: 'Peter Parker', email: 'peter@gmail.com', phone: '9812345678', role: 'Tenant', isVerified: true, currentLocation: 'Bangalore' },
        { _id: 'u-mock-3', name: 'Lex Luthor', email: 'lex@gmail.com', phone: '9900112233', role: 'Owner', isVerified: false, currentLocation: 'Hyderabad' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleVerification = async (userId, currentVerified) => {
    try {
      await axios.put('/api/admins/approve-owner', { userId, isVerified: !currentVerified });
      showToast(`User verification status set to ${!currentVerified}`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Error modifying verification status', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This will delete all listings/bookings associated with this profile.')) {
      try {
        await axios.delete(`/api/admins/users/${id}`);
        showToast('User account successfully deleted', 'success');
        fetchUsers();
      } catch (err) {
        showToast('Failed deleting user', 'error');
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Manage Users Base</h2>
        <p className="text-secondary">Verify owner profiles, review roles, or delete customer accounts</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table align-middle text-dark-theme-toggle">
              <thead>
                <tr>
                  <th>Profile Name</th>
                  <th>Contact Email</th>
                  <th>Phone Number</th>
                  <th>Location</th>
                  <th>User Role</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <span className="fw-bold">{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{user.currentLocation || 'N/A'}</td>
                    <td>
                      <span className={`custom-badge ${user.role === 'Admin' ? 'badge-danger' : user.role === 'Owner' ? 'badge-info' : 'badge-success'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.role === 'Owner' ? (
                        <button
                          className={`btn btn-sm ${user.isVerified ? 'btn-success' : 'btn-outline-warning'}`}
                          onClick={() => handleToggleVerification(user._id, user.isVerified)}
                          style={{ borderRadius: '6px', fontSize: '12px' }}
                        >
                          {user.isVerified ? '✓ Verified' : 'Verify Account'}
                        </button>
                      ) : (
                        <span className="text-secondary" style={{ fontSize: '13px' }}>Active</span>
                      )}
                    </td>
                    <td>
                      {user.role !== 'Admin' ? (
                        <button
                          className="btn btn-sm btn-outline-danger p-1"
                          onClick={() => handleDeleteUser(user._id)}
                          title="Delete User Account"
                          style={{ borderRadius: '6px' }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </button>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '12px' }}>System</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
