import React, { useState } from 'react';
import { StarRating } from './StarRating';

interface UnlockRatingModalProps {
  isOpen: boolean;
  brand: string;
  variant: string;
  photo?: string;
  onClose: () => void;
  onRate: (rating: number) => void;
}

export const UnlockRatingModal: React.FC<UnlockRatingModalProps> = ({
  isOpen,
  brand,
  variant,
  photo,
  onClose,
  onRate,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedRating > 0) {
      onRate(selectedRating);
    }
    onClose();
  };

  return (
    <div className="auth-modal" style={{ zIndex: 20000, padding: '20px 10px', boxSizing: 'border-box' }}>
      <div
        className="auth-container"
        style={{
          maxWidth: '400px',
          width: '92%',
          boxSizing: 'border-box',
          textAlign: 'center',
          padding: '24px 20px',
          borderRadius: '24px',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
        <h3 style={{ margin: '0 0 6px 0', color: 'var(--dark)', fontSize: '20px', fontWeight: 900 }}>
          Birra Sbloccata!
        </h3>
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '4px' }}>
          {brand}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {variant}
        </div>

        {photo && (
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '16px',
              overflow: 'hidden',
              margin: '0 auto 16px auto',
              border: '3px solid var(--primary)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <img src={photo} alt={variant} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div
          style={{
            background: '#FFFDF5',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--dark)', marginBottom: '8px' }}>
            Vuoi valutarla adesso o preferisci berla con calma?
          </div>

          <StarRating
            rating={selectedRating}
            onRate={(r) => setSelectedRating(r)}
            size={32}
            showText
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {selectedRating > 0 && (
            <button
              type="button"
              className="btn-main"
              onClick={handleConfirm}
              style={{ width: '100%', margin: 0 }}
            >
              <span className="material-symbols-outlined">star</span>
              Conferma Voto ({selectedRating}/5)
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ width: '100%', margin: 0 }}
          >
            Lo farò più tardi
          </button>
        </div>
      </div>
    </div>
  );
};
