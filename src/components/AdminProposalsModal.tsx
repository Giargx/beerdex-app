import React from 'react';

export interface BeerProposalItem {
  proposalId: string;
  brand: string;
  variant: string;
  country: string;
  regione?: string;
  rarity: "comune" | "media" | "rara";
  desc?: string;
  photo: string;
  proposedBy: string;
  timestamp: number;
  status: "pending" | "accepted" | "rejected";
}

interface AdminProposalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: BeerProposalItem[];
  onAcceptProposal: (proposal: BeerProposalItem) => void;
  onRejectProposal: (proposalId: string) => void;
  globalAvatars: Record<string, string>;
  globalDisplayNames: Record<string, string>;
}

export const AdminProposalsModal: React.FC<AdminProposalsModalProps> = ({
  isOpen,
  onClose,
  proposals,
  onAcceptProposal,
  onRejectProposal,
  globalAvatars,
  globalDisplayNames,
}) => {
  if (!isOpen) return null;

  const pendingProposals = proposals.filter((p) => p.status === 'pending');

  return (
    <div className="auth-modal" style={{ zIndex: 19500 }}>
      <div
        className="auth-container"
        style={{
          maxWidth: '550px',
          width: '94%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '24px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--gray)', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, color: 'var(--dark)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary-dark)' }}>admin_panel_settings</span>
            Proposte Birre Pendenti ({pendingProposals.length})
          </h3>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '24px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '4px' }}>
          {pendingProposals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '10px' }}>check_circle</span>
              <p style={{ margin: 0, fontSize: '14px' }}>Nessuna proposta pendente al momento.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingProposals.map((item) => {
                const authorAvatar = globalAvatars[item.proposedBy];
                const authorName = globalDisplayNames[item.proposedBy] || item.proposedBy;
                const dateStr = new Date(item.timestamp).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.proposalId}
                    style={{
                      background: 'var(--white)',
                      border: '1px solid var(--gray)',
                      borderRadius: '16px',
                      padding: '16px',
                      boxShadow: 'var(--card-shadow)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Proposal Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0' }}>
                          {authorAvatar ? (
                            <img src={authorAvatar} alt={item.proposedBy} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', margin: '6px' }}>person</span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--dark)' }}>@{authorName}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Proposta il {dateStr}</div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: item.rarity === 'rara' ? '#fef3c7' : item.rarity === 'media' ? '#e0f2fe' : '#f1f5f9',
                          color: item.rarity === 'rara' ? '#b45309' : item.rarity === 'media' ? '#0369a1' : '#475569',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.rarity}
                      </span>
                    </div>

                    {/* Content & Photo */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      {item.photo && (
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--gray)' }}>
                          <img src={item.photo} alt={item.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ flexGrow: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--primary-dark)' }}>
                          {item.brand}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--dark)' }}>
                          {item.variant}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Nazione: <strong>{item.country}</strong> {item.regione ? `(${item.regione})` : ''}
                        </div>
                        {item.desc && (
                          <div style={{ fontSize: '12px', color: 'var(--dark)', marginTop: '4px', fontStyle: 'italic', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px' }}>
                            "{item.desc}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        className="btn-main"
                        onClick={() => onAcceptProposal(item)}
                        style={{
                          flex: 1,
                          margin: 0,
                          padding: '10px',
                          fontSize: '13px',
                          background: '#10B981',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                        Accetta (+2pt a @{item.proposedBy})
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => onRejectProposal(item.proposalId)}
                        style={{
                          flex: 1,
                          margin: 0,
                          padding: '10px',
                          fontSize: '13px',
                          color: 'var(--danger)',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                        Rifiuta
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
