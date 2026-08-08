import React, { useState } from 'react';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserNick: string;
  displayName: string;
  avatarUrl?: string;
  userScore: number;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  isOpen,
  onClose,
  currentUserNick,
  displayName,
  avatarUrl,
  userScore,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?friend=${encodeURIComponent(currentUserNick)}`;
  const shareText = `🍺 Ehi! Aggiungimi su POP IT per sbloccare le birre insieme ed entrare nella mia cerchia di amici! Clicca sul link per connetterti subito:\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `POP IT - Diventa amico di @${currentUserNick}`,
          text: `🍺 Aggiungimi su POP IT per collezionare birre insieme!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  // Generate dynamic QR Code for in-person instant scanning
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}&color=0F172A&bgcolor=FFFFFF`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
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
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with background gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            padding: '24px 20px 20px 20px',
            color: '#FFFFFF',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              close
            </span>
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(4px)',
              marginBottom: '10px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#FFFFFF' }}>
              person_add
            </span>
          </div>

          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900 }}>Condividi Profilo & Invita</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9, fontWeight: 500 }}>
            Invia il tuo link per aggiungere amici in 1-Click!
          </p>
        </div>

        {/* Body content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* User Profile Card Preview */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#E2E8F0',
                border: '2px solid #F59E0B',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={currentUserNick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#94A3B8' }}>
                  person
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName || currentUserNick}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>@{currentUserNick}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#D97706' }}>{userScore} pt</div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700 }}>Punteggio</div>
            </div>
          </div>

          {/* Action buttons grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={handleShareWhatsApp}
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                chat
              </span>
              WhatsApp
            </button>

            <button
              onClick={handleNativeShare}
              style={{
                background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(225, 48, 108, 0.25)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                share
              </span>
              Social / Altro
            </button>
          </div>

          {/* Copy Direct Link button */}
          <button
            onClick={handleCopyLink}
            style={{
              background: copied ? '#ECFDF5' : '#F1F5F9',
              color: copied ? '#059669' : '#334155',
              border: copied ? '1.5px solid #10B981' : '1px solid #CBD5E1',
              borderRadius: '14px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {copied ? 'check_circle' : 'content_copy'}
            </span>
            {copied ? 'Link Copiato negli appunti!' : 'Copia Link Amicizia Diretto'}
          </button>

          {/* In-Person QR Code Section */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px stroke #E2E8F0',
              borderRadius: '16px',
              padding: '14px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📱 QR Code per Aggiunta dal Vivo
            </div>
            <div
              style={{
                background: '#FFFFFF',
                padding: '8px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #E2E8F0',
              }}
            >
              <img
                src={qrCodeUrl}
                alt="QR Code Amicizia"
                style={{ width: '130px', height: '130px', display: 'block', borderRadius: '6px' }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
              Fai inquadrare questo QR Code alla fotocamera dei tuoi amici al pub!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
