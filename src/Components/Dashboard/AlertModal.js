import React from 'react';
import './AlertModal.css';

const AlertModal = ({ message, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="alert-modal-overlay">
      <div className="alert-modal">
        <div className="alert-modal-content">
          <p>{message}</p>
          <div className="alert-modal-actions">
            <button onClick={onCancel} className="alert-modal-button cancel-button">
              Cancel
            </button>
            <button onClick={onConfirm} className="alert-modal-button confirm-button">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
