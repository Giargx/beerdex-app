import React from 'react';
import { getBeerPoints } from '../beers';

export interface TagRequestItem {
  requestId: string;
  fromUser: string;
  fromDisplayName?: string;
  brand: string;
  variant: string;
  photo: string;
  isShiny: boolean;
  lat?: number | null;
  lng?: number | null;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
}

interface TagRequestModalProps {
  isOpen: boolean;
  request: TagRequestItem | null;
  onClose: () => void;
  onAccept: (request: TagRequestItem, replaceExisting: boolean) => void;
  onReject: (requestId: string) => void;
  myPokedex: Record<string, any>;
  globalDisplayNames?: Record<string, string>;
  globalAvatars?: Record<string, string>;
}

export const TagRequestModal: React.FC<TagRequestModalProps> = ({
  isOpen,
  request,
  onClose: _onClose,
  onAccept,
  onReject,
  myPokedex = {},
  globalDisplayNames = {},
  globalAvatars = {},
}) => {
  if (!isOpen || !request) return null;

  const senderNick = request.fromUser;
  const senderDisplayName = globalDisplayNames[senderNick] || request.fromDisplayName || senderNick;
  const senderAvatar = globalAvatars[senderNick];

  const uniqueId = `${request.brand}-${request.variant}`;
  const existingEntry = myPokedex[uniqueId];
  const hasAlreadyUnlocked = existingEntry !== undefined;

  const newPoints = getBeerPoints(request.brand, request.variant, request.isShiny, true);
  const oldPoints = hasAlreadyUnlocked
    ? getBeerPoints(request.brand, request.variant, existingEntry.isShiny, existingEntry.isShared)
    : 0;

  return (
    <div
      className="auth-modal"
      style={{
        zIndex: 19000,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="auth-container"
        style={{
          maxWidth: '440px',
          width: '100%',
          background: 'var(--white)',
          borderRadius: '24px',
          padding: '24px 20px',
          boxSizing: 'border-box',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Sender Info */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 179, 0, 0.12)',
              padding: '6px 14px',
              borderRadius: '20px',
              color: 'var(--primary-dark)',
              fontWeight: 800,
              fontSize: '13px',
              marginBottom: '12px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              group
            </span>
            Sblocco in Compagnia
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            {senderAvatar && senderAvatar.startsWith('data:') ? (
              <img
                src={senderAvatar}
                alt={senderNick}
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: 'var(--dark)',
                }}
              >
                {senderDisplayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--dark)' }}>
                {senderDisplayName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{senderNick}</div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '14px', color: 'var(--dark)', lineHeight: '1.4' }}>
            Ti ha taggato nella bevuta di{' '}
            <strong style={{ color: 'var(--primary-dark)' }}>
              {request.brand} ({request.variant})
            </strong>
            !
          </p>
        </div>

        {/* Existing vs New Comparison */}
        {hasAlreadyUnlocked ? (
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#B45309',
                marginBottom: '10px',
                textAlign: 'center',
              }}
            >
              ⚠️ Hai già sbloccato questa birra in precedenza!
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Previous Unlock */}
              <div
                style={{
                  background: 'var(--white)',
                  borderRadius: '12px',
                  padding: '10px',
                  textAlign: 'center',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Precedente
                </div>
                {existingEntry.photo ? (
                  <img
                    src={existingEntry.photo}
                    alt="Precedente"
                    style={{
                      width: '100%',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '6px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '80px',
                      background: '#F1F5F9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                    }}
                  >
                    Nessuna foto
                  </div>
                )}
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--dark)' }}>
                  +{oldPoints} Punti
                </div>
              </div>

              {/* New Tagged Unlock */}
              <div
                style={{
                  background: 'var(--white)',
                  borderRadius: '12px',
                  padding: '10px',
                  textAlign: 'center',
                  border: '2px solid var(--primary)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '4px' }}>
                  Nuova (con @{senderNick})
                </div>
                <img
                  src={request.photo}
                  alt="Nuovo Sblocco"
                  style={{
                    width: '100%',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '6px',
                  }}
                />
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#10B981' }}>
                  +{newPoints} Punti {request.isShiny ? '✨ Shiny' : ''}
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: '12px',
                color: '#92400E',
                marginTop: '10px',
                marginBottom: 0,
                textAlign: 'center',
                lineHeight: '1.3',
              }}
            >
              Vuoi sostituire la tua foto e lo sblocco precedente con questo nuovo sblocco in compagnia?
            </p>
          </div>
        ) : (
          /* Single New Unlock Preview */
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '14px',
              textAlign: 'center',
              marginBottom: '18px',
            }}
          >
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
              <img
                src={request.photo}
                alt={request.brand}
                style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '12px' }}
              />
              {request.isShiny && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'linear-gradient(135deg, #FFB300, #FF6F00)',
                    color: 'var(--dark)',
                    fontWeight: 900,
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  ✨ Shiny
                </div>
              )}
            </div>

            <div style={{ fontSize: '13px', fontWeight: 800, color: '#10B981' }}>
              +{newPoints} Punti Pokédex disponibili!
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Accettando, sbloccherai la birra e verrà pubblicata sul tuo feed.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="btn-main"
            onClick={() => onAccept(request, hasAlreadyUnlocked)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '16px',
              justifyContent: 'center',
              fontSize: '15px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #FFB300, #FF6F00)',
              color: 'var(--dark)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 111, 0, 0.3)',
            }}
          >
            <span className="material-symbols-outlined">check_circle</span>
            {hasAlreadyUnlocked ? 'Sostituisci con Nuovo Sblocco' : 'Accetta Sblocco & Pubblica 🍺'}
          </button>

          <button
            className="btn-secondary"
            onClick={() => onReject(request.requestId)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              justifyContent: 'center',
              fontSize: '14px',
              color: 'var(--danger)',
              border: '1px solid #FCA5A5',
              background: '#FEF2F2',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined">close</span>
            {hasAlreadyUnlocked ? 'Mantieni Precedente e Rifiuta' : 'Rifiuta Richiesta'}
          </button>
        </div>
      </div>
    </div>
  );
};
