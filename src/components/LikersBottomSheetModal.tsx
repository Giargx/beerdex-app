import React from 'react';

interface LikersBottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes?: Record<string, boolean>;
  globalDisplayNames?: Record<string, string>;
  globalAvatars?: Record<string, string>;
  onOpenPublicProfile: (username: string) => void;
}

export const LikersBottomSheetModal: React.FC<LikersBottomSheetModalProps> = ({
  isOpen,
  onClose,
  likes = {},
  globalDisplayNames = {},
  globalAvatars = {},
  onOpenPublicProfile,
}) => {
  if (!isOpen) return null;

  const likerNicks = Object.keys(likes).filter((nick) => Boolean(likes[nick]));

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 22000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '28px 28px 0 0',
          padding: '16px 20px 32px 20px',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
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
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '2px' }}>
          {likerNicks.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px', margin: '20px 0' }}>
              Nessun brindisi per ora. Sii il primo a brindare! 🍺
            </p>
          ) : (
            likerNicks.map((nick) => {
              const uKey = nick.toLowerCase();
              const av = globalAvatars[nick] || globalAvatars[uKey];
              const disp = globalDisplayNames?.[nick] || globalDisplayNames?.[uKey] || nick;

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
                        @{nick}
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
};
