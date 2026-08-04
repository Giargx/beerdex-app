import React, { useState } from 'react';

interface ReportPostModalProps {
  isOpen: boolean;
  post: {
    postId: string;
    user: string;
    brand: string;
    variant: string;
  } | null;
  onClose: () => void;
  onSubmitReport: (postId: string, postUser: string, brand: string, variant: string, reason: string, details?: string) => void;
}

export const REPORT_REASONS = [
  { id: 'fake_photo', icon: 'photo_camera', label: 'Foto non veritiera o presa da Internet' },
  { id: 'not_beer', icon: 'no_drinks', label: 'Il soggetto nella foto non è una birra' },
  { id: 'inappropriate', icon: 'warning', label: 'Contenuto inopportuno o inappropriato' },
  { id: 'duplicate', icon: 'content_copy', label: 'Post duplicato o spam' },
  { id: 'other', icon: 'edit_note', label: 'Altro motivo' },
];

export const ReportPostModal: React.FC<ReportPostModalProps> = ({
  isOpen,
  post,
  onClose,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('fake_photo');
  const [details, setDetails] = useState<string>('');

  if (!isOpen || !post) return null;

  const handleSubmit = () => {
    const reasonObj = REPORT_REASONS.find((r) => r.id === selectedReason);
    const reasonLabel = reasonObj ? reasonObj.label : selectedReason;
    onSubmitReport(post.postId, post.user, post.brand, post.variant, reasonLabel, details);
    onClose();
  };

  return (
    <div className="auth-modal" style={{ zIndex: 22000, padding: '20px 12px' }}>
      <div
        className="auth-container"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '24px 20px',
          borderRadius: '24px',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: '#EF4444', fontSize: '24px' }}>
              flag
            </span>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>
              Segnala Post
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
          Seleziona il motivo per cui desideri segnalare la foto di{' '}
          <strong style={{ color: '#0F172A' }}>@{post.user}</strong> ({post.brand}):
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {REPORT_REASONS.map((r) => {
            const isSelected = selectedReason === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedReason(r.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                  background: isSelected ? 'rgba(245, 158, 11, 0.06)' : '#F8FAFC',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: isSelected ? '#D97706' : '#64748B', fontSize: '20px' }}
                >
                  {r.icon}
                </span>
                <span style={{ fontSize: '13px', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#78350F' : '#334155', flexGrow: 1 }}>
                  {r.label}
                </span>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: isSelected ? '5px solid #F59E0B' : '2px solid #CBD5E1',
                    background: '#FFFFFF',
                  }}
                />
              </div>
            );
          })}
        </div>

        {selectedReason === 'other' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
              Dettagli aggiuntivi (opzionale):
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Descrivi brevemente il motivo..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            className="btn-main"
            onClick={handleSubmit}
            style={{ flex: 1, justifyContent: 'center', background: '#EF4444', borderColor: '#EF4444' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
            Invia Segnalazione
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};
