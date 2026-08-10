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
    if (isLocation) return 'Autorizza Posizione GPS';
    if (isCamera) return 'Autorizza Fotocamera';
    return 'Autorizza Galleria Foto';
  };

  const getDesc = () => {
    if (isLocation) {
      return 'Consenti l\'accesso alla posizione per verificare la nazione d\'origine della birra e sbloccare i punti Shiny doppi.';
    }
    if (isCamera) {
      return 'Consenti a POP IT l\'accesso alla fotocamera per scattare le foto alle tue birre, scansionare i codici a barre al pub e condividere le tue Storie con i tuoi amici.';
    }
    return 'Consenti l\'accesso alla galleria per selezionare e caricare le foto dei tuoi boccali direttamente dal tuo dispositivo.';
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="btn-main"
            onClick={() => onChoice('always')}
            style={{ width: '100%', margin: 0, justifyContent: 'center', fontSize: '14px', gap: '8px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>verified</span>
            Consenti e Salva per Sempre
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => onChoice('denied')}
            style={{ width: '100%', margin: 0, justifyContent: 'center', fontSize: '13px', background: '#F1F5F9', color: 'var(--dark)', borderColor: '#CBD5E1' }}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};
