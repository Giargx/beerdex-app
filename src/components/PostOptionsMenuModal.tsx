import React from 'react';

interface PostOptionsMenuModalProps {
  isOpen: boolean;
  post: {
    postId: string;
    user: string;
    brand: string;
    variant: string;
  } | null;
  currentUserNick: string;
  isAdminUser: boolean;
  isSaved?: boolean;
  onClose: () => void;
  onSavePost: (postId: string) => void;
  onShareToStory: (postId: string) => void;
  onOpenReportModal: (post: any) => void;
  onDeletePost?: (postId: string, user: string, brand: string, variant: string) => void;
}

export const PostOptionsMenuModal: React.FC<PostOptionsMenuModalProps> = ({
  isOpen,
  post,
  currentUserNick,
  isAdminUser,
  isSaved = false,
  onClose,
  onSavePost,
  onShareToStory,
  onOpenReportModal,
  onDeletePost,
}) => {
  if (!isOpen || !post) return null;

  const canDelete = post.user === currentUserNick || isAdminUser;
  const canReport = post.user !== currentUserNick && !isAdminUser;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 16px 0',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#FFFFFF',
          borderRadius: '24px 24px 20px 20px',
          padding: '24px 20px 20px 20px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
          textAlign: 'left',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header Drag Pill */}
        <div
          style={{
            width: '40px',
            height: '4px',
            background: '#CBD5E1',
            borderRadius: '2px',
            margin: '0 auto 18px auto',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: 900 }}>
              Opzioni Post
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
              {post.brand} ({post.variant})
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Salva Post */}
          <button
            onClick={() => {
              onSavePost(post.postId);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#0F172A',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: isSaved ? '#F59E0B' : '#64748B', fontSize: '22px' }}>
              {isSaved ? 'bookmark_added' : 'bookmark'}
            </span>
            <span>{isSaved ? 'Rimuovi dai Segnalibri' : 'Salva Post nei Segnalibri'}</span>
          </button>

          {/* Condividi nelle Storie */}
          <button
            onClick={() => {
              onShareToStory(post.postId);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '16px',
              border: '1px solid #FDE68A',
              background: '#FFFDF5',
              color: '#D97706',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '22px' }}>
              auto_awesome
            </span>
            <span>Ricondividi nelle Storie (24h)</span>
          </button>

          {/* Segnala Post */}
          {canReport && (
            <button
              onClick={() => {
                onClose();
                onOpenReportModal(post);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '16px',
                border: '1px solid #FCA5A5',
                background: '#FEF2F2',
                color: '#EF4444',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#EF4444', fontSize: '22px' }}>
                flag
              </span>
              <span>Segnala Post...</span>
            </button>
          )}

          {/* Elimina Post (Owner or Admin) */}
          {canDelete && onDeletePost && (
            <button
              onClick={() => {
                onClose();
                onDeletePost(post.postId, post.user, post.brand, post.variant);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '16px',
                border: '1px solid #FECACA',
                background: '#FEF2F2',
                color: '#DC2626',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#DC2626', fontSize: '22px' }}>
                delete
              </span>
              <span>Elimina Post</span>
            </button>
          )}

          {/* Cancel button */}
          <button
            onClick={onClose}
            style={{
              marginTop: '4px',
              padding: '12px',
              borderRadius: '16px',
              border: 'none',
              background: '#F1F5F9',
              color: '#64748B',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};
