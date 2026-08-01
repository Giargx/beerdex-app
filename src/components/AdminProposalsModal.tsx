import React, { useState } from 'react';
import { formatBeerTitle } from '../beers';

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
  flaggedPosts?: Record<string, any>;
  onRemoveFlaggedPost?: (postId: string, postUser: string, brand: string, variant: string) => void;
  onDismissFlaggedPost?: (postId: string) => void;
  initialTab?: 'proposals' | 'flagged';
}

const ItalianRegions = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'
];

export const AdminProposalsModal: React.FC<AdminProposalsModalProps> = ({
  isOpen,
  onClose,
  proposals,
  onAcceptProposal,
  onRejectProposal,
  globalAvatars,
  globalDisplayNames,
  flaggedPosts = {},
  onRemoveFlaggedPost,
  onDismissFlaggedPost,
  initialTab = 'proposals',
}) => {
  const [activeTab, setActiveTab] = useState<'proposals' | 'flagged'>(initialTab);
  const [showEditMap, setShowEditMap] = useState<Record<string, boolean>>({});
  const [editedDataMap, setEditedDataMap] = useState<Record<string, {
    brand: string;
    variant: string;
    country: string;
    regione: string;
    rarity: "comune" | "media" | "rara";
    desc: string;
  }>>({});

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const toggleEdit = (item: BeerProposalItem) => {
    const isCurrentlyEditing = !!showEditMap[item.proposalId];
    if (!isCurrentlyEditing && !editedDataMap[item.proposalId]) {
      setEditedDataMap((prev) => ({
        ...prev,
        [item.proposalId]: {
          brand: formatBeerTitle(item.brand),
          variant: formatBeerTitle(item.variant),
          country: item.country || 'Non specificata',
          regione: item.regione || 'Tutte',
          rarity: item.rarity || 'comune',
          desc: item.desc || '',
        },
      }));
    }
    setShowEditMap((prev) => ({
      ...prev,
      [item.proposalId]: !isCurrentlyEditing,
    }));
  };

  const updateField = (proposalId: string, field: string, value: any) => {
    setEditedDataMap((prev) => ({
      ...prev,
      [proposalId]: {
        ...(prev[proposalId] || {
          brand: '',
          variant: '',
          country: 'Italia',
          regione: 'Tutte',
          rarity: 'comune',
          desc: '',
        }),
        [field]: value,
      },
    }));
  };

  const handleAcceptClick = (item: BeerProposalItem) => {
    const edit = editedDataMap[item.proposalId];
    const rawBrand = edit ? edit.brand : item.brand;
    const rawVariant = edit ? edit.variant : item.variant;
    const rawCountry = edit ? edit.country : item.country;
    const rawRegione = edit ? edit.regione : item.regione;
    const rawRarity = edit ? edit.rarity : item.rarity;
    const rawDesc = edit ? edit.desc : item.desc;

    const formattedBrand = formatBeerTitle(rawBrand.trim());
    const formattedVariant = formatBeerTitle(rawVariant.trim());

    const finalProposal: BeerProposalItem = {
      ...item,
      brand: formattedBrand,
      variant: formattedVariant,
      country: rawCountry || 'Italia',
      regione: rawCountry === 'Italia' && rawRegione && rawRegione !== 'Tutte' ? rawRegione : undefined,
      rarity: rawRarity,
      desc: rawDesc && rawDesc.trim() ? rawDesc.trim() : `Birra ${formattedBrand} (${formattedVariant})`,
    };

    onAcceptProposal(finalProposal);
  };

  const pendingProposals = (proposals || []).filter((p) => p && p.status === 'pending');
  const flaggedList = Object.values(flaggedPosts || {});

  return (
    <div className="auth-modal" style={{ zIndex: 19500 }}>
      <div
        className="auth-container"
        style={{
          maxWidth: '560px',
          width: '95%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          padding: '24px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--gray)', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, color: 'var(--dark)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary-dark)' }}>admin_panel_settings</span>
            Pannello Moderazione Admin
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

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            onClick={() => setActiveTab('proposals')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '12px',
              border: activeTab === 'proposals' ? '2px solid var(--primary-dark)' : '1px solid var(--gray)',
              background: activeTab === 'proposals' ? '#FFFBEB' : 'white',
              color: activeTab === 'proposals' ? 'var(--dark)' : 'var(--text-muted)',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sports_bar</span>
            Proposte ({pendingProposals.length})
          </button>
          <button
            onClick={() => setActiveTab('flagged')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '12px',
              border: activeTab === 'flagged' ? '2px solid #EF4444' : '1px solid var(--gray)',
              background: activeTab === 'flagged' ? '#FEF2F2' : 'white',
              color: activeTab === 'flagged' ? '#DC2626' : 'var(--text-muted)',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
            Post Segnalati ({flaggedList.length})
          </button>
        </div>

        <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '4px' }}>
          {activeTab === 'flagged' ? (
            flaggedList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '10px', color: '#10B981' }}>verified_user</span>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Nessun post segnalato al momento</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>I post con 4+ segnalazioni appariranno qui per la revisione.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {flaggedList.map((item: any) => {
                  const pData = item.postData || {};
                  const userDisp = globalDisplayNames[item.postUser] || item.postUser;
                  const userAvat = globalAvatars[item.postUser];

                  return (
                    <div
                      key={item.postId}
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: '16px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0e6ed', overflow: 'hidden' }}>
                            {userAvat ? (
                              <img src={userAvat} alt={item.postUser} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text-muted)' }}>person</span>
                            )}
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--dark)' }}>{userDisp}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{item.postUser}</div>
                          </div>
                        </div>
                        <span style={{ background: '#DC2626', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px' }}>
                          ⚠️ {item.reportCount || 4} Segnalazioni
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'white', padding: '10px', borderRadius: '12px', border: '1px solid #FECACA' }}>
                        {(pData.photo || pData.photoUrl) ? (
                          <img
                            src={pData.photo || pData.photoUrl}
                            alt={item.brand}
                            style={{ width: '75px', height: '75px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--gray)' }}
                          />
                        ) : (
                          <div style={{ width: '75px', height: '75px', borderRadius: '10px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>sports_bar</span>
                          </div>
                        )}
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: 'var(--dark)' }}>{item.brand}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{item.variant}</p>
                          {pData.notes && (
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#4B5563', fontStyle: 'italic' }}>"{pData.notes}"</p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          onClick={() => onRemoveFlaggedPost && onRemoveFlaggedPost(item.postId, item.postUser, item.brand, item.variant)}
                          style={{
                            flex: 1,
                            background: '#DC2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '9px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                          Rimuovi Post & Foto
                        </button>
                        <button
                          onClick={() => onDismissFlaggedPost && onDismissFlaggedPost(item.postId)}
                          style={{
                            flex: 1,
                            background: '#E5E7EB',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '9px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                          Ignora / Mantieni
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : pendingProposals.length === 0 ? (
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

                const isEditing = !!showEditMap[item.proposalId];
                const currentData = editedDataMap[item.proposalId] || {
                  brand: formatBeerTitle(item.brand),
                  variant: formatBeerTitle(item.variant),
                  country: item.country || 'Non specificata',
                  regione: item.regione || 'Tutte',
                  rarity: item.rarity || 'comune',
                  desc: item.desc || '',
                };

                return (
                  <div
                    key={item.proposalId}
                    style={{
                      background: 'var(--white)',
                      border: isEditing ? '2px solid var(--primary)' : '1px solid var(--gray)',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => toggleEdit(item)}
                          style={{
                            border: '1px solid var(--gray)',
                            background: isEditing ? '#FEF3C7' : '#F8FAFC',
                            color: isEditing ? '#92400E' : 'var(--dark)',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                          {isEditing ? 'Chiudi Modifica' : 'Modifica Campi'}
                        </button>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: currentData.rarity === 'rara' ? '#fef3c7' : currentData.rarity === 'media' ? '#e0f2fe' : '#f1f5f9',
                            color: currentData.rarity === 'rara' ? '#b45309' : currentData.rarity === 'media' ? '#0369a1' : '#475569',
                            textTransform: 'uppercase',
                          }}
                        >
                          {currentData.rarity}
                        </span>
                      </div>
                    </div>

                    {/* Content & Photo Display */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      {item.photo && (
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--gray)' }}>
                          <img src={item.photo} alt={currentData.brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ flexGrow: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--primary-dark)' }}>
                          {currentData.brand}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--dark)' }}>
                          {currentData.variant}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Nazione: <strong>{currentData.country}</strong> {currentData.country === 'Italia' && currentData.regione && currentData.regione !== 'Tutte' ? `(${currentData.regione})` : ''}
                        </div>
                        {currentData.desc && (
                          <div style={{ fontSize: '12px', color: 'var(--dark)', marginTop: '4px', fontStyle: 'italic', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px' }}>
                            "{currentData.desc}"
                          </div>
                        )}
                        {(!currentData.country || currentData.country === 'Non specificata' || (currentData.country === 'Italia' && (!currentData.regione || currentData.regione === 'Tutte'))) && (
                          <div style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '6px 10px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>warning</span>
                            Info mancanti: {!currentData.country || currentData.country === 'Non specificata' ? 'Nazione non specificata. ' : ''}{currentData.country === 'Italia' && (!currentData.regione || currentData.regione === 'Tutte') ? 'Regione italiana non specificata.' : ''} Completa i campi prima di approvare!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* EDITABLE FORM FOR ADMIN */}
                    {isEditing && (
                      <div style={{ background: '#FFFDF5', border: '1px dashed #F59E0B', borderRadius: '12px', padding: '12px', marginTop: '4px', textAlign: 'left' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#92400E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>tune</span>
                          Modifica / Completa Campi Proposta prima di Approvare:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Marca / Birrificio</label>
                            <input
                              type="text"
                              value={currentData.brand}
                              onChange={(e) => updateField(item.proposalId, 'brand', e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', fontSize: '12px', margin: 0 }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Variante / Stile</label>
                            <input
                              type="text"
                              value={currentData.variant}
                              onChange={(e) => updateField(item.proposalId, 'variant', e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', fontSize: '12px', margin: 0 }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: currentData.country === 'Italia' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Nazione</label>
                            <select
                              value={currentData.country}
                              onChange={(e) => updateField(item.proposalId, 'country', e.target.value)}
                              style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '8px' }}
                            >
                              <option value="Non specificata">Non specificata</option>
                              <option value="Italia">Italia</option>
                              <option value="Germania">Germania</option>
                              <option value="Belgio">Belgio</option>
                              <option value="Paesi Bassi">Paesi Bassi</option>
                              <option value="Repubblica Ceca">Repubblica Ceca</option>
                              <option value="Danimarca">Danimarca</option>
                              <option value="Spagna">Spagna</option>
                              <option value="Francia">Francia</option>
                              <option value="Irlanda">Irlanda</option>
                              <option value="Scozia">Scozia</option>
                              <option value="Portogallo">Portogallo</option>
                              <option value="Messico">Messico</option>
                              <option value="Stati Uniti">Stati Uniti</option>
                              <option value="Giappone">Giappone</option>
                              <option value="Altra">Altra</option>
                            </select>
                          </div>

                          {currentData.country === 'Italia' && (
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Regione</label>
                              <select
                                value={currentData.regione || 'Tutte'}
                                onChange={(e) => updateField(item.proposalId, 'regione', e.target.value)}
                                style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '8px' }}
                              >
                                <option value="Tutte">Nessuna specifica</option>
                                {ItalianRegions.map((reg) => (
                                  <option key={reg} value={reg}>{reg}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Rarità</label>
                            <select
                              value={currentData.rarity}
                              onChange={(e) => updateField(item.proposalId, 'rarity', e.target.value as any)}
                              style={{ width: '100%', padding: '6px', fontSize: '12px', borderRadius: '8px' }}
                            >
                              <option value="comune">Comune (1 pt)</option>
                              <option value="media">Media (2 pt)</option>
                              <option value="rara">Rara (5 pt)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>Descrizione / Note</label>
                          <input
                            type="text"
                            value={currentData.desc || ''}
                            onChange={(e) => updateField(item.proposalId, 'desc', e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', fontSize: '12px', margin: 0 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        className="btn-main"
                        onClick={() => handleAcceptClick(item)}
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
