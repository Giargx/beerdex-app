import React from 'react';
import { createPortal } from 'react-dom';
import { getPostParticipants } from '../beers';

interface ParticipantsBottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any | null;
  globalDisplayNames?: Record<string, string>;
  globalAvatars?: Record<string, string>;
  allPokedexProfiles?: Record<string, Record<string, any>>;
  onOpenPublicProfile: (username: string) => void;
  currentUserAvatar?: string;
  currentUserNick?: string;
}

const cleanUsername = (str?: string): string => {
  if (!str) return '';
  const trimmed = str.trim();
  if (trimmed.includes('@')) {
    return trimmed.split('@')[0];
  }
  return trimmed;
};

export const ParticipantsBottomSheetModal: React.FC<ParticipantsBottomSheetModalProps> = ({
  isOpen,
  onClose,
  post,
  globalDisplayNames = {},
  globalAvatars = {},
  allPokedexProfiles = {},
  onOpenPublicProfile,
  currentUserAvatar,
  currentUserNick,
}) => {
  if (!isOpen || !post) return null;

  const parts = getPostParticipants(post);

  const modalContent = (
    <div
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '100vw',
        height: '100%',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
        touchAction: 'none',
        pointerEvents: 'auto',
        WebkitTapHighlightColor: 'transparent',
        overflow: 'hidden',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '28px 28px 0 0',
          padding: '16px 20px calc(28px + env(safe-area-inset-bottom, 16px)) 20px',
          maxHeight: '80vh',
          width: '100%',
          maxWidth: '540px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Pull Handle Indicator */}
        <div style={{ width: '40px', height: '4px', background: '#CBD5E1', borderRadius: '4px', margin: '0 auto 14px auto' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🍻</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
              Partecipanti allo Stappo ({parts.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* User Accounts List */}
        <div style={{ overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px', WebkitOverflowScrolling: 'touch', width: '100%', boxSizing: 'border-box' }}>
          {parts.map((pNick) => {
            const uKey = pNick.toLowerCase();
            let av = globalAvatars[pNick] || globalAvatars[uKey];
            if (!av && currentUserNick && pNick.toLowerCase() === currentUserNick.toLowerCase() && currentUserAvatar) {
              av = currentUserAvatar;
            }
            const rawDisp = globalDisplayNames?.[pNick] || globalDisplayNames?.[uKey] || pNick;
            const disp = cleanUsername(rawDisp);
            const cleanNick = cleanUsername(pNick);
            const isAuthor = pNick.toLowerCase() === (post.user || '').toLowerCase();

            const postRating = post.ratings && typeof post.ratings[pNick] === 'number' ? post.ratings[pNick] : 0;
            const userPokedex = allPokedexProfiles?.[pNick] || allPokedexProfiles?.[uKey];
            const dexRating = userPokedex?.[`${post.brand}-${post.variant}`]?.rating || 0;
            const fallbackRating = isAuthor && typeof post.rating === 'number' ? post.rating : 0;
            const pRating = postRating || dexRating || fallbackRating || 0;

            return (
              <div
                key={pNick}
                onClick={() => {
                  onClose();
                  onOpenPublicProfile(pNick);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '16px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, marginRight: '8px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      padding: '2px',
                      background: isAuthor
                        ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                        : 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)',
                      boxShadow: isAuthor ? '0 2px 6px rgba(245, 158, 11, 0.25)' : 'none',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {av ? (
                        <img src={av} alt={cleanNick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>
                          {disp.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{disp}</span>
                      {isAuthor && (
                        <span
                          style={{
                            fontSize: '9px',
                            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                            color: 'white',
                            padding: '1px 6px',
                            borderRadius: '8px',
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          Creatore
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{cleanNick}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {pRating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#FEF3C7', padding: '3px 7px', borderRadius: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#D97706', fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#B45309' }}>{pRating.toFixed(1)}</span>
                    </div>
                  )}
                  <span className="material-symbols-outlined" style={{ color: '#CBD5E1', fontSize: '18px' }}>
                    chevron_right
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
