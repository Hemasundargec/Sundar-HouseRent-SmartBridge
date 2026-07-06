import React, { useEffect } from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlineIcon style={{ color: 'var(--success-color)' }} />;
      case 'error':
        return <ErrorOutlineIcon style={{ color: 'var(--danger-color)' }} />;
      case 'warning':
        return <WarningAmberIcon style={{ color: 'var(--warning-color)' }} />;
      default:
        return <CheckCircleOutlineIcon style={{ color: 'var(--primary-color)' }} />;
    }
  };

  return (
    <div
      className="position-fixed bottom-0 end-0 m-4 p-3 glass-container shadow"
      style={{
        zIndex: 9999,
        minWidth: '300px',
        maxWidth: '450px',
        borderLeft: `5px solid var(--${type === 'error' ? 'danger' : type}-color)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        animation: 'slideIn 0.3s ease-out forwards',
      }}
    >
      <div className="d-flex align-items-center gap-3">
        {getIcon()}
        <div>
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
            {message}
          </span>
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
        }}
      >
        <CloseIcon fontSize="small" />
      </button>

      {/* Animation Style */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
