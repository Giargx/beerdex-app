import React from 'react';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReject: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ isOpen, onConfirm, onReject }) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal" style={{ zIndex: 15000 }}>
      <div className="auth-container">
        <h1 style={{ fontSize: '40px', margin: 0, color: 'var(--danger)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '60px' }}>
            no_drinks
          </span>
        </h1>
        <h2 style={{ color: 'var(--dark)' }}>Sei maggiorenne?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          L'accesso a questa applicazione è consentito solo alle persone in età legale per il consumo di alcolici nel proprio paese di residenza.
        </p>
        <button className="btn-main" onClick={onConfirm} style={{ justifyContent: 'center' }}>
          SÌ, SONO MAGGIORENNE
        </button>
        <button className="btn-secondary" onClick={onReject} style={{ justifyContent: 'center' }}>
          NO, NON LO SONO
        </button>
      </div>
    </div>
  );
};
