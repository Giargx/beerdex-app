import React from 'react';

export type PermissionType = 'camera' | 'gallery' | 'location';
export type PermissionChoice = 'always' | 'while_using' | 'denied';

interface PermissionModalProps {
  isOpen: boolean;
  type: PermissionType;
  onChoice: (choice: PermissionChoice) => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, type, onChoice }) => {
  if (!isOpen) return null;

  const isLocation = type === 'location';
  const isCamera = type === 'camera';

  const getIcon = () => {
    if (isLocation) return 'my_location';
    if (isCamera) return 'photo_camera';
    return 'photo_library';
  };

  const getBg = () => {
    if (isLocation) return 'rgba(234, 179, 8, 0.15)';
    if (isCamera) return 'rgba(16, 185, 129, 0.15)';
    return 'rgba(249, 115, 22, 0.15)';
  };

  const getColor = () => {
    if (isLocation) return 'var(--primary-dark)';
    if (isCamera) return '#10B981';
    return 'var(--primary)';
  };

  const getTitle = () => {
    if (isLocation) return 'Attiva la Posizione';
    if (isCamera) return 'Attiva la Fotocamera';
    return 'Accedi alla Galleria';
  };

  const getDesc = () => {
    if (isLocation) {
      return 'Ti serve per verificare se ti trovi nella nazione o regione d\'origine della birra e sbloccare i punti Shiny doppi!';
    }
    if (isCamera) {
      return 'Abilita la fotocamera per scattare le foto alle tue birre, scansionare codici a barre e condividere Storie al pub con i tuoi amici.';
    }
    return 'Seleziona le foto dei tuoi boccali direttamente dalla galleria dello smartphone per aggiungerle alla tua collezione.';
  };

  return (
    <div className="auth-modal" style={{ zIndex: 25000, padding: '20px 14px' }}>
      <div
        className="auth-container"
        style={{
          maxWidth: '380px',
          width: '94%',
          borderRadius: '24px',
          padding: '24px 20px 20px 20px',
          textAlign: 'center',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: getBg(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getColor(),
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
              {getIcon()}
            </span>
          </div>
        </div>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '19px', fontWeight: 800, color: 'var(--dark)' }}>
          {getTitle()}
        </h3>

        <p style={{ margin: '0 0 22px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'inherit' }}>
          {getDesc()}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn-main"
            onClick={() => onChoice('always')}
            style={{ width: '100%', margin: 0, justifyContent: 'center', fontSize: '14px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
            Consenti per sempre
          </button>

          <button
            className="btn-secondary"
            onClick={() => onChoice('while_using')}
            style={{ width: '100%', margin: 0, justifyContent: 'center', fontSize: '13px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
            Solo mentre usi l'app
          </button>

          <button
            type="button"
            onClick={() => onChoice('denied')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '4px',
              fontFamily: 'inherit',
            }}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};
