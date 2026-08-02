import React, { useState } from 'react';
import { TrophyGrid } from '../components/TrophyGrid';
import type { PokedexEntry } from '../components/TrophyGrid';
import { beers, getBeerType, formatBeerTitle } from '../beers';
import { StarRating } from '../components/StarRating';

interface ProfileViewProps {
  currentUserNick: string;
  currentUserDisplayName?: string;
  isAdminUser: boolean;
  myPokedex: Record<string, PokedexEntry>;
  globalAvatars: Record<string, string>;
  leaderboardScores: Record<string, number>;
  onToggleSettings: () => void;
  onDeleteVariant: (brand: string, variant: string) => void;
  getUserRankTitle: (score: number, unlockedCount?: number) => string;
  getAvatarZoomProps?: (url: string | undefined) => any;
  posts: any[];
  onOpenPostDetail: (username: string, postId: string) => void;
  onOpenAdminProposals?: () => void;
  pendingProposalsCount?: number;
  onOpenAdminReports?: () => void;
  flaggedPostsCount?: number;
  onRateBeer?: (brand: string, variant: string, rating: number) => void;
  myReceivedRequests?: string[];
  onNavigateToFriends?: () => void;
  myTagRequests?: any[];
  onOpenTagRequest?: (req: any) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUserNick,
  currentUserDisplayName,
  isAdminUser,
  myPokedex = {},
  globalAvatars = {},
  leaderboardScores = {},
  onToggleSettings,
  onDeleteVariant,
  getUserRankTitle,
  getAvatarZoomProps,
  posts = [],
  onOpenPostDetail,
  onOpenAdminProposals,
  pendingProposalsCount = 0,
  onOpenAdminReports,
  flaggedPostsCount = 0,
  onRateBeer,
  myReceivedRequests = [],
  onNavigateToFriends,
  myTagRequests = [],
  onOpenTagRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'posts' | 'stats' | 'ratings'>('posts');
  const [variantSort, setVariantSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [variantSortDir, setVariantSortDir] = useState<number>(1);
  const [medalSort, setMedalSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [medalSortDir, setMedalSortDir] = useState<number>(1);

  const [medalsOpen, setMedalsOpen] = useState<boolean>(false);
  const [eventsOpen, setEventsOpen] = useState<boolean>(false);
  const [variantsOpen, setVariantsOpen] = useState<boolean>(false);

  const score = (leaderboardScores && leaderboardScores[currentUserNick]) || 0;
  const rankTitle = typeof getUserRankTitle === 'function' ? getUserRankTitle(score, Object.keys(myPokedex || {}).length) : '';
  const avatar = (globalAvatars && globalAvatars[currentUserNick]) || undefined;

  const roleText = isAdminUser ? "ADMIN" : "UTENTE";
  const roleColor = isAdminUser ? "var(--danger)" : "var(--text-muted)";

  // ----------------- CALCULATE STATS -----------------
  const pokedexEntries = Object.values(myPokedex || {}).filter((entry) => entry && typeof entry === 'object');
  const totalUnlocked = pokedexEntries.length;
  
  // Total variants in the game
  const totalVariantsInGame = (beers || []).reduce((acc, b) => acc + (Array.isArray(b?.variants) ? b.variants.length : 1), 0);
  const completionPercentage = totalVariantsInGame > 0 ? Math.round((totalUnlocked / totalVariantsInGame) * 100) : 0;
  
  // Shiny count
  const shinyCount = pokedexEntries.filter(entry => entry && entry.isShiny).length;
  
  // Tagged friends count
  const taggedFriendsCount = pokedexEntries.filter(entry => entry && entry.taggedFriend).length;

  // Rarity distribution
  const rarityCounts = { comune: 0, media: 0, rara: 0 };
  Object.keys(myPokedex || {}).forEach(key => {
    if (!myPokedex[key]) return;
    const brand = key.split('-')[0];
    const beer = (beers || []).find(b => b.brand === brand);
    if (beer) {
      const r = (beer.rarity || 'comune') as 'comune' | 'media' | 'rara';
      rarityCounts[r] = (rarityCounts[r] || 0) + 1;
    }
  });

  // Country completion
  const countryCounts: Record<string, { unlocked: number, total: number }> = {};
  (beers || []).forEach(beer => {
    const c = beer.country || 'Sconosciuta';
    if (!countryCounts[c]) {
      countryCounts[c] = { unlocked: 0, total: 0 };
    }
    countryCounts[c].total += Array.isArray(beer?.variants) ? beer.variants.length : 1;
  });
  Object.keys(myPokedex || {}).forEach(key => {
    if (!myPokedex[key]) return;
    const brand = key.split('-')[0];
    const beer = beers.find(b => b.brand === brand);
    if (beer) {
      const c = beer.country || 'Sconosciuta';
      if (countryCounts[c]) {
        countryCounts[c].unlocked += 1;
      }
    }
  });

  // Convert country counts to list, sort by percentage desc
  const countryStatsList = Object.entries(countryCounts)
    .map(([country, stats]) => ({
      country,
      percentage: stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0,
      ...stats
    }))
    .filter(stat => stat.unlocked > 0)
    .sort((a, b) => b.percentage - a.percentage);

  // ----------------- CALCULATE BEER RATING STATS -----------------
  const beerTypeMeta: Record<string, { label: string; icon: string; color: string }> = {
    ipa: { label: 'IPA & Craft', icon: 'sports_bar', color: '#F59E0B' },
    bianca: { label: 'Bianca / Weiss', icon: 'snowing', color: '#6366F1' },
    scura: { label: 'Scura / Stout', icon: 'dark_mode', color: '#475569' },
    rossa: { label: 'Rossa / Ambrata', icon: 'local_fire_department', color: '#EF4444' },
    bionda: { label: 'Bionda / Lager', icon: 'glass_cup', color: '#10B981' },
  };

  const styleStats: Record<string, { sum: number; count: number; average: number }> = {
    ipa: { sum: 0, count: 0, average: 0 },
    bianca: { sum: 0, count: 0, average: 0 },
    scura: { sum: 0, count: 0, average: 0 },
    rossa: { sum: 0, count: 0, average: 0 },
    bionda: { sum: 0, count: 0, average: 0 },
  };

  let totalRatedBeers = 0;
  let totalRatingSum = 0;

  Object.entries(myPokedex || {}).forEach(([key, entry]) => {
    if (entry && entry.rating && entry.rating > 0) {
      totalRatedBeers += 1;
      totalRatingSum += entry.rating;

      const brand = entry.brand || key.split('-')[0];
      const variant = key.split('-').slice(1).join('-');
      const beerType = getBeerType(brand, variant);

      if (styleStats[beerType]) {
        styleStats[beerType].sum += entry.rating;
        styleStats[beerType].count += 1;
      }
    }
  });

  Object.keys(styleStats).forEach((type) => {
    const s = styleStats[type];
    s.average = s.count > 0 ? parseFloat((s.sum / s.count).toFixed(1)) : 0;
  });

  const overallAverage = totalRatedBeers > 0 ? parseFloat((totalRatingSum / totalRatedBeers).toFixed(1)) : 0;

  const sortedStyles = Object.entries(styleStats)
    .filter(([_, stats]) => stats.count > 0)
    .sort((a, b) => b[1].average - a[1].average || b[1].count - a[1].count);

  const favoriteStyleKey = sortedStyles.length > 0 ? sortedStyles[0][0] : null;
  const favoriteStyleMeta = favoriteStyleKey ? beerTypeMeta[favoriteStyleKey] : null;

  return (
    <div className="page-container-view" style={{ minHeight: '100%' }}>
      <div className="profile-header-card" style={{ position: 'relative', width: '100%' }}>
        <button
          className="settings-toggle-btn"
          onClick={onToggleSettings}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid var(--gray)',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            color: 'var(--dark)',
            transition: '0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            settings
          </span>
        </button>

        {/* Pending Tag Requests Banner */}
        {Array.isArray(myTagRequests) && myTagRequests.length > 0 && (
          <div
            onClick={() => onOpenTagRequest && onOpenTagRequest(myTagRequests[0])}
            style={{
              margin: '60px 20px 0 20px',
              background: 'linear-gradient(135deg, #FF6F00, #FFB300)',
              borderRadius: '16px',
              padding: '14px 16px',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(255, 111, 0, 0.35)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>group_add</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 900, fontSize: '14px' }}>
                  Richiesta Sblocco in Compagnia ({myTagRequests.length})
                </div>
                <div style={{ fontSize: '11px', opacity: 0.95 }}>
                  @{myTagRequests[0].fromUser} ti ha taggato in una bevuta! Tocca per rispondere.
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </div>
        )}

        {/* User avatar display card */}
        <div style={{ textAlign: 'center', padding: '30px 20px 20px 20px' }}>
          <div
            style={{ display: 'inline-block', position: 'relative' }}
          >
            <div
              id="profileAvatarDisplay"
              {...(getAvatarZoomProps ? getAvatarZoomProps(avatar) : {})}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: '#e0e6ed',
                margin: '0 auto 15px auto',
                border: '4px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                color: 'var(--text-muted)',
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={currentUserNick}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                  person
                </span>
              )}
            </div>
          </div>

          <div id="settingsUserBoxContent">
            <div style={{ fontSize: '12px', letterSpacing: '1px', color: roleColor, marginBottom: '5px', fontWeight: 'bold' }}>
              {roleText}
            </div>
            <div style={{ fontSize: '26px', color: 'var(--dark)', fontWeight: 900, marginBottom: '2px' }}>
              {currentUserDisplayName ? currentUserDisplayName : currentUserNick}
            </div>
            {currentUserDisplayName && (
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '8px' }}>
                @{currentUserNick}
              </div>
            )}
            <div className="user-rank-title" style={{ marginBottom: 0, fontSize: '13px', padding: '5px 12px', display: 'inline-block' }}>
              {rankTitle}
            </div>
          </div>

          {/* Instagram-style user stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '18px', padding: '0 10px' }}>
            <div style={{ textAlign: 'center', flex: '1' }}>
              <div style={{ fontWeight: 900, fontSize: '18px', color: 'var(--dark)' }}>
                {posts.filter(p => p.user === currentUserNick).length}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Post</div>
            </div>
            <div style={{ textAlign: 'center', flex: '1', borderLeft: '1px solid var(--gray)', borderRight: '1px solid var(--gray)' }}>
              <div style={{ fontWeight: 900, fontSize: '18px', color: 'var(--dark)' }}>{score}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Punti</div>
            </div>
            <div style={{ textAlign: 'center', flex: '1' }}>
              <div style={{ fontWeight: 900, fontSize: '18px', color: 'var(--dark)' }}>{totalUnlocked}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Sblocchi</div>
            </div>
          </div>
        </div>
      </div>

      {myReceivedRequests && myReceivedRequests.length > 0 && onNavigateToFriends && (
        <div style={{ padding: '0 20px', marginTop: '12px', marginBottom: '4px' }}>
          <button
            onClick={onNavigateToFriends}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: '1px solid #FCD34D',
              color: '#92400E',
              padding: '12px 16px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  boxShadow: '0 0 6px rgba(239, 68, 68, 0.9)',
                }}
              />
              <span>Hai {myReceivedRequests.length} richiesta/e di amicizia in attesa!</span>
            </div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'underline' }}>
              Gestisci
            </span>
          </button>
        </div>
      )}

      {isAdminUser && (
        <div style={{ padding: '0 20px', marginTop: '12px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {onOpenAdminProposals && (
            <button
              onClick={onOpenAdminProposals}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '16px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>admin_panel_settings</span>
              <span>Gestisci Proposte Birre</span>
              {pendingProposalsCount > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#EF4444',
                      boxShadow: '0 0 8px rgba(239, 68, 68, 0.9)',
                    }}
                  />
                  <span style={{
                    background: 'var(--danger)',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: '900'
                  }}>
                    {pendingProposalsCount}
                  </span>
                </div>
              )}
            </button>
          )}

          {onOpenAdminReports && (
            <button
              onClick={onOpenAdminReports}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #451A03 0%, #78350F 100%)',
                color: 'white',
                border: '1px solid #B45309',
                padding: '12px 16px',
                borderRadius: '16px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(120,53,15,0.2)'
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#FBBF24' }}>report_problem</span>
              <span>Gestisci Segnalazioni Post</span>
              {flaggedPostsCount > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#EF4444',
                      boxShadow: '0 0 8px rgba(239, 68, 68, 0.9)',
                    }}
                  />
                  <span style={{
                    background: '#EF4444',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: '900'
                  }}>
                    {flaggedPostsCount}
                  </span>
                </div>
              )}
            </button>
          )}
        </div>
      )}

      {/* Main tab control buttons */}
      <div style={{
        display: 'flex',
        margin: '10px 20px 15px 20px',
        background: 'var(--gray)',
        borderRadius: '12px',
        padding: '4px',
        gap: '4px'
      }}>
        {[
          { id: 'posts', label: 'I Miei Post', icon: 'photo_library' },
          { id: 'collection', label: 'Collezione', icon: 'collections_bookmark' },
          { id: 'stats', label: 'Statistiche', icon: 'bar_chart' },
          { id: 'ratings', label: 'Gusti & Voti', icon: 'star' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--white)' : 'transparent',
              color: activeTab === tab.id ? 'var(--dark)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }} title={tab.label}>{tab.icon}</span>
          </button>
        ))}
      </div>

      {/* RENDER THE TABS */}
      
      {/* 1. COLLECTION TAB */}
      {activeTab === 'collection' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Medals sorting controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid var(--gray)',
              paddingBottom: '8px',
              margin: '30px 20px 15px 20px',
            }}
          >
            <h3
              onClick={() => setMedalsOpen(!medalsOpen)}
              style={{
                margin: 0,
                color: 'var(--dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--gold)' }}>
                workspace_premium
              </span>{' '}
              Medaglie Brand
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '20px',
                  color: 'var(--text-muted)',
                  transition: 'transform 0.2s ease',
                  transform: medalsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                expand_more
              </span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <select
                value={medalSort}
                onChange={(e) => setMedalSort(e.target.value as any)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--gray)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'var(--dark)',
                  background: '#fbfcfc',
                  outline: 'none',
                  cursor: 'pointer',
                  marginBottom: 0,
                }}
              >
                <option value="alpha">Alfabetico</option>
                <option value="nation">Nazione</option>
                <option value="rarity">Rarità</option>
                <option value="unlocked">Sbloccate</option>
              </select>
              <button
                onClick={() => setMedalSortDir((d) => d * -1)}
                style={{
                  border: '1px solid var(--gray)',
                  background: '#fbfcfc',
                  borderRadius: '8px',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {medalSortDir === -1 ? 'arrow_upward' : 'arrow_downward'}
                </span>
              </button>
            </div>
          </div>

          {medalsOpen && (
            <TrophyGrid
              pokedex={myPokedex}
              isPub={false}
              variantSortOption={variantSort}
              variantSortDir={variantSortDir}
              medalSortOption={medalSort}
              medalSortDir={medalSortDir}
              onDeleteEntry={onDeleteVariant}
              showDeleteButton={true}
              mode="medals"
            />
          )}

          {/* Event Medals Section */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid var(--gray)',
              paddingBottom: '8px',
              margin: '40px 20px 15px 20px',
            }}
          >
            <h3
              onClick={() => setEventsOpen(!eventsOpen)}
              style={{
                margin: 0,
                color: 'var(--dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                event_note
              </span>{' '}
              Medaglie Evento
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '20px',
                  color: 'var(--text-muted)',
                  transition: 'transform 0.2s ease',
                  transform: eventsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                expand_more
              </span>
            </h3>
          </div>

          {eventsOpen && (
            <TrophyGrid
              pokedex={myPokedex}
              isPub={false}
              variantSortOption={variantSort}
              variantSortDir={variantSortDir}
              medalSortOption={medalSort}
              medalSortDir={medalSortDir}
              onDeleteEntry={onDeleteVariant}
              showDeleteButton={false}
              mode="events"
              userPosts={posts.filter(p => p.user === currentUserNick)}
            />
          )}

          {/* Variants sorting controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid var(--gray)',
              paddingBottom: '8px',
              margin: '40px 20px 15px 20px',
            }}
          >
            <h3
              onClick={() => setVariantsOpen(!variantsOpen)}
              style={{
                margin: 0,
                color: 'var(--dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <span className="material-symbols-outlined">collections_bookmark</span> Varianti
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '20px',
                  color: 'var(--text-muted)',
                  transition: 'transform 0.2s ease',
                  transform: variantsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                expand_more
              </span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <select
                value={variantSort}
                onChange={(e) => setVariantSort(e.target.value as any)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--gray)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'var(--dark)',
                  background: '#fbfcfc',
                  outline: 'none',
                  cursor: 'pointer',
                  marginBottom: 0,
                }}
              >
                <option value="alpha">Alfabetico</option>
                <option value="nation">Nazione</option>
                <option value="rarity">Rarità</option>
                <option value="unlocked">Sbloccate</option>
              </select>
              <button
                onClick={() => setVariantSortDir((d) => d * -1)}
                style={{
                  border: '1px solid var(--gray)',
                  background: '#fbfcfc',
                  borderRadius: '8px',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {variantSortDir === -1 ? 'arrow_upward' : 'arrow_downward'}
                </span>
              </button>
            </div>
          </div>

          {variantsOpen && (
            <TrophyGrid
              pokedex={myPokedex}
              isPub={false}
              variantSortOption={variantSort}
              variantSortDir={variantSortDir}
              medalSortOption={medalSort}
              medalSortDir={medalSortDir}
              onDeleteEntry={onDeleteVariant}
              showDeleteButton={true}
              mode="variants"
            />
          )}
        </div>
      )}

      {/* 2. MY POSTS TAB */}
      {activeTab === 'posts' && (
        <div style={{ padding: '0 20px', animation: 'fadeIn 0.2s ease-out' }}>
          <h3 style={{ borderBottom: '2px solid var(--gray)', paddingBottom: '8px', margin: '20px 0 15px 0', fontSize: '16px', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined">photo_library</span> Foto Caricate ({posts.filter(p => p.user === currentUserNick).length})
          </h3>
          {posts.filter(p => p.user === currentUserNick).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '10px' }}>photo_camera</span>
              <p style={{ margin: 0, fontSize: '14px' }}>Non hai ancora caricato nessuna foto.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '20px'
              }}
            >
              {[...posts.filter(p => p.user === currentUserNick)].reverse().map((post) => (
                <div
                  key={post.postId}
                  onClick={() => onOpenPostDetail(currentUserNick, post.postId)}
                  style={{
                    position: 'relative',
                    aspectRatio: '1/1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#f1f5f9',
                    border: '1px solid var(--gray)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={post.photo}
                    alt={`${post.brand} - ${post.variant}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.65)',
                      padding: '4px 6px',
                      color: 'white',
                      boxSizing: 'border-box',
                      fontSize: '9px',
                      lineHeight: 1.2,
                    }}
                  >
                    <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formatBeerTitle(post.brand)}
                    </div>
                    <div style={{ opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formatBeerTitle(post.variant)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. STATS TAB */}
      {activeTab === 'stats' && (
        <div style={{ padding: '0 20px', animation: 'fadeIn 0.2s ease-out' }}>
          {/* Circular/Linear progress summary */}
          <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', textAlign: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Progresso Collezione
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                {/* SVG circular progress */}
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--gray)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${completionPercentage}, 100`} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', fontSize: '20px', fontWeight: 'bold', color: 'var(--dark)' }}>
                  {completionPercentage}%
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Varianti Trovate:</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--dark)', margin: '2px 0' }}>
                  {totalUnlocked} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ {totalVariantsInGame}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--primary)' }}>auto_awesome</span>
                  <span>{shinyCount} Shiny sbloccate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: 'var(--white)', padding: '15px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--primary-dark)' }}>group</span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', textTransform: 'uppercase' }}>Brindisi in Compagnia</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark)', marginTop: '2px' }}>{taggedFriendsCount}</div>
            </div>
            <div style={{ background: 'var(--white)', padding: '15px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--gold)' }}>sports_bar</span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', textTransform: 'uppercase' }}>Punti Totali</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark)', marginTop: '2px' }}>{score}</div>
            </div>
          </div>

          {/* Rarity Breakdown */}
          <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', marginBottom: '25px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--dark)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined">analytics</span> Distribuzione Rarità
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Comuni', count: rarityCounts.comune, color: '#10B981', label: 'comune' },
                { name: 'Medie', count: rarityCounts.media, color: '#0EA5E9', label: 'media' },
                { name: 'Rare', count: rarityCounts.rara, color: '#EF4444', label: 'rara' },
              ].map(rarity => {
                const totalCalculated = (rarityCounts.comune + rarityCounts.media + rarityCounts.rara) || 1;
                const percent = Math.round((rarity.count / totalCalculated) * 100);
                return (
                  <div key={rarity.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--dark)' }}>{rarity.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{rarity.count} sbloccate ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--gray)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: rarity.color, borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Country completions */}
          <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', marginBottom: '30px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--dark)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined">flag</span> Completamento Nazioni
            </h4>
            {countryStatsList.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: '10px 0' }}>
                Nessuna nazione sbloccata. Inquadra un codice a barre per iniziare!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {countryStatsList.map(stat => (
                  <div key={stat.country} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '90px', fontSize: '13px', fontWeight: 'bold', color: 'var(--dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {stat.country}
                    </div>
                    <div style={{ flexGrow: 1, height: '8px', background: 'var(--gray)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${stat.percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ width: '65px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {stat.unlocked}/{stat.total} ({stat.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. GUSTI & VOTI (RATINGS) TAB */}
      {activeTab === 'ratings' && (
        <div style={{ padding: '0 20px', animation: 'fadeIn 0.2s ease-out', marginBottom: '30px' }}>
          {/* Overview Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              borderRadius: '20px',
              padding: '20px',
              color: 'white',
              marginBottom: '20px',
              boxShadow: '0 10px 25px rgba(15,23,42,0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  Profilo del Gusto
                </div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#F59E0B' }}>star</span>
                  Le Tue Valutazioni
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  {overallAverage > 0 ? overallAverage : '-'}
                  <span style={{ fontSize: '16px', color: '#94A3B8' }}>/5</span>
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{totalRatedBeers} birre votate</div>
              </div>
            </div>

            {favoriteStyleMeta && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '10px',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: favoriteStyleMeta.color, fontSize: '24px' }}>
                  {favoriteStyleMeta.icon}
                </span>
                <div>
                  <div style={{ fontSize: '11px', color: '#FCD34D', fontWeight: 'bold' }}>Stile Preferito</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: 'white' }}>
                    {favoriteStyleMeta.label} ({styleStats[favoriteStyleKey!].average} ⭐)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Breakdown per Stile */}
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '20px',
              padding: '18px',
              border: '1px solid var(--gray)',
              boxShadow: 'var(--card-shadow)',
              marginBottom: '20px',
            }}
          >
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 'bold', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-dark)' }}>bar_chart</span>
              Media Voti per Stile di Birra
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(beerTypeMeta).map(([typeKey, meta]) => {
                const stat = styleStats[typeKey];
                const pct = stat.average > 0 ? (stat.average / 5) * 100 : 0;
                return (
                  <div key={typeKey}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--dark)' }}>
                        <span className="material-symbols-outlined" style={{ color: meta.color, fontSize: '18px' }}>
                          {meta.icon}
                        </span>
                        {meta.label}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StarRating rating={Math.round(stat.average)} readOnly size={14} />
                        <span style={{ fontSize: '12px', fontWeight: 900, color: stat.average > 0 ? 'var(--dark)' : 'var(--text-muted)' }}>
                          {stat.average > 0 ? `${stat.average} ⭐` : 'N.D.'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({stat.count})</span>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: meta.color,
                          borderRadius: '4px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista Birre Sbloccate con Possibilità di Votarle in qualsiasi momento */}
          <div
            style={{
              background: 'var(--white)',
              borderRadius: '20px',
              padding: '18px',
              border: '1px solid var(--gray)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 'bold', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ color: '#F59E0B' }}>rate_review</span>
              Valuta le tue Birre Sbloccate
            </h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Puoi assegnare o cambiare il tuo voto da 1 a 5 stelle in qualsiasi momento dopo averla bevuta.
            </p>

            {Object.keys(myPokedex || {}).length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
                Non hai ancora sbloccato nessuna birra da valutare.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(myPokedex || {}).map(([key, entry]) => {
                  const brand = entry.brand || key.split('-')[0];
                  const variant = key.split('-').slice(1).join('-');
                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#FAFAFC',
                        borderRadius: '14px',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gray)' }}>
                          {entry.photo ? (
                            <img src={entry.photo} alt={variant} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', color: '#94A3B8' }}>
                              🍺
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--dark)' }}>
                            {brand}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {variant}
                          </div>
                        </div>
                      </div>

                      <div>
                        <StarRating
                          rating={entry.rating || 0}
                          onRate={(newRating) => {
                            if (onRateBeer) {
                              onRateBeer(brand, variant, newRating);
                            }
                          }}
                          size={18}
                          showText
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
