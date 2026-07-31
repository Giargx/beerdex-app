import React from 'react';

export type PermissionType = 'gallery' | 'location';
export type PermissionChoice = 'always' | 'while_using' | 'denied';

interface PermissionModalProps {
  isOpen: boolean;
  type: PermissionType;
  onChoice: (choice: PermissionChoice) => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, type, onChoice }) => {
  if (!isOpen) return null;

  const isLocation = type === 'location';

  return (
    <div className="auth-modal" style={{ zIndex: 25000, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)' }}>
      <div
        className="auth-container"
        style={{
          maxWidth: '360px',
          width: '92%',
          borderRadius: '24px',
          padding: '24px 20px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'var(--white, #FFFFFF)',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '52px', color: isLocation ? '#2563EB' : '#8B5CF6' }}>
            {isLocation ? 'location_on' : 'photo_library'}
          </span>
        </div>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: 'var(--dark, #1E293B)' }}>
          "BeerDex" desidera accedere {isLocation ? 'alla tua Posizione' : 'alle tue Foto'}
        </h3>

        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-muted, #64748B)', lineHeight: 1.45 }}>
          {isLocation
            ? 'La tua posizione viene utilizzata per verificare se ti trovi nella nazione o regione d\'origine della birra e sbloccare i punti Shiny doppi.'
            : 'BeerDex ha bisogno di accedere alla tua galleria fotografica per permetterti di caricare le foto delle birre che sblocchi nella tua collezione.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn-main"
            onClick={() => onChoice('always')}
            style={{ width: '100%', margin: 0, padding: '12px', fontSize: '13px', borderRadius: '12px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
            Consenti per sempre
          </button>

          <button
            className="btn-secondary"
            onClick={() => onChoice('while_using')}
            style={{ width: '100%', margin: 0, padding: '12px', fontSize: '13px', borderRadius: '12px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
            Solo mentre usi l'app
          </button>

          <button
            onClick={() => onChoice('denied')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#EF4444',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '4px',
            }}
          >
            Annulla / Non consentire
          </button>
        </div>
      </div>
    </div>
  );
};
