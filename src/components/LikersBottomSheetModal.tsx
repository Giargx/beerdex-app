import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LikersBottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes?: Record<string, boolean>;
  globalDisplayNames?: Record<string, string>;
  globalAvatars?: Record<string, string>;
  onOpenPublicProfile: (username: string) => void;
}

const cleanUsername = (str?: string): string => {
  if (!str) return '';
  const trimmed = str.trim();
  if (trimmed.includes('@')) {
    return trimmed.split('@')[0];
  }
  return trimmed;
};

export const LikersBottomSheetModal: React.FC<LikersBottomSheetModalProps> = ({
  isOpen,
  onClose,
  likes = {},
  globalDisplayNames = {},
  globalAvatars = {},
  onOpenPublicProfile,
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const likerNicks = Object.keys(likes).filter((nick) => Boolean(likes[nick]));

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
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#F59E0B' }}>
              sports_bar
            </span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
              Chi ha brindato ({likerNicks.length})
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
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px', WebkitOverflowScrolling: 'touch' }}>
          {likerNicks.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px', margin: '20px 0' }}>
              Nessun brindisi per ora. Sii il primo a brindare! 🍺
            </p>
          ) : (
            likerNicks.map((nick) => {
              const uKey = nick.toLowerCase();
              const av = globalAvatars[nick] || globalAvatars[uKey];
              const rawDisp = globalDisplayNames?.[nick] || globalDisplayNames?.[uKey] || nick;
              const disp = cleanUsername(rawDisp);
              const cleanNick = cleanUsername(nick);

              return (
                <div
                  key={nick}
                  onClick={() => {
                    onClose();
                    onOpenPublicProfile(nick);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    background: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    WebkitTapHighlightColor: 'rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '18px',
                        flexShrink: 0,
                      }}
                    >
                      {av ? (
                        <img src={av} alt={disp} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        disp.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        {disp}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                        @{cleanNick}
                      </div>
                    </div>
                  </div>

                  <span className="material-symbols-outlined" style={{ color: '#CBD5E1', fontSize: '20px' }}>
                    chevron_right
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

