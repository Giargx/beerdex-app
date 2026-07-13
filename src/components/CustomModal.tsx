import React from 'react';

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  text: string;
  showOk: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  title,
  text,
  showOk,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="auth-modal" style={{ zIndex: 20000 }}>
      <div className="auth-container" style={{ maxWidth: '350px' }}>
        <h3 style={{ marginTop: 0, color: 'var(--dark)', fontSize: '22px' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '25px', lineHeight: 1.5 }}>
          {text}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {showOk ? (
            <button
              className="btn-main"
              onClick={onConfirm}
              style={{ marginTop: 0, justifyContent: 'center' }}
            >
              OK
            </button>
          ) : onConfirm && onCancel ? (
            <>
              <button
                className="btn-secondary"
                onClick={onCancel}
                style={{ marginTop: 0, flex: 1, justifyContent: 'center' }}
              >
                Annulla
              </button>
              <button
                className="btn-main"
                onClick={onConfirm}
                style={{ marginTop: 0, flex: 1, background: 'var(--danger)', justifyContent: 'center' }}
              >
                Conferma
              </button>
            </>
          ) : (
            <div style={{ padding: '10px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
              Attendere prego...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
