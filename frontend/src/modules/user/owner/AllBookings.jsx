import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const AllBookings = ({ showToast }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/owners/bookings');
      setBookings(res.data);
    } catch (err) {
      console.log('Failed fetching bookings, using mock data.');
      setBookings([
        {
          _id: 'bk-mock-1',
          startDate: '2026-08-01',
          endDate: '2027-08-01',
          status: 'Pending',
          propertyId: { title: 'Imperial Glass Villa', rentAmount: 75000, city: 'Bangalore' },
          tenantId: { name: 'Peter Parker', email: 'peter@gmail.com', phone: '9876543210' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleBookingAction = async (bookingId, status) => {
    try {
      await axios.put('/api/owners/bookings/status', { bookingId, status });
      showToast(`Booking request ${status} successfully!`, 'success');
      loadBookings();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing action', 'error');
    }
  };

  const filteredBookings = filterStatus === 'All'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Lease Booking Requests</h2>
          <p className="text-secondary mb-0">Approve or reject rental requests for your houses</p>
        </div>

        {/* Filter Buttons */}
        <div className="d-flex gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              className={`btn btn-sm py-2 px-3 ${filterStatus === status ? 'custom-btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus(status)}
              style={{ borderRadius: '8px' }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-5 glass-card">
          <p className="text-secondary">No booking requests found under this category.</p>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table align-middle text-dark-theme-toggle">
              <thead>
                <tr>
                  <th>House Requested</th>
                  <th>Tenant Details</th>
                  <th>Lease Term</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <span className="fw-bold d-block">{booking.propertyId?.title}</span>
                      <small className="text-secondary">City: {booking.propertyId?.city} | Rent: ${booking.propertyId?.rentAmount}/mo</small>
                    </td>
                    <td>
                      <span className="fw-semibold d-block">{booking.tenantId?.name}</span>
                      <small className="text-secondary">Email: {booking.tenantId?.email}</small>
                      <br />
                      <small className="text-secondary">Phone: {booking.tenantId?.phone || 'N/A'}</small>
                    </td>
                    <td>
                      <small className="d-block"><strong>Start:</strong> {new Date(booking.startDate).toLocaleDateString()}</small>
                      <small className="text-secondary"><strong>End:</strong> {new Date(booking.endDate).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <span className={`custom-badge ${booking.status === 'Approved' ? 'badge-success' : booking.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'Pending' ? (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success d-flex align-items-center gap-1 py-1.5 px-3"
                            onClick={() => handleBookingAction(booking._id, 'Approved')}
                            style={{ borderRadius: '8px', fontSize: '13px' }}
                          >
                            <CheckIcon fontSize="inherit" /> Approve
                          </button>
                          <button
                            className="btn btn-outline-danger d-flex align-items-center gap-1 py-1.5 px-3"
                            onClick={() => handleBookingAction(booking._id, 'Rejected')}
                            style={{ borderRadius: '8px', fontSize: '13px' }}
                          >
                            <CloseIcon fontSize="inherit" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-secondary" style={{ fontSize: '13px' }}>Completed</span>
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

export default AllBookings;
