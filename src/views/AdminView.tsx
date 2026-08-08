import React, { useState } from 'react';
import { formatBeerTitle } from '../beers';
import { FoamBubbles } from '../components/FoamBubbles';
import type { BeerProposalItem } from '../components/AdminProposalsModal';

import type { Beer } from '../beers';

export interface AdminViewProps {
  onBack: () => void;
  initialTab?: 'users' | 'proposals' | 'flagged' | 'feedback' | 'move_variant';
  proposals: BeerProposalItem[];
  onAcceptProposal: (proposal: BeerProposalItem) => void;
  onRejectProposal: (proposalId: string) => void;
  globalAvatars: Record<string, string>;
  globalDisplayNames: Record<string, string>;
  flaggedPosts?: Record<string, any>;
  onRemoveFlaggedPost?: (postId: string, postUser: string, brand: string, variant: string) => void;
  onDismissFlaggedPost?: (postId: string) => void;
  onDeleteUserProfile?: (username: string) => void;
  onRecalculateUserScore?: (username: string) => Promise<void> | void;
  onOpenPublicProfile?: (username: string) => void;
  leaderboardScores?: Record<string, number>;
  allPokedexProfiles?: Record<string, Record<string, any>>;
  feedbacks?: Record<string, any> | any[];
  onDeleteFeedback?: (feedbackId: string) => void;
  onMarkFeedbackRead?: (feedbackId: string) => void;
  targetUsername?: string;
  initialOldKey?: string;
  allBeersCatalog?: Beer[];
  onConfirmMove?: (targetUsername: string, oldKey: string, newBrand: string, newVariant: string) => Promise<void> | void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onBack,
  initialTab = 'users',
  proposals = [],
  onAcceptProposal,
  onRejectProposal,
  globalAvatars = {},
  globalDisplayNames = {},
  flaggedPosts = {},
  onRemoveFlaggedPost,
  onDismissFlaggedPost,
  onDeleteUserProfile,
  onRecalculateUserScore,
  onOpenPublicProfile,
  leaderboardScores = {},
  allPokedexProfiles = {},
  feedbacks = {},
  onDeleteFeedback,
  onMarkFeedbackRead,
  targetUsername = '',
  initialOldKey = '',
  allBeersCatalog = [],
  onConfirmMove,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'proposals' | 'flagged' | 'feedback' | 'move_variant'>(initialTab);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterTab, setUserFilterTab] = useState<'all' | 'top' | 'novice' | 'rich'>('all');
  const [userSortOption, setUserSortOption] = useState<'score_desc' | 'score_asc' | 'unlocked_desc' | 'name_asc'>('score_desc');
  const [userPageLimit, setUserPageLimit] = useState<number>(15);
  const [recalculatingUserMap, setRecalculatingUserMap] = useState<Record<string, boolean>>({});
  const [recalculateBannerMsg, setRecalculateBannerMsg] = useState<string | null>(null);

  // Sposta Variante Page Tab States
  const [moveUser, setMoveUser] = useState(targetUsername);
  const [moveOldKey, setMoveOldKey] = useState(initialOldKey);
  const [moveSelectedBrand, setMoveSelectedBrand] = useState<string>('');
  const [moveSelectedVariant, setMoveSelectedVariant] = useState<string>('');
  const [moveCustomVariant, setMoveCustomVariant] = useState<string>('');
  const [isMoveSubmitting, setIsMoveSubmitting] = useState(false);
  const [moveMessage, setMoveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    setMoveUser(targetUsername);
    setMoveOldKey(initialOldKey);
    if (allBeersCatalog && allBeersCatalog.length > 0) {
      const defaultBrand = allBeersCatalog.find((b) => b && b.brand === 'Abbaye de Forest') || allBeersCatalog[0];
      if (defaultBrand) {
        setMoveSelectedBrand(defaultBrand.brand);
        setMoveSelectedVariant((defaultBrand.variants && defaultBrand.variants[0]) || 'Classica');
      }
    }
  }, [targetUsername, initialOldKey, allBeersCatalog]);

  const handleMoveBrandChange = (brandName: string) => {
    setMoveSelectedBrand(brandName);
    const found = allBeersCatalog.find((b) => b && b.brand === brandName);
    if (found && found.variants && found.variants.length > 0) {
      setMoveSelectedVariant(found.variants[0]);
    } else {
      setMoveSelectedVariant('Classica');
    }
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveUser.trim()) {
      setMoveMessage({ text: 'Inserisci il nickname dell\'utente.', type: 'error' });
      return;
    }
    if (!moveOldKey.trim()) {
      setMoveMessage({ text: 'Inserisci la chiave o il nome della birra attuale da spostare.', type: 'error' });
      return;
    }
    if (!moveSelectedBrand.trim()) {
      setMoveMessage({ text: 'Seleziona la marca di destinazione.', type: 'error' });
      return;
    }
    if (!onConfirmMove) {
      setMoveMessage({ text: 'Funzione di spostamento non disponibile.', type: 'error' });
      return;
    }

    const finalVariant = (moveCustomVariant.trim() || moveSelectedVariant.trim() || 'Classica');
    setIsMoveSubmitting(true);
    setMoveMessage(null);

    try {
      await onConfirmMove(moveUser.trim(), moveOldKey.trim(), moveSelectedBrand.trim(), finalVariant);
      setIsMoveSubmitting(false);
      setMoveMessage({ text: `✅ Birra "${moveOldKey}" di @${moveUser} spostata con successo in ${moveSelectedBrand} (${finalVariant})!`, type: 'success' });
    } catch (err: any) {
      setIsMoveSubmitting(false);
      setMoveMessage({ text: err.message || 'Errore durante lo spostamento della birra.', type: 'error' });
    }
  };

  const [showEditMap, setShowEditMap] = useState<Record<string, boolean>>({});
  const [editedDataMap, setEditedDataMap] = useState<Record<string, {
    brand: string;
    variant: string;
    beerType?: string;
    country: string;
    regione: string;
    rarity: "comune" | "media" | "rara";
    desc: string;
  }>>({});

  const pendingProposals = (proposals || []).filter((p) => p && p.status === 'pending');
  const flaggedList = Object.values(flaggedPosts || {});
  const feedbacksList = Array.isArray(feedbacks) ? feedbacks : Object.values(feedbacks || {});
  const unreadFeedbackCount = feedbacksList.filter((f: any) => f && f.status !== 'read').length;

  const toggleEdit = (item: BeerProposalItem) => {
    const isCurrentlyEditing = !!showEditMap[item.proposalId];
    if (!isCurrentlyEditing && !editedDataMap[item.proposalId]) {
      setEditedDataMap((prev) => ({
        ...prev,
        [item.proposalId]: {
          brand: formatBeerTitle(item.brand),
          variant: formatBeerTitle(item.variant),
          beerType: item.beerType || 'bionda',
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
          beerType: 'bionda',
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
    const rawBeerType = edit ? edit.beerType : item.beerType;
    const rawCountry = edit ? edit.country : item.country;
    const rawRegione = edit ? edit.regione : item.regione;
    const rawRarity = edit ? edit.rarity : item.rarity;
    const rawDesc = edit ? edit.desc : item.desc;

    const formattedBrand = formatBeerTitle(rawBrand.trim());
    const formattedVariant = formatBeerTitle(rawVariant.trim());
    const formattedCountry = formatBeerTitle((rawCountry || 'Non specificata').trim());

    const finalProposal: BeerProposalItem = {
      ...item,
      brand: formattedBrand,
      variant: formattedVariant,
      beerType: (rawBeerType as any) || 'bionda',
      country: formattedCountry,
      regione: formattedCountry.toLowerCase() === 'italia' && rawRegione && rawRegione !== 'Tutte' ? rawRegione : undefined,
      rarity: rawRarity,
      desc: rawDesc && rawDesc.trim() ? rawDesc.trim() : `Birra ${formattedBrand} (${formattedVariant})`,
      isVariantProposal: item.isVariantProposal,
      bonusPoints: item.bonusPoints ?? (item.isVariantProposal ? 1 : 2),
    };

    onAcceptProposal(finalProposal);
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#FAF9F6',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        paddingBottom: 'env(safe-area-inset-bottom, 40px)',
      }}
    >
      {/* Header View Page */}
      <header className="hero" style={{ position: 'relative', minHeight: '130px', padding: '24px 20px 16px 20px' }}>
        <FoamBubbles />
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '20px',
            padding: '6px 14px',
            color: 'var(--dark)',
            fontWeight: 800,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Indietro
        </button>
        <h1 style={{ position: 'relative', zIndex: 2, margin: '24px 0 4px 0', fontSize: '24px', fontWeight: 900 }}>
          Pannello Amministratore 🛡️
        </h1>
        <p style={{ position: 'relative', zIndex: 2, margin: 0, fontSize: '13px', opacity: 0.9 }}>
          Gestione completa utenti, approvazione birre, moderazione post e consigli.
        </p>
      </header>

      {/* Main Container Centered */}
      <div
        style={{
          maxWidth: '720px',
          width: '95%',
          margin: '0 auto',
          padding: '16px 0 30px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            background: '#FFFFFF',
            padding: '6px',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            position: 'sticky',
            top: '10px',
            zIndex: 100,
          }}
        >
          {[
            { id: 'users', label: 'Utenti', icon: 'manage_accounts', badge: 0, color: '#6366F1' },
            { id: 'proposals', label: 'Proposte', icon: 'sports_bar', badge: pendingProposals.length, color: '#F59E0B' },
            { id: 'flagged', label: 'Segnalazioni', icon: 'report_problem', badge: flaggedList.length, color: '#E11D48' },
            { id: 'feedback', label: 'Consigli', icon: 'rate_review', badge: unreadFeedbackCount, color: '#10B981' },
            { id: 'move_variant', label: 'Sposta', icon: 'move_down', badge: 0, color: '#8B5CF6' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  padding: '8px 4px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #1E293B, #0F172A)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontWeight: isActive ? 800 : 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? '#FFB300' : tab.color }}>
                    {tab.icon}
                  </span>
                  <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
                </div>
                {tab.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 900,
                      borderRadius: '10px',
                      padding: '1px 5px',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View Tab Body */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '18px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          {activeTab === 'users' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(() => {
                const userNicks = Array.from(
                  new Set([
                    ...Object.keys(globalDisplayNames || {}),
                    ...Object.keys(globalAvatars || {}),
                    ...Object.keys(allPokedexProfiles || {}),
                    ...Object.keys(leaderboardScores || {}),
                  ])
                ).filter(Boolean);

                const userList = userNicks.map((nick) => ({
                  nick,
                  displayName: globalDisplayNames[nick] || nick,
                  avatar: globalAvatars[nick],
                  score: leaderboardScores[nick] || 0,
                  unlockedCount: Object.keys((allPokedexProfiles && allPokedexProfiles[nick]) || {}).length,
                }));

                const totalUsers = userList.length;
                const totalUnlocks = userList.reduce((acc, u) => acc + u.unlockedCount, 0);
                const avgScore = totalUsers > 0 ? Math.round(userList.reduce((acc, u) => acc + u.score, 0) / totalUsers) : 0;
                const topUser = [...userList].sort((a, b) => b.score - a.score)[0];

                let filtered = userList.filter((u) => {
                  const matchSearch =
                    !userSearchTerm ||
                    u.nick.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    u.displayName.toLowerCase().includes(userSearchTerm.toLowerCase());

                  if (!matchSearch) return false;

                  if (userFilterTab === 'top') return u.score >= 200;
                  if (userFilterTab === 'novice') return u.score < 50;
                  if (userFilterTab === 'rich') return u.unlockedCount >= 10;
                  return true;
                });

                filtered.sort((a, b) => {
                  if (userSortOption === 'score_desc') return b.score - a.score;
                  if (userSortOption === 'score_asc') return a.score - b.score;
                  if (userSortOption === 'unlocked_desc') return b.unlockedCount - a.unlockedCount;
                  if (userSortOption === 'name_asc') return a.displayName.localeCompare(b.displayName);
                  return 0;
                });

                const visibleUsers = filtered.slice(0, userPageLimit);

                const getUserRankTitleText = (score: number) => {
                  if (score < 50) return "🍺 Novizio del Pub";
                  if (score < 200) return "🍺 Apprendista Bevitore";
                  if (score < 500) return "🍺 Esploratore di Luppoli";
                  if (score < 1200) return "🍺 Sommelier del Bancone";
                  return "👑 Mastro Birraio";
                };

                const handleRecalculateSingle = async (nick: string) => {
                  if (!onRecalculateUserScore) return;
                  setRecalculatingUserMap((prev) => ({ ...prev, [nick]: true }));
                  try {
                    await onRecalculateUserScore(nick);
                    setRecalculateBannerMsg(`✅ Punteggio di @${nick} ricalcolato con successo!`);
                    setTimeout(() => setRecalculateBannerMsg(null), 3500);
                  } catch (e) {
                    console.error("Error recalculating score for user:", nick, e);
                    setRecalculateBannerMsg(`❌ Errore durante il ricalcolo per @${nick}`);
                    setTimeout(() => setRecalculateBannerMsg(null), 3500);
                  } finally {
                    setRecalculatingUserMap((prev) => ({ ...prev, [nick]: false }));
                  }
                };

                const handleRecalculateAllUsers = async () => {
                  if (!onRecalculateUserScore || visibleUsers.length === 0) return;
                  const ok = window.confirm(`Vuoi ricalcolare i punti e le medaglie per tutti i ${filtered.length} utenti?`);
                  if (!ok) return;

                  for (const u of filtered) {
                    setRecalculatingUserMap((prev) => ({ ...prev, [u.nick]: true }));
                    try {
                      await onRecalculateUserScore(u.nick);
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setRecalculatingUserMap((prev) => ({ ...prev, [u.nick]: false }));
                    }
                  }
                  setRecalculateBannerMsg(`🎉 Punteggi di tutti i ${filtered.length} utenti ricalcolati con successo!`);
                  setTimeout(() => setRecalculateBannerMsg(null), 4500);
                };

                return (
                  <>
                    {recalculateBannerMsg && (
                      <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
                        {recalculateBannerMsg}
                      </div>
                    )}

                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Utenti</div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#1E293B' }}>{totalUsers}</div>
                      </div>
                      <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '12px', padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>Sblocchi Tot</div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#92400E' }}>{totalUnlocks}</div>
                      </div>
                      <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '12px', padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#4338CA', fontWeight: 700, textTransform: 'uppercase' }}>Media Punti</div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#3730A3' }}>{avgScore}</div>
                      </div>
                      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Top Player</div>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#065F46', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {topUser ? topUser.displayName : '-'}
                        </div>
                      </div>
                    </div>

                    {/* Search & Sort Row */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="text"
                          placeholder="Cerca utente per nickname o nome..."
                          value={userSearchTerm}
                          onChange={(e) => {
                            setUserSearchTerm(e.target.value);
                            setUserPageLimit(15);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 34px',
                            borderRadius: '12px',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                            background: '#FFFFFF',
                          }}
                        />
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '18px' }}>
                          search
                        </span>
                        {userSearchTerm && (
                          <button
                            onClick={() => setUserSearchTerm('')}
                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', fontSize: '14px' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <select
                        value={userSortOption}
                        onChange={(e) => {
                          setUserSortOption(e.target.value as any);
                          setUserPageLimit(15);
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '12px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#334155',
                          background: '#F8FAFC',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="score_desc">Punteggio ↓</option>
                        <option value="score_asc">Punteggio ↑</option>
                        <option value="unlocked_desc">Sblocchi ↓</option>
                        <option value="name_asc">Nome (A-Z)</option>
                      </select>

                      {onRecalculateUserScore && (
                        <button
                          onClick={handleRecalculateAllUsers}
                          title="Ricalcola i punti e le medaglie per tutti gli utenti"
                          style={{
                            padding: '8px 12px',
                            borderRadius: '12px',
                            border: '1px solid #BFDBFE',
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>sync</span>
                          Ricalcola Tutti
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                      {[
                        { id: 'all', label: `Tutti (${totalUsers})` },
                        { id: 'top', label: '🏆 Top (>200pt)' },
                        { id: 'novice', label: '🌱 Novizi (<50pt)' },
                        { id: 'rich', label: '🍺 >10 Birre' },
                      ].map((pill) => (
                        <button
                          key={pill.id}
                          onClick={() => {
                            setUserFilterTab(pill.id as any);
                            setUserPageLimit(15);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: userFilterTab === pill.id ? '1px solid #6366F1' : '1px solid #E2E8F0',
                            background: userFilterTab === pill.id ? '#EEF2FF' : '#FFFFFF',
                            color: userFilterTab === pill.id ? '#4338CA' : '#64748B',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    {/* Users List */}
                    {filtered.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94A3B8', fontSize: '13px', background: '#F8FAFC', borderRadius: '14px', border: '1px dashed #CBD5E1' }}>
                        Nessun utente corrisponde ai filtri selezionati.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {visibleUsers.map((user) => {
                          const isRecalculating = recalculatingUserMap[user.nick];
                          const rankTitle = getUserRankTitleText(user.score);
                          return (
                            <div
                              key={user.nick}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '14px',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#F1F5F9', border: '1px solid #E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.nick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#94A3B8', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>person</span>
                                  )}
                                </div>
                                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user.displayName}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span>@{user.nick}</span>
                                    <span style={{ fontSize: '10px', background: '#F1F5F9', padding: '1px 5px', borderRadius: '6px', color: '#475569', fontWeight: 600 }}>
                                      {rankTitle}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 800, marginTop: '2px' }}>
                                    {user.score} PT • {user.unlockedCount} birre sbloccate
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                {onOpenPublicProfile && (
                                  <button
                                    onClick={() => {
                                      onOpenPublicProfile(user.nick);
                                    }}
                                    title="Visualizza Profilo"
                                    style={{
                                      border: '1px solid #CBD5E1',
                                      background: '#F8FAFC',
                                      borderRadius: '8px',
                                      padding: '6px 8px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: '#334155',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                                    <span className="admin-btn-label">Profilo</span>
                                  </button>
                                )}

                                {onRecalculateUserScore && (
                                  <button
                                    onClick={() => handleRecalculateSingle(user.nick)}
                                    disabled={isRecalculating}
                                    title="Ricalcola Punti e Medaglie per questo utente"
                                    style={{
                                      border: '1px solid #BFDBFE',
                                      background: isRecalculating ? '#EFF6FF' : '#DBEAFE',
                                      borderRadius: '8px',
                                      padding: '6px 8px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: '#1D4ED8',
                                      cursor: isRecalculating ? 'wait' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      opacity: isRecalculating ? 0.7 : 1,
                                    }}
                                  >
                                    <span className={`material-symbols-outlined ${isRecalculating ? 'spin' : ''}`} style={{ fontSize: '14px' }}>
                                      sync
                                    </span>
                                    <span className="admin-btn-label">{isRecalculating ? '...' : 'Ricalcola'}</span>
                                  </button>
                                )}

                                {onDeleteUserProfile && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`⚠️ ATTENZIONE ADMIN:\n\nSei sicuro di voler eliminare DEFINITIVAMENTE il profilo dell'utente @${user.nick} dal database?\n\nVerranno rimossi in modo permanente tutti i suoi sblocchi, punteggi e dati associati.`)) {
                                        onDeleteUserProfile(user.nick);
                                      }
                                    }}
                                    title="Elimina Profilo Utente"
                                    style={{
                                      border: '1px solid #FCA5A5',
                                      background: '#FEF2F2',
                                      borderRadius: '8px',
                                      padding: '6px 8px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: '#DC2626',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete_forever</span>
                                    <span className="admin-btn-label">Elimina</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {visibleUsers.length < filtered.length && (
                          <div style={{ textAlign: 'center', marginTop: '6px' }}>
                            <button
                              onClick={() => setUserPageLimit((prev) => prev + 15)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '12px',
                                border: '1px solid #CBD5E1',
                                background: '#F1F5F9',
                                color: '#334155',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                            >
                              Mostra altri {Math.min(15, filtered.length - visibleUsers.length)} utenti ({visibleUsers.length}/{filtered.length})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : activeTab === 'feedback' ? (
            feedbacksList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '10px', color: '#10B981' }}>rate_review</span>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Nessun consiglio o segnalazione al momento</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>I consigli e i feedback inviati dagli utenti appariranno qui.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {feedbacksList.map((fb: any) => {
                  const fbUser = fb.user || 'Anonimo';
                  const fbDisp = globalDisplayNames[fbUser] || fbUser;
                  const fbAvat = globalAvatars[fbUser];
                  const dateStr = new Date(fb.timestamp || Date.now()).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isRead = fb.status === 'read';

                  return (
                    <div
                      key={fb.feedbackId || fb.timestamp}
                      style={{
                        background: isRead ? '#F8FAFC' : '#ECFDF5',
                        border: isRead ? '1px solid #E2E8F0' : '1px solid #A7F3D0',
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
                            {fbAvat ? (
                              <img src={fbAvat} alt={fbUser} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text-muted)' }}>person</span>
                            )}
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--dark)' }}>{fbDisp}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{fbUser} • {dateStr}</div>
                          </div>
                        </div>

                        {!isRead ? (
                          <span style={{ background: '#10B981', color: 'white', fontSize: '10px', fontWeight: 900, padding: '3px 8px', borderRadius: '12px' }}>
                            NUOVO
                          </span>
                        ) : (
                          <span style={{ background: '#E2E8F0', color: '#64748B', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>
                            Letto
                          </span>
                        )}
                      </div>

                      <div style={{ background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#1E293B', lineHeight: 1.5, textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                        {fb.message}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!isRead && onMarkFeedbackRead && (
                          <button
                            onClick={() => onMarkFeedbackRead(fb.feedbackId)}
                            style={{
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              color: '#334155',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>done</span>
                            Segna come letto
                          </button>
                        )}
                        {onDeleteFeedback && (
                          <button
                            onClick={() => onDeleteFeedback(fb.feedbackId)}
                            style={{
                              background: '#FEF2F2',
                              border: '1px solid #FECACA',
                              color: '#EF4444',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                            Elimina
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === 'flagged' ? (
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
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => toggleEdit(item)}
                          style={{
                            background: isEditing ? 'var(--primary)' : '#F1F5F9',
                            color: isEditing ? '#FFFFFF' : '#475569',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                          {isEditing ? 'Chiudi Modifica' : 'Modifica Dati'}
                        </button>
                      </div>
                    </div>

                    {/* Proposal Body */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.brand}
                          style={{ width: '85px', height: '85px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--gray)' }}
                        />
                      ) : (
                        <div style={{ width: '85px', height: '85px', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--text-muted)' }}>sports_bar</span>
                        </div>
                      )}

                      {!isEditing ? (
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', color: 'var(--dark)', fontWeight: 800 }}>
                            {formatBeerTitle(item.brand)}
                          </h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                            {formatBeerTitle(item.variant)}
                          </p>
                          <div style={{ display: 'flex', gap: '6px', margin: '6px 0', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                              Rarità: {item.rarity || 'comune'}
                            </span>
                            <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                              {item.country || 'Italia'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="text"
                            value={currentData.brand}
                            onChange={(e) => updateField(item.proposalId, 'brand', e.target.value)}
                            placeholder="Marca Birra"
                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--gray)', fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <input
                            type="text"
                            value={currentData.variant}
                            onChange={(e) => updateField(item.proposalId, 'variant', e.target.value)}
                            placeholder="Variante (es. Classica)"
                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--gray)', fontSize: '12px' }}
                          />
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <select
                              value={currentData.rarity}
                              onChange={(e) => updateField(item.proposalId, 'rarity', e.target.value)}
                              style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid var(--gray)', fontSize: '11px' }}
                            >
                              <option value="comune">Comune (1pt)</option>
                              <option value="media">Media (2pt)</option>
                              <option value="rara">Rara (5pt)</option>
                            </select>
                            <input
                              type="text"
                              value={currentData.country}
                              onChange={(e) => updateField(item.proposalId, 'country', e.target.value)}
                              placeholder="Paese"
                              style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid var(--gray)', fontSize: '11px' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
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
                        Accetta (+{item.isVariantProposal ? '1' : '2'}pt a @{item.proposedBy})
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

          {activeTab === 'move_variant' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>move_down</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--dark)' }}>
                    Sposta Variante / Marca 🔄
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    Sposta una bevuta o foto caricata da una scheda/variante errata o duplicata alla variante canonica desiderata.
                  </p>
                </div>
              </div>

              {moveMessage && (
                <div style={{
                  background: moveMessage.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                  border: `1px solid ${moveMessage.type === 'success' ? '#6EE7B7' : '#EF4444'}`,
                  color: moveMessage.type === 'success' ? '#065F46' : '#B91C1C',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: 800,
                  textAlign: 'center'
                }}>
                  {moveMessage.text}
                </div>
              )}

              <form onSubmit={handleMoveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
                    Utente Proprietario *
                  </label>
                  <input
                    type="text"
                    placeholder="Username (es. forne02)"
                    value={moveUser}
                    onChange={(e) => setMoveUser(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px 14px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
                    Chiave / Nome Birra Attuale da Spostare *
                  </label>
                  <input
                    type="text"
                    placeholder="es. Abbaye De Forest-Brune o Baia Deforest"
                    value={moveOldKey}
                    onChange={(e) => setMoveOldKey(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px 14px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
                    Marca di Destinazione *
                  </label>
                  <select
                    value={moveSelectedBrand}
                    onChange={(e) => handleMoveBrandChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      background: 'white',
                      boxSizing: 'border-box',
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {(allBeersCatalog || []).map((b) => (
                      <option key={b.brand} value={b.brand}>
                        {b.brand} ({b.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
                      Variante Destinazione *
                    </label>
                    <select
                      value={moveSelectedVariant}
                      onChange={(e) => {
                        setMoveSelectedVariant(e.target.value);
                        setMoveCustomVariant('');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid #CBD5E1',
                        background: 'white',
                        boxSizing: 'border-box',
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 600,
                      }}
                    >
                      {((allBeersCatalog.find((b) => b && b.brand === moveSelectedBrand)?.variants) || ['Classica']).map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
                      Oppure Nuova Variante
                    </label>
                    <input
                      type="text"
                      placeholder="es. Brune"
                      value={moveCustomVariant}
                      onChange={(e) => setMoveCustomVariant(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px 14px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-main"
                  disabled={isMoveSubmitting}
                  style={{ width: '100%', margin: '8px 0 0 0', padding: '14px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', fontSize: '15px' }}
                >
                  <span className="material-symbols-outlined">sync_alt</span>
                  {isMoveSubmitting ? 'Spostamento in corso...' : 'Conferma Spostamento'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
