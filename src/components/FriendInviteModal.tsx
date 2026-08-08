import React from 'react';

interface FriendInviteModalProps {
  isOpen: boolean;
  inviterNick: string;
  inviterDisplayName?: string;
  inviterAvatar?: string;
  isLoggedIn: boolean;
  onAccept: (inviterNick: string) => void;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const FriendInviteModal: React.FC<FriendInviteModalProps> = ({
  isOpen,
  inviterNick,
  inviterDisplayName,
  inviterAvatar,
  isLoggedIn,
  onAccept,
  onClose,
  onOpenAuth,
}) => {
  if (!isOpen || !inviterNick) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          textAlign: 'center',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            padding: '28px 20px 24px 20px',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '3px solid #6EE7B7',
              margin: '0 auto 12px auto',
              overflow: 'hidden',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {inviterAvatar ? (
              <img src={inviterAvatar} alt={inviterNick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#059669' }}>
                person
              </span>
            )}
          </div>

          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>
            Invito d'Amicizia 🍺
          </h3>
          <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9, fontWeight: 600 }}>
            @{inviterNick} ti ha invitato su POP IT!
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoggedIn ? (
            <>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                Vuoi accettare la richiesta ed aggiungere <strong>@{inviterDisplayName || inviterNick}</strong> alla tua cerchia di amici su POP IT?
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    background: '#F1F5F9',
                    color: '#64748B',
                    border: '1px solid #CBD5E1',
                    borderRadius: '14px',
                    padding: '12px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Più Tardi
                </button>
                <button
                  onClick={() => onAccept(inviterNick)}
                  style={{
                    flex: 1,
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '12px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    handshake
                  </span>
                  Accetta 🤝
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
                Crea subito il tuo profilo gratuito o accedi per sbloccare le birre insieme a <strong>@{inviterDisplayName || inviterNick}</strong> ed entrare nella classifica!
              </p>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth();
                }}
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  rocket_launch
                </span>
                Registrati o Accedi Ora
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
