import React from 'react';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const AllPropertiesCards = ({ properties, onEdit, onDelete, actionLabel = 'View details', onAction, isOwner = false }) => {
  return (
    <div className="row g-4">
      {properties.map((property) => (
        <div className="col-md-6 col-lg-4" key={property._id}>
          <div className="glass-card h-100 d-flex flex-column overflow-hidden">
            <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
              <img
                src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                alt={property.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <span className={`position-absolute top-0 end-0 m-3 custom-badge shadow ${property.status === 'Available' ? 'badge-success' : property.status === 'Booked' ? 'badge-warning' : 'badge-danger'}`}>
                {property.status}
              </span>
              <div className="position-absolute bottom-0 start-0 m-3 px-3 py-1 glass-container text-white fw-bold">
                ${property.rentAmount}/mo
              </div>
            </div>

            <div className="p-3 d-flex flex-column flex-grow-1">
              <h5 className="fw-bold mb-1 text-truncate" title={property.title}>{property.title}</h5>
              <p className="text-secondary d-flex align-items-center gap-1 mb-3" style={{ fontSize: '13px' }}>
                <FmdGoodIcon fontSize="inherit" className="text-danger" /> {property.city}, {property.state}
              </p>

              <div className="d-flex justify-content-between mb-3 border-top border-bottom py-2" style={{ fontSize: '13px' }}>
                <span className="d-flex align-items-center gap-1 text-secondary">
                  <HotelIcon fontSize="small" /> {property.bedrooms} Beds
                </span>
                <span className="d-flex align-items-center gap-1 text-secondary">
                  <BathtubIcon fontSize="small" /> {property.bathrooms} Baths
                </span>
                <span className="text-secondary fw-semibold">
                  {property.furnishingStatus}
                </span>
              </div>

              <div className="mt-auto d-flex gap-2">
                {isOwner ? (
                  <>
                    <button
                      className="btn btn-outline-primary flex-fill d-flex align-items-center justify-content-center gap-1 py-2"
                      onClick={() => onEdit(property)}
                      style={{ borderRadius: '8px' }}
                    >
                      <EditIcon fontSize="small" /> Edit
                    </button>
                    <button
                      className="btn btn-outline-danger d-flex align-items-center justify-content-center py-2"
                      onClick={() => onDelete(property._id)}
                      style={{ borderRadius: '8px', padding: '10px' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </>
                ) : (
                  <button
                    className="btn custom-btn-primary w-100 py-2"
                    onClick={() => onAction(property)}
                  >
                    {actionLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllPropertiesCards;
