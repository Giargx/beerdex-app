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
    isVariantProposal: boolean;
    bonusPoints: number;
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
          isVariantProposal: item.isVariantProposal ?? false,
          bonusPoints: item.bonusPoints ?? (item.isVariantProposal ? 1 : 2),
        },
      }));
    }
    setShowEditMap((prev) => ({
      ...prev,
      [item.proposalId]: !isCurrentlyEditing,
    }));
  };

  const updateField = (proposalId: string, field: string, value: any) => {
    setEditedDataMap((prev) => {
      const item = proposals.find((p) => p.proposalId === proposalId);
      const existing = prev[proposalId] || {
        brand: formatBeerTitle(item?.brand || ''),
        variant: formatBeerTitle(item?.variant || ''),
        beerType: item?.beerType || 'bionda',
        country: item?.country || 'Non specificata',
        regione: item?.regione || 'Tutte',
        rarity: item?.rarity || 'comune',
        desc: item?.desc || '',
        isVariantProposal: item?.isVariantProposal ?? false,
        bonusPoints: item?.bonusPoints ?? (item?.isVariantProposal ? 1 : 2),
      };
      const updated = {
        ...existing,
        [field]: value,
      };
      if (field === 'isVariantProposal') {
        updated.bonusPoints = value ? 1 : 2;
      }
      return {
        ...prev,
        [proposalId]: updated,
      };
    });
  };

  const getCurrentData = (item: BeerProposalItem) => {
    const edit = editedDataMap[item.proposalId];
    return {
      brand: edit?.brand !== undefined ? edit.brand : formatBeerTitle(item.brand),
      variant: edit?.variant !== undefined ? edit.variant : formatBeerTitle(item.variant),
      beerType: edit?.beerType !== undefined ? edit.beerType : (item.beerType || 'bionda'),
      country: edit?.country !== undefined ? edit.country : (item.country || 'Non specificata'),
      regione: edit?.regione !== undefined ? edit.regione : (item.regione || 'Tutte'),
      rarity: edit?.rarity !== undefined ? edit.rarity : (item.rarity || 'comune'),
      desc: edit?.desc !== undefined ? edit.desc : (item.desc || ''),
      isVariantProposal: edit?.isVariantProposal !== undefined ? edit.isVariantProposal : (item.isVariantProposal ?? false),
      bonusPoints: edit?.bonusPoints !== undefined ? edit.bonusPoints : (item.bonusPoints ?? (item.isVariantProposal ? 1 : 2)),
    };
  };

  const handleAcceptClick = (item: BeerProposalItem) => {
    const current = getCurrentData(item);

    const formattedBrand = formatBeerTitle(current.brand.trim());
    const formattedVariant = formatBeerTitle(current.variant.trim());
    const formattedCountry = formatBeerTitle((current.country || 'Non specificata').trim());

    const finalProposal: BeerProposalItem = {
      ...item,
      brand: formattedBrand,
      variant: formattedVariant,
      beerType: (current.beerType as any) || 'bionda',
      country: formattedCountry,
      regione: formattedCountry.toLowerCase() === 'italia' && current.regione && current.regione !== 'Tutte' ? current.regione : undefined,
      rarity: (current.rarity as any) || 'comune',
      desc: current.desc && current.desc.trim() ? current.desc.trim() : `Birra ${formattedBrand} (${formattedVariant})`,
      isVariantProposal: current.isVariantProposal,
      bonusPoints: current.bonusPoints,
    };

    onAcceptProposal(finalProposal);
  };

  return (
    <div
      className="page-container-view"
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        paddingBottom: 'env(safe-area-inset-bottom, 40px)',
      }}
    >
      <header
        style={{
          position: 'relative',
          minHeight: '130px',
          padding: '24px 20px 20px 20px',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #1E293B 100%)',
          borderRadius: '0 0 28px 28px',
          color: '#FFFFFF',
          overflow: 'hidden',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <FoamBubbles />
        <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              padding: '8px 14px',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            Indietro
          </button>

          <div style={{
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#FBBF24',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.5px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>shield</span>
            PANNELLO ADMIN
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, marginTop: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Pannello Amministratore <span style={{ fontSize: '22px' }}>⚙️</span>
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94A3B8', opacity: 0.95 }}>
            Centro di controllo utenti, catalogo birre, moderazione post e consigli community.
          </p>
        </div>
      </header>

      <div
        style={{
          maxWidth: '740px',
          width: '95%',
          margin: '0 auto',
          padding: '16px 0 30px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '6px',
            borderRadius: '20px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            position: 'sticky',
            top: '10px',
            zIndex: 100,
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
          }}
        >
          {[
            { id: 'users', label: 'Utenti', icon: 'manage_accounts', badge: 0, activeGradient: 'linear-gradient(135deg, #4F46E5, #3730A3)', activeColor: '#6366F1' },
            { id: 'proposals', label: 'Proposte', icon: 'sports_bar', badge: pendingProposals.length, activeGradient: 'linear-gradient(135deg, #D97706, #B45309)', activeColor: '#F59E0B' },
            { id: 'flagged', label: 'Segnalazioni', icon: 'report_problem', badge: flaggedList.length, activeGradient: 'linear-gradient(135deg, #E11D48, #BE123C)', activeColor: '#F43F5E' },
            { id: 'feedback', label: 'Consigli', icon: 'rate_review', badge: unreadFeedbackCount, activeGradient: 'linear-gradient(135deg, #059669, #047857)', activeColor: '#10B981' },
            { id: 'move_variant', label: 'Sposta', icon: 'move_down', badge: 0, activeGradient: 'linear-gradient(135deg, #7C3AED, #6D28D9)', activeColor: '#8B5CF6' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  minWidth: '68px',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '10px 6px',
                  borderRadius: '14px',
                  border: 'none',
                  background: isActive ? tab.activeGradient : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontWeight: isActive ? 800 : 700,
                  fontSize: '11px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? '#FFFFFF' : tab.activeColor }}>
                    {tab.icon}
                  </span>
                  <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
                </div>
                {tab.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      right: '4px',
                      background: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 900,
                      borderRadius: '10px',
                      padding: '1px 6px',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
          }}
        >
          {activeTab === 'users' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  if (score < 50) return "🍺 Novizio";
                  if (score < 200) return "🍺 Apprendista";
                  if (score < 500) return "🍺 Esploratore";
                  if (score < 1200) return "🍺 Sommelier";
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
                      <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px 16px', borderRadius: '14px', fontSize: '13px', fontWeight: 800, textAlign: 'center' }}>
                        {recalculateBannerMsg}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      <div style={{ background: 'linear-gradient(135deg, #F8FAFC, #EFF6FF)', border: '1px solid #DBEAFE', borderRadius: '16px', padding: '12px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '10px', color: '#3B82F6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>👥 Utenti</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#1E3A8A', marginTop: '2px' }}>{totalUsers}</div>
                      </div>
                      <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)', border: '1px solid #FDE68A', borderRadius: '16px', padding: '12px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '10px', color: '#D97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🍺 Sblocchi</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#78350F', marginTop: '2px' }}>{totalUnlocks}</div>
                      </div>
                      <div style={{ background: 'linear-gradient(135deg, #F3E8FF, #FAF5FF)', border: '1px solid #E9D5FF', borderRadius: '16px', padding: '12px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '10px', color: '#9333EA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Media PT</div>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#581C87', marginTop: '2px' }}>{avgScore}</div>
                      </div>
                      <div style={{ background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)', border: '1px solid #A7F3D0', borderRadius: '16px', padding: '12px 10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>👑 Top Player</div>
                        <div style={{ fontSize: '13px', fontWeight: 900, color: '#064E3B', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {topUser ? topUser.displayName : '-'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                        <input
                          type="text"
                          placeholder="Cerca per nickname o nome..."
                          value={userSearchTerm}
                          onChange={(e) => {
                            setUserSearchTerm(e.target.value);
                            setUserPageLimit(15);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            borderRadius: '14px',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                            background: '#FFFFFF',
                            outline: 'none',
                          }}
                        />
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '18px' }}>
                          search
                        </span>
                      </div>

                      <select
                        value={userSortOption}
                        onChange={(e) => {
                          setUserSortOption(e.target.value as any);
                          setUserPageLimit(15);
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '14px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#334155',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          outline: 'none',
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
                            padding: '10px 14px',
                            borderRadius: '14px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>sync</span>
                          Ricalcola Tutti
                        </button>
                      )}
                    </div>

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
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: userFilterTab === pill.id ? '1px solid #6366F1' : '1px solid #E2E8F0',
                            background: userFilterTab === pill.id ? 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' : '#FFFFFF',
                            color: userFilterTab === pill.id ? '#4338CA' : '#64748B',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    {filtered.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94A3B8', fontSize: '13px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                        Nessun utente corrisponde ai filtri selezionati.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {visibleUsers.map((user) => {
                          const isRecalculating = recalculatingUserMap[user.nick];
                          const rankTitle = getUserRankTitleText(user.score);
                          return (
                            <div
                              key={user.nick}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '16px',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid #E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.nick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#94A3B8', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>person</span>
                                  )}
                                </div>
                                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user.displayName}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '1px' }}>
                                    <span>@{user.nick}</span>
                                    <span style={{ fontSize: '10px', background: '#F1F5F9', padding: '1px 6px', borderRadius: '8px', color: '#475569', fontWeight: 700 }}>
                                      {rankTitle}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 800, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#F59E0B' }}>star</span>
                                    {user.score} PT • {user.unlockedCount} sblocchi
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {onOpenPublicProfile && (
                                  <button
                                    onClick={() => onOpenPublicProfile(user.nick)}
                                    title="Visualizza Profilo"
                                    style={{
                                      border: '1px solid #CBD5E1',
                                      background: '#F8FAFC',
                                      borderRadius: '10px',
                                      padding: '7px 10px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: '#334155',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>visibility</span>
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
                                      borderRadius: '10px',
                                      padding: '7px 10px',
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
                                    <span className={`material-symbols-outlined ${isRecalculating ? 'spin' : ''}`} style={{ fontSize: '15px' }}>
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
                                      borderRadius: '10px',
                                      padding: '7px 10px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: '#DC2626',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete_forever</span>
                                    <span className="admin-btn-label">Elimina</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {visibleUsers.length < filtered.length && (
                          <div style={{ textAlign: 'center', marginTop: '8px' }}>
                            <button
                              onClick={() => setUserPageLimit((prev) => prev + 15)}
                              style={{
                                padding: '10px 20px',
                                borderRadius: '14px',
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
                        borderRadius: '18px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
>
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    {filtered.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94A3B8', fontSize: '13px', background: '#F8FAFC', borderRadius: '16px', border: '1px dashed #CBD5E1' }}>
                        Nessun utente corrisponde ai filtri selezionati.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {visibleUsers.map((user) => {
                          const isRecalculating = recalculatingUserMap[user.nick];
                          const rankTitle = getUserRankTitleText(user.score);
                          return (
                            <div
                              key={user.nick}
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '16px',
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F1F5F9', border: '2px solid #E2E8F0', overflow: 'hidden', flexShrink: 0 }}>
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.nick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#94A3B8', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>person</span>
                                  )}
                                </div>
                                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user.displayName}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '1px' }}>
                                    <span>@{user.nick}</span>
                                    <span style={{ fontSize: '10px', background: '#F1F5F9', padding: '1px 6px', borderRadius: '8px', color: '#475569', fontWeight: 700 }}>
                                      {rankTitle}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 800, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#F59E0B' }}>star</span>
                                    {user.score} PT • {user.unlockedCount} sblocchi
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {onOpenPublicProfile && (
                                  <button
                                    onClick={() => onOpenPublicProfile(user.nick)}
                                    title="Visualizza Profilo"
                                    style={{
                                      border: '1px solid #CBD5E1',
                                      background: '#F8FAFC',
                                      borderRadius: '10px',
                                      padding: '7px 10px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: '#334155',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>visibility</span>
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
                                      borderRadius: '10px',
                                      padding: '7px 10px',
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
                                    <span className={`material-symbols-outlined ${isRecalculating ? 'spin' : ''}`} style={{ fontSize: '15px' }}>
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
                                      borderRadius: '10px',
                                      padding: '7px 10px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: '#DC2626',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete_forever</span>
                                    <span className="admin-btn-label">Elimina</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {visibleUsers.length < filtered.length && (
                          <div style={{ textAlign: 'center', marginTop: '8px' }}>
                            <button
                              onClick={() => setUserPageLimit((prev) => prev + 15)}
                              style={{
                                padding: '10px 20px',
                                borderRadius: '14px',
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
                        borderRadius: '18px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e6ed', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            {fbAvat ? (
                              <img src={fbAvat} alt={fbUser} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text-muted)' }}>person</span>
                            )}
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--dark)' }}>{fbDisp}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{fbUser} • {dateStr}</div>
                          </div>
                        </div>

                        {!isRead ? (
                          <span style={{ background: '#10B981', color: 'white', fontSize: '10px', fontWeight: 900, padding: '4px 10px', borderRadius: '14px', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)' }}>
                            NUOVO
                          </span>
                        ) : (
                          <span style={{ background: '#E2E8F0', color: '#64748B', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '14px' }}>
                            Letto
                          </span>
                        )}
                      </div>

                      <div style={{ background: 'white', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#1E293B', lineHeight: 1.5, textAlign: 'left', whiteSpace: 'pre-wrap' }}>
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
                              padding: '7px 14px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 800,
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
                              padding: '7px 14px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 800,
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                        borderRadius: '18px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e6ed', overflow: 'hidden' }}>
                            {userAvat ? (
                              <img src={userAvat} alt={item.postUser} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text-muted)' }}>person</span>
                            )}
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--dark)' }}>{userDisp}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{item.postUser}</div>
                          </div>
                        </div>
                        <span style={{ background: '#DC2626', color: 'white', fontSize: '11px', fontWeight: 900, padding: '4px 12px', borderRadius: '20px', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)' }}>
                          ⚠️ {item.reportCount || 4} Segnalazioni
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: 'white', padding: '12px', borderRadius: '14px', border: '1px solid #FECACA' }}>
                        {(pData.photo || pData.photoUrl) ? (
                          <img
                            src={pData.photo || pData.photoUrl}
                            alt={item.brand}
                            style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--gray)' }}
                          />
                        ) : (
                          <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', fontSize: '32px' }}>sports_bar</span>
                          </div>
                        )}
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', color: 'var(--dark)', fontWeight: 800 }}>{item.brand}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>{item.variant}</p>
                          {pData.notes && (
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#4B5563', fontStyle: 'italic' }}>"{pData.notes}"</p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button
                          onClick={() => onRemoveFlaggedPost && onRemoveFlaggedPost(item.postId, item.postUser, item.brand, item.variant)}
                          style={{
                            flex: 1,
                            background: '#DC2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px',
                            fontWeight: 800,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 3px 10px rgba(220, 38, 38, 0.25)',
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
                            borderRadius: '12px',
                            padding: '10px',
                            fontWeight: 800,
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
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
          ) : activeTab === 'proposals' ? (
            pendingProposals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '10px', color: '#10B981' }}>check_circle</span>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Nessuna proposta pendente al momento.</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Le nuove birre e varianti proposte dagli utenti appariranno qui per l'approvazione.</p>
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
                  const currentData = getCurrentData(item);

                  return (
                    <div
                      key={item.proposalId}
                      style={{
                        background: 'var(--white)',
                        border: isEditing ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                        borderRadius: '18px',
                        padding: '18px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', border: '1px solid #CBD5E1' }}>
                            {authorAvatar ? (
                              <img src={authorAvatar} alt={item.proposedBy} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '22px', margin: '7px' }}>person</span>
                            )}
                          </div>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--dark)' }}>@{authorName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Proposta il {dateStr}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            onClick={() => toggleEdit(item)}
                            style={{
                              background: isEditing ? '#FEF3C7' : '#F1F5F9',
                              color: isEditing ? '#D97706' : '#475569',
                              border: '1px solid ' + (isEditing ? '#FDE68A' : '#CBD5E1'),
                              borderRadius: '10px',
                              padding: '6px 12px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                            {isEditing ? 'Chiudi' : 'Modifica'}
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.brand}
                            style={{ width: '90px', height: '90px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                          />
                        ) : (
                          <div style={{ width: '90px', height: '90px', borderRadius: '14px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--text-muted)' }}>sports_bar</span>
                          </div>
                        )}

                        {!isEditing ? (
                          <div style={{ textAlign: 'left', flex: 1 }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: currentData.isVariantProposal ? '#E0F2FE' : '#FEF3C7',
                                color: currentData.isVariantProposal ? '#0369A1' : '#B45309',
                                border: currentData.isVariantProposal ? '1px solid #BAE6FD' : '1px solid #FDE68A',
                              }}>
                                {currentData.isVariantProposal ? '💡 Nuova Variante (+1 Pt)' : '✨ Nuova Marca (+2 Pt)'}
                              </span>
                              {currentData.beerType && (
                                <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '10px', textTransform: 'capitalize', fontWeight: 700, border: '1px solid #E2E8F0' }}>
                                  {currentData.beerType === 'rossa' ? '🔴 Rossa' : currentData.beerType === 'scura' ? '🌑 Scura' : currentData.beerType === 'bianca' ? '⚪ Bianca' : currentData.beerType === 'ipa' ? '🌿 IPA' : '🍺 Bionda'}
                                </span>
                              )}
                            </div>
                            <h4 style={{ margin: '0 0 2px 0', fontSize: '17px', color: 'var(--dark)', fontWeight: 900 }}>
                              {formatBeerTitle(currentData.brand)}
                            </h4>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--primary-dark)', fontWeight: 800 }}>
                              {formatBeerTitle(currentData.variant)}
                            </p>
                            <div style={{ display: 'flex', gap: '6px', margin: '8px 0 0 0', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#D97706', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                                Rarità: {currentData.rarity || 'comune'}
                              </span>
                              <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#475569', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                                {currentData.country || 'Italia'} {currentData.country?.trim().toLowerCase() === 'italia' && currentData.regione && currentData.regione !== 'Tutte' ? `(${currentData.regione})` : ''}
                              </span>
                            </div>
                            {currentData.desc && (
                              <div style={{ fontSize: '12px', color: 'var(--dark)', marginTop: '6px', fontStyle: 'italic', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px' }}>
                                "{currentData.desc}"
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px', textAlign: 'left' }}>Tipo Proposta</label>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => updateField(item.proposalId, 'isVariantProposal', false)}
                                  style={{
                                    padding: '6px',
                                    borderRadius: '8px',
                                    border: !currentData.isVariantProposal ? '2px solid #F59E0B' : '1px solid #CBD5E1',
                                    background: !currentData.isVariantProposal ? '#FEF3C7' : '#FFFFFF',
                                    color: !currentData.isVariantProposal ? '#B45309' : '#64748B',
                                    fontWeight: 800,
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  ✨ Nuova Marca (+2 pt)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateField(item.proposalId, 'isVariantProposal', true)}
                                  style={{
                                    padding: '6px',
                                    borderRadius: '8px',
                                    border: currentData.isVariantProposal ? '2px solid #0284C7' : '1px solid #CBD5E1',
                                    background: currentData.isVariantProposal ? '#E0F2FE' : '#FFFFFF',
                                    color: currentData.isVariantProposal ? '#0369A1' : '#64748B',
                                    fontWeight: 800,
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  💡 Nuova Variante (+1 pt)
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px', textAlign: 'left' }}>Marca Birra</label>
                                <input
                                  type="text"
                                  value={currentData.brand}
                                  onChange={(e) => updateField(item.proposalId, 'brand', e.target.value)}
                                  placeholder="Marca Birra"
                                  style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: 800, outline: 'none', margin: 0 }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px', textAlign: 'left' }}>Nome Variante</label>
                                <input
                                  type="text"
                                  value={currentData.variant}
                                  onChange={(e) => updateField(item.proposalId, 'variant', e.target.value)}
                                  placeholder="Variante (es. Classica)"
                                  style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', margin: 0 }}
                                />
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px', textAlign: 'left' }}>Tipologia / Stile</label>
                                <select
                                  value={currentData.beerType || 'bionda'}
                                  onChange={(e) => updateField(item.proposalId, 'beerType', e.target.value)}
                                  style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: 700, margin: 0 }}
                                >
                                  <option value="bionda">🍺 Bionda</option>
                                  <option value="rossa">🔴 Rossa</option>
                                  <option value="scura">🌑 Scura</option>
                                  <option value="bianca">⚪ Bianca</option>
                                  <option value="ipa">🌿 IPA</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px', textAlign: 'left' }}>Rarità</label>
                                <select
                                  value={currentData.rarity}
                                  onChange={(e) => updateField(item.proposalId, 'rarity', e.target.value)}
                                  style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: 700, margin: 0 }}
                                >
                                  <option value="comune">🟢 Comune (1pt)</option>
                                  <option value="media">🔵 Media (2pt)</option>
                                  <option value="rara">👑 Rara (5pt)</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '2px', textAlign: 'left' }}>Paese / Nazione</label>
                              <input
                                type="text"
                                value={currentData.country}
                                onChange={(e) => updateField(item.proposalId, 'country', e.target.value)}
                                placeholder="es. Italia, Belgio..."
                                style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', margin: 0 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button
                          className="btn-main"
                          onClick={() => handleAcceptClick(item)}
                          style={{
                            flex: 1,
                            margin: 0,
                            padding: '12px',
                            fontSize: '13px',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                          Accetta (+{currentData.isVariantProposal ? (currentData.bonusPoints || 1) : (currentData.bonusPoints || 2)}pt a @{item.proposedBy})
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => onRejectProposal(item.proposalId)}
                          style={{
                            flex: 1,
                            margin: 0,
                            padding: '12px',
                            fontSize: '13px',
                            color: '#EF4444',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
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
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', boxShadow: '0 2px 10px rgba(139, 92, 246, 0.15)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>move_down</span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: 'var(--dark)' }}>
                    Sposta Variante / Marca 🔄
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Re-indirizza una bevuta caricata su una variante errata alla scheda canonica corretta.
                  </p>
                </div>
              </div>

              {moveMessage && (
                <div style={{
                  background: moveMessage.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                  border: `1px solid ${moveMessage.type === 'success' ? '#6EE7B7' : '#EF4444'}`,
                  color: moveMessage.type === 'success' ? '#065F46' : '#B91C1C',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  textAlign: 'center'
                }}>
                  {moveMessage.text}
                </div>
              )}

              <form onSubmit={handleMoveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
                    1. Utente Proprietario della Bevuta *
                  </label>
                  <input
                    type="text"
                    placeholder="Username (es. forne02)"
                    value={moveUser}
                    onChange={(e) => setMoveUser(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px 14px', borderRadius: '14px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
                    2. Chiave / Nome Birra Attuale da Spostare *
                  </label>
                  <input
                    type="text"
                    placeholder="es. Abbaye De Forest-Brune o Baia Deforest"
                    value={moveOldKey}
                    onChange={(e) => setMoveOldKey(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px 14px', borderRadius: '14px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
                    3. Marca di Destinazione *
                  </label>
                  <select
                    value={moveSelectedBrand}
                    onChange={(e) => handleMoveBrandChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      border: '1px solid #CBD5E1',
                      background: 'white',
                      boxSizing: 'border-box',
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  >
                    {(allBeersCatalog || []).map((b) => (
                      <option key={b.brand} value={b.brand}>
                        {b.brand} ({b.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left' }}>
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
                        borderRadius: '14px',
                        border: '1px solid #CBD5E1',
                        background: 'white',
                        boxSizing: 'border-box',
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 700,
                        outline: 'none',
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
                      style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px 14px', borderRadius: '14px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isMoveSubmitting}
                  style={{
                    width: '100%',
                    margin: '10px 0 0 0',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '15px',
                    fontWeight: 900,
                    cursor: isMoveSubmitting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.35)',
                    transition: 'all 0.2s ease',
                  }}
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
