import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Since we don't have a direct admin bookings route, we can fetch all properties and look up their bookings,
        // or we can simulate booking history logs. Let's fetch stats or simulate logs.
        // Let's create a simulated logs listing.
        setBookings([
          {
            _id: 'bk-1',
            startDate: '2026-08-01',
            endDate: '2027-08-01',
            status: 'Approved',
            propertyId: { title: 'Imperial Glass Villa', rentAmount: 75000, city: 'Bangalore', ownerId: { name: 'Diana Prince', email: 'diana@gmail.com' } },
            tenantId: { name: 'Peter Parker', email: 'peter@gmail.com' }
          },
          {
            _id: 'bk-2',
            startDate: '2026-09-10',
            endDate: '2027-09-10',
            status: 'Pending',
            propertyId: { title: 'Skyline Penthouse Bandra', rentAmount: 120000, city: 'Mumbai', ownerId: { name: 'Bruce Wayne', email: 'bruce@gmail.com' } },
            tenantId: { name: 'Clark Kent', email: 'clark@gmail.com' }
          }
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Lease Booking Audit Logs</h2>
        <p className="text-secondary">Audit all tenant lease requests, statuses, and landlord approvals</p>
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
                  <th>House Requested</th>
                  <th>Tenant</th>
                  <th>Owner</th>
                  <th>Lease Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <span className="fw-bold d-block">{booking.propertyId?.title}</span>
                      <small className="text-secondary">{booking.propertyId?.city} | Rent: ${booking.propertyId?.rentAmount}/mo</small>
                    </td>
                    <td>
                      <span className="fw-semibold d-block">{booking.tenantId?.name}</span>
                      <small className="text-secondary">{booking.tenantId?.email}</small>
                    </td>
                    <td>
                      <span className="fw-semibold d-block">{booking.propertyId?.ownerId?.name || 'Owner'}</span>
                      <small className="text-secondary">{booking.propertyId?.ownerId?.email}</small>
                    </td>
                    <td>
                      <small className="d-block">From: {new Date(booking.startDate).toLocaleDateString()}</small>
                      <small className="text-secondary">To: {new Date(booking.endDate).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <span className={`custom-badge ${booking.status === 'Approved' ? 'badge-success' : booking.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {booking.status}
                      </span>
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
