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
    <div className="auth-modal" style={{ zIndex: 21500, padding: '20px 12px' }} onClick={onClose}>
      <div
        className="auth-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '380px',
          width: '100%',
          padding: '20px',
          borderRadius: '24px',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>
            Opzioni Post
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Salva Post */}
          <button
            onClick={() => {
              onSavePost(post.postId);
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '14px',
              border: 'none',
              background: '#F8FAFC',
              color: '#334155',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: isSaved ? '#F59E0B' : '#64748B' }}>
              {isSaved ? 'bookmark_added' : 'bookmark'}
            </span>
            {isSaved ? 'Rimuovi dai Segnalibri' : 'Salva Post nei Segnalibri'}
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
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '14px',
              border: 'none',
              background: '#F8FAFC',
              color: '#334155',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#D97706' }}>
              auto_awesome
            </span>
            Ricondividi nelle Storie (24h)
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
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '14px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.06)',
                color: '#EF4444',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#EF4444' }}>
                flag
              </span>
              Segnala Post...
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
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '14px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#DC2626',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#DC2626' }}>
                delete
              </span>
              Elimina Post
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
