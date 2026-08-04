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
      <div className="auth-container" style={{ borderRadius: '24px', padding: '28px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <img
            src="/pop-it-logo.png"
            alt="POP IT Logo"
            style={{
              width: '120px',
              height: 'auto',
              maxHeight: '100px',
              objectFit: 'contain',
            }}
          />
        </div>
        <h2 style={{ color: 'var(--dark)', fontSize: '20px', margin: '0 0 8px 0', fontWeight: 800 }}>
          Benvenuto su POP IT!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '22px', lineHeight: 1.5 }}>
          Per accedere alla collezione e condividere le tue birre devi essere maggiorenne. Hai già compiuto 18 anni?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="btn-main" onClick={onConfirm} style={{ justifyContent: 'center', width: '100%', margin: 0 }}>
            SÌ, HO ALMENO 18 ANNI
          </button>
          <button className="btn-secondary" onClick={onReject} style={{ justifyContent: 'center', width: '100%', margin: 0 }}>
            NO, NON ANCORA
          </button>
        </div>
      </div>
    </div>
  );
};
