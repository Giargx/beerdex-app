import React, { useState, useEffect } from 'react';
import { TrophyGrid } from '../components/TrophyGrid';
import type { PokedexEntry } from '../components/TrophyGrid';
import { FoamBubbles } from '../components/FoamBubbles';
import { beers, getBeerType, formatBeerTitle } from '../beers';
import type { Beer } from '../beers';
import { StarRating } from '../components/StarRating';

interface PublicProfileViewProps {
  username: string;
  displayName?: string;
  pokedex: Record<string, PokedexEntry>;
  score: number;
  avatar: string | undefined;
  onBack: () => void;
  getUserRankTitle: (score: number, unlockedCount?: number) => string;
  getAvatarZoomProps?: (url: string | undefined) => any;
  posts: any[];
  onOpenPostDetail: (username: string, postId: string) => void;
  allBeersCatalog?: Beer[];
  isAdminUser?: boolean;
  onDeleteVariant?: (brand: string, variant: string, targetUser?: string) => void;
  isPrivate?: boolean;
  isFriend?: boolean;
  currentUserNick?: string;
  myFriendsList?: string[];
  mySentRequests?: string[];
  myReceivedRequests?: string[];
  onAddFriend?: (name: string) => void;
  onRemoveFriend?: (name: string) => void;
  onAcceptRequest?: (sender: string) => void;
  onCancelSentRequest?: (target: string) => void;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  username = '',
  displayName,
  pokedex = {},
  score = 0,
  avatar,
  onBack,
  getUserRankTitle,
  getAvatarZoomProps,
  posts = [],
  onOpenPostDetail,
  allBeersCatalog = beers,
  isAdminUser,
  onDeleteVariant,
  isPrivate = false,
  isFriend = false,
  currentUserNick = '',
  myFriendsList: _myFriendsList = [],
  mySentRequests = [],
  myReceivedRequests = [],
  onAddFriend,
  onRemoveFriend,
  onAcceptRequest,
  onCancelSentRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'posts' | 'stats' | 'ratings' | 'medals'>('posts');

  const isPrivateProfile = isPrivate && !isFriend && username.toLowerCase() !== currentUserNick.toLowerCase() && !isAdminUser;

  useEffect(() => {
    if (isPrivateProfile) {
      setActiveTab('medals');
    } else {
      setActiveTab('posts');
    }
  }, [username, isPrivateProfile]);

  const [variantSort, setVariantSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [variantSortDir, setVariantSortDir] = useState<number>(1);
  const [medalSort, setMedalSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [medalSortDir, setMedalSortDir] = useState<number>(1);

  const [medalsOpen, setMedalsOpen] = useState<boolean>(false);
  const [eventsOpen, setEventsOpen] = useState<boolean>(false);
  const [variantsOpen, setVariantsOpen] = useState<boolean>(false);

  const safeCatalog = Array.isArray(allBeersCatalog) ? allBeersCatalog : beers;
  const safePokedex = pokedex && typeof pokedex === 'object' ? pokedex : {};
  const safePosts = Array.isArray(posts) ? posts : [];
  const safeUser = username || '';

  const rankTitle = typeof getUserRankTitle === 'function'
    ? getUserRankTitle(score || 0, Object.keys(safePokedex).length)
    : 'Bevitore';

  const myPosts = safePosts.filter((p) => p && p.user === safeUser);
  const totalUnlocked = Object.keys(safePokedex).length;

  // Rating Stats Calculation for Public Profile
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

  Object.entries(safePokedex).forEach(([key, entry]) => {
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

  // General Stats (matching ProfileView 1:1)
  const totalVariantsInGame = safeCatalog.reduce((acc: number, beer: Beer) => acc + (Array.isArray(beer?.variants) ? beer.variants.length : 1), 0);
  const completionPercentage = totalVariantsInGame > 0 ? Math.round((totalUnlocked / totalVariantsInGame) * 100) : 0;

  let shinyCount = 0;
  let taggedCount = 0;
  Object.values(safePokedex).forEach((entry) => {
    if (entry && entry.isShiny) shinyCount++;
    if (entry && entry.taggedFriend) taggedCount++;
  });

  const rarityCounts = { comune: 0, media: 0, rara: 0 };
  Object.keys(safePokedex).forEach(key => {
    const brand = key.split('-')[0];
    const beer = safeCatalog.find((b: Beer) => b && b.brand === brand);
    if (beer) {
      const r = (beer.rarity || 'comune') as 'comune' | 'media' | 'rara';
      rarityCounts[r] = (rarityCounts[r] || 0) + 1;
    }
  });

  const countryCounts: Record<string, { unlocked: number, total: number }> = {};
  safeCatalog.forEach((beer: Beer) => {
    if (!beer) return;
    const c = beer.country || 'Sconosciuta';
    if (!countryCounts[c]) {
      countryCounts[c] = { unlocked: 0, total: 0 };
    }
    countryCounts[c].total += Array.isArray(beer?.variants) ? beer.variants.length : 1;
  });
  Object.keys(safePokedex).forEach(key => {
    const brand = key.split('-')[0];
    const beer = safeCatalog.find((b: Beer) => b && b.brand === brand);
    if (beer) {
      const c = beer.country || 'Sconosciuta';
      if (countryCounts[c]) {
        countryCounts[c].unlocked += 1;
      }
    }
  });

  const countryStatsList = Object.entries(countryCounts)
    .map(([country, stats]) => ({
      country,
      percentage: stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0,
      ...stats
    }))
    .filter(stat => stat.unlocked > 0)
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="page-container-view">
      <header className="hero">
        <FoamBubbles />
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '10px',
            color: 'var(--dark)',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            zIndex: 5,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            arrow_back
          </span>{' '}
          Indietro
        </button>
        
        <div
          id="pubAvatarDisplay"
          {...(getAvatarZoomProps ? getAvatarZoomProps(avatar) : {})}
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: '#e0e6ed',
            margin: '10px auto 10px auto',
            border: '3px solid var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            fontWeight: 'bold',
            color: 'var(--text-muted)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {avatar ? (
            <img src={avatar} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary-dark)', textTransform: 'uppercase' }}>
              {(displayName || username).charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        <h1 id="pubProfileName" style={{ margin: '5px 0', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>{displayName ? displayName : username}</span>
          {['gargo', 'forne02', 'aviatore'].includes((username || '').toLowerCase()) && (
            <span
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '8px',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>admin_panel_settings</span>
              ADMIN
            </span>
          )}
        </h1>
        {displayName && (
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '5px', position: 'relative', zIndex: 2 }}>
            @{username}
          </div>
        )}
        <p id="pubProfileRank" style={{ fontWeight: 'bold', color: 'var(--dark)', opacity: 0.7, position: 'relative', zIndex: 2, margin: '5px 0' }}>
          {rankTitle}
        </p>

        {/* Interactive Friend Action Button */}
        {currentUserNick && username.toLowerCase() !== currentUserNick.toLowerCase() && (
          <div style={{ marginTop: '10px', marginBottom: '6px', position: 'relative', zIndex: 2 }}>
            {isFriend ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onRemoveFriend) {
                    onRemoveFriend(username);
                  }
                }}
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#059669',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                <span>Amici ✓</span>
              </button>
            ) : Array.isArray(myReceivedRequests) && myReceivedRequests.some((r) => r.toLowerCase() === username.toLowerCase()) ? (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => onAcceptRequest && onAcceptRequest(username)}
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check</span>
                  Accetta Richiesta
                </button>
              </div>
            ) : Array.isArray(mySentRequests) && mySentRequests.some((r) => r.toLowerCase() === username.toLowerCase()) ? (
              <button
                type="button"
                onClick={() => onCancelSentRequest && onCancelSentRequest(username)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  color: '#64748B',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                <span>Richiesta Inviata (Annulla)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAddFriend && onAddFriend(username)}
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                <span>Aggiungi agli Amici</span>
              </button>
            )}
          </div>
        )}
        
        {/* Instagram-style user stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '18px', padding: '0 10px', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', flex: '1' }}>
            <div style={{ fontWeight: 900, fontSize: '18px', color: 'var(--dark)' }}>{myPosts.length}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Post</div>
          </div>
          <div style={{ textAlign: 'center', flex: '1', borderLeft: '1px solid rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)' }}>
            <div style={{ fontWeight: 900, fontSize: '18px', color: 'var(--dark)' }}>{score}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Punti</div>
          </div>
          <div style={{ textAlign: 'center', flex: '1' }}>
            <div style={{ fontWeight: 900, fontSize: '18px', color: 'var(--dark)' }}>{totalUnlocked}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Sblocchi</div>
          </div>
        </div>
      </header>

      <div className="page-container" style={{ marginTop: '-40px', paddingTop: '30px' }}>
        {isPrivateProfile && (
          /* Private Profile Banner */
          <div
            style={{
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: '1px solid #FCD34D',
              borderRadius: '20px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.15)',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#F59E0B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                lock
              </span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', color: '#92400E', fontWeight: 'bold' }}>
                Profilo Privato
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#78350F', lineHeight: '1.4' }}>
                Le foto e le valutazioni di @{username} sono visibili solo agli amici.<br />
                Le sue medaglie e le sue statistiche rimangono visibili a tutti!
              </p>
            </div>
          </div>
        )}

        {/* Tab control bar */}
        <div style={{
          display: 'flex',
          marginBottom: '20px',
          background: 'var(--gray)',
          borderRadius: '12px',
          padding: '4px',
          gap: '4px',
          position: 'relative',
          zIndex: 2
        }}>
          {(isPrivateProfile ? [
            { id: 'medals', label: 'Medaglie', icon: 'workspace_premium' },
            { id: 'stats', label: 'Statistiche', icon: 'bar_chart' }
          ] : [
            { id: 'posts', label: 'Post', icon: 'photo_library' },
            { id: 'collection', label: 'Collezione', icon: 'collections_bookmark' },
            { id: 'stats', label: 'Statistiche', icon: 'bar_chart' },
            { id: 'ratings', label: 'Gusti & Voti', icon: 'star' }
          ]).map(tab => (
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
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{tab.icon}</span>
              {isPrivateProfile && (
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{tab.label}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'medals' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            {/* Medaglie Brand Section */}
            <div style={{ background: 'var(--white)', borderRadius: '20px', padding: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', borderBottom: '2px solid var(--gray)', paddingBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--gold)' }}>workspace_premium</span>
                Medaglie Brand
              </h3>
              <TrophyGrid
                pokedex={pokedex}
                isPub={true}
                variantSortOption={variantSort}
                variantSortDir={variantSortDir}
                medalSortOption={medalSort}
                medalSortDir={medalSortDir}
                showDeleteButton={false}
                mode="medals"
              />
            </div>

            {/* Medaglie Evento Section */}
            <div style={{ background: 'var(--white)', borderRadius: '20px', padding: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', borderBottom: '2px solid var(--gray)', paddingBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>event_note</span>
                Medaglie Evento
              </h3>
              <TrophyGrid
                pokedex={pokedex}
                isPub={true}
                variantSortOption={variantSort}
                variantSortDir={variantSortDir}
                medalSortOption={medalSort}
                medalSortDir={medalSortDir}
                showDeleteButton={false}
                mode="events"
                userPosts={[]}
              />
            </div>
          </div>
        )}
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
                margin: '40px 20px 15px 20px',
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
                pokedex={pokedex}
                isPub={true}
                variantSortOption={variantSort}
                variantSortDir={variantSortDir}
                medalSortOption={medalSort}
                medalSortDir={medalSortDir}
                showDeleteButton={false}
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
                pokedex={pokedex}
                isPub={true}
                variantSortOption={variantSort}
                variantSortDir={variantSortDir}
                medalSortOption={medalSort}
                medalSortDir={medalSortDir}
                showDeleteButton={false}
                mode="events"
                userPosts={myPosts}
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
                pokedex={pokedex}
                isPub={true}
                variantSortOption={variantSort}
                variantSortDir={variantSortDir}
                medalSortOption={medalSort}
                medalSortDir={medalSortDir}
                showDeleteButton={!!isAdminUser}
                onDeleteEntry={(brand, variant) => onDeleteVariant?.(brand, variant, username)}
                mode="variants"
              />
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <h3 style={{ borderBottom: '2px solid var(--gray)', paddingBottom: '8px', margin: '20px 20px 15px 20px', fontSize: '16px', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">photo_library</span> Foto Caricate ({myPosts.length})
            </h3>
            {myPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '10px' }}>photo_camera</span>
                <p style={{ margin: 0, fontSize: '14px' }}>Nessuna foto caricata da questo utente.</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  margin: '0 20px 20px 20px'
                }}
              >
                {[...myPosts].reverse().map((post) => (
                  <div
                    key={post.postId}
                    onClick={() => onOpenPostDetail(username, post.postId)}
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

        {/* 3. STATISTICHE GENERALI (STATS) TAB FOR PUBLIC PROFILE */}
        {activeTab === 'stats' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', marginBottom: '30px' }}>
            {/* Circular/Linear progress summary */}
            <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', textAlign: 'center', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                Progresso Collezione di @{username}
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
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark)', marginTop: '2px' }}>{taggedCount}</div>
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
                  Nessuna nazione sbloccata da questo utente.
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

        {/* 4. GUSTI & VOTI (RATINGS) TAB FOR PUBLIC PROFILE */}
        {activeTab === 'ratings' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out', marginBottom: '30px' }}>
            {/* Overview Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                borderRadius: '20px',
                padding: '20px',
                color: 'white',
                marginBottom: '20px',
                boxShadow: '0 10px 25px rgba(15,23,42,0.15)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    Profilo del Gusto di @{username}
                  </div>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#F59E0B' }}>star</span>
                    Valutazioni Personali
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    {overallAverage > 0 ? overallAverage : '-'}
                    <span style={{ fontSize: '14px', color: '#94A3B8' }}>/5</span>
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
                          <StarRating rating={stat.average} readOnly size={14} />
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

            {/* Lista Birre Votate dall'utente */}
            <div
              style={{
                background: 'var(--white)',
                borderRadius: '20px',
                padding: '18px',
                border: '1px solid var(--gray)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 'bold', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ color: '#F59E0B' }}>rate_review</span>
                Birre Recensite ({totalRatedBeers})
              </h4>

              {totalRatedBeers === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
                  @{username} non ha ancora recensito nessuna birra.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(pokedex || {})
                    .filter(([_, entry]) => entry.rating && entry.rating > 0)
                    .map(([key, entry]) => {
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
                            <StarRating rating={entry.rating || 0} readOnly size={16} showText />
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

    </div>
  );
};
