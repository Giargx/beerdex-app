import React, { useEffect, useState } from 'react';
import { FoamBubbles } from '../components/FoamBubbles';
import { beers, formatBeerTitle, getUniqueParticipantPosts } from '../beers';
import { getEventMedals } from '../components/TrophyGrid';
import { playClinkSound } from '../utils/audio';
import { calculateScoreBreakdown } from '../utils/score';

interface Post {
  postId: string;
  user: string;
  brand: string;
  variant: string;
  photo: string;
  time: number;
  isShiny: boolean;
  isShared: boolean;
  isStory?: boolean;
  taggedFriend: string | null;
}

interface HomeViewProps {
  currentUserNick: string;
  currentUserDisplayName?: string;
  currentUserAvatar?: string;
  posts: Post[];
  leaderboardScores: Record<string, number>;
  myFriendsList?: string[];
  myReceivedRequests?: string[];
  onNavigate: (pageId: string) => void;
  onNavigateToExplore?: (brand?: string) => void;
  getUserRankTitle: (score: number, unlockedCount?: number) => string;
  myPokedex?: Record<string, any>;
  allBeersCatalog?: any[];
  onInitUnlock?: (brand: string, variant: string) => void;
  onOpenScanner?: () => void;
  onOpenPublicProfile?: (username: string) => void;
  globalUserPrivacy?: Record<string, boolean>;
  isAdminUser?: boolean;
  onOpenUserStory?: (username: string) => boolean;
  onSendFeedback?: (message: string) => Promise<void> | void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUserNick,
  currentUserDisplayName,
  currentUserAvatar,
  posts,
  leaderboardScores: _leaderboardScores,
  myFriendsList = [],
  myReceivedRequests = [],
  onNavigate,
  onNavigateToExplore,
  getUserRankTitle,
  myPokedex = {},
  allBeersCatalog = beers,
  onInitUnlock: _onInitUnlock,
  onOpenScanner,
  onOpenPublicProfile,
  globalUserPrivacy = {},
  isAdminUser = false,
  onOpenUserStory,
  onSendFeedback,
}) => {
  const [timedEvent, setTimedEvent] = useState<{ name: string; desc: string } | null>(null);
  const [cheersToast, setCheersToast] = useState<string | null>(null);
  const [cheeredPosts, setCheeredPosts] = useState<Record<string, boolean>>({});

  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);

  const handleSendFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !onSendFeedback) return;
    setIsSubmittingFeedback(true);
    try {
      await onSendFeedback(feedbackText.trim());
      setFeedbackSent(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSent(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buongiorno ☕';
    if (hour >= 12 && hour < 18) return 'Buon pomeriggio 🍺';
    return 'Buona serata al pub! 🌙';
  };

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    const getEasterDate = (year: number) => {
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const L = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * L) / 451);
      const month = Math.floor((h + L - 7 * m + 114) / 31);
      const day = ((h + L - 7 * m + 114) % 31) + 1;
      return new Date(year, month - 1, day);
    };

    // Short Events
    const patrizioStart = new Date(currentYear, 2, 15);
    const patrizioEnd = new Date(currentYear, 2, 21, 23, 59, 59);

    const easterDate = getEasterDate(currentYear);
    const pasquettaStart = new Date(easterDate);
    pasquettaStart.setDate(easterDate.getDate() - 1);
    const pasquettaEnd = new Date(easterDate);
    pasquettaEnd.setDate(easterDate.getDate() + 1);
    pasquettaEnd.setHours(23, 59, 59, 999);

    const ferragostoStart = new Date(currentYear, 7, 14);
    const ferragostoEnd = new Date(currentYear, 7, 16, 23, 59, 59);

    const oktoberfestStart = new Date(currentYear, 8, 16);
    const oktoberfestEnd = new Date(currentYear, 9, 4, 23, 59, 59);

    // Seasonal Events
    const springStart = new Date(currentYear, 2, 21);
    const springEnd = new Date(currentYear, 5, 20, 23, 59, 59);

    const summerStart = new Date(currentYear, 5, 21);
    const summerEnd = new Date(currentYear, 8, 22, 23, 59, 59);

    const autumnStart = new Date(currentYear, 8, 23);
    const autumnEnd = new Date(currentYear, 11, 20, 23, 59, 59);

    const winterStart = new Date(currentYear - 1, 11, 21);
    const winterEnd = new Date(currentYear, 2, 20, 23, 59, 59);

    if (now >= ferragostoStart && now <= ferragostoEnd) {
      setTimedEvent({
        name: "Ferragosto",
        desc: "Festa di Ferragosto! Sblocca 1 birra per il brindisi estivo e vinci +3 punti!",
      });
    } else if (now >= oktoberfestStart && now <= oktoberfestEnd) {
      setTimedEvent({
        name: "Oktoberfest",
        desc: "Sfida Oktoberfest! Sblocca 3 birre tedesche durante le 3 settimane dell'evento per +5 punti!",
      });
    } else if (now >= patrizioStart && now <= patrizioEnd) {
      setTimedEvent({
        name: "San Patrizio",
        desc: "Festa di San Patrizio! Sblocca 1 birra irlandese/scozzese o scura per +3 punti!",
      });
    } else if (now >= pasquettaStart && now <= pasquettaEnd) {
      setTimedEvent({
        name: "Pasquetta",
        desc: "Pasquetta al pub! Sblocca 1 birra belga o bionda per +3 punti!",
      });
    } else if (now >= summerStart && now <= summerEnd) {
      setTimedEvent({
        name: "Estate",
        desc: `Sfida Estate ${currentYear}! Sblocca 10 birre Bionde o IPA entro il 22 Settembre per +10 punti!`,
      });
    } else if (now >= autumnStart && now <= autumnEnd) {
      setTimedEvent({
        name: "Autunno",
        desc: `Sfida Autunno ${currentYear}! Sblocca 10 birre Rosse, IPA o Tedesche entro il 20 Dicembre per +10 punti!`,
      });
    } else if (now >= springStart && now <= springEnd) {
      setTimedEvent({
        name: "Primavera",
        desc: `Sfida Primavera ${currentYear}! Sblocca 10 birre Bianche entro il 20 Giugno per +10 punti!`,
      });
    } else if (now >= winterStart && now <= winterEnd) {
      setTimedEvent({
        name: "Inverno",
        desc: `Sfida Inverno ${currentYear}! Sblocca 10 birre Scure o Rosse entro il 20 Marzo per +10 punti!`,
      });
    } else {
      setTimedEvent(null);
    }
  }, []);

  const myPosts = posts.filter((p) => p && p.user === currentUserNick && !p.isStory && p.brand !== 'Storia del Pub');
  const totalUnlockedCount = Object.keys(myPokedex).length > 0
    ? Object.keys(myPokedex).length
    : new Set(myPosts.map(p => p.brand + ' - ' + p.variant)).size;

  const catalogList = allBeersCatalog.length > 0 ? allBeersCatalog : beers;
  const userParticipantPosts = getUniqueParticipantPosts(posts, currentUserNick);
  const totalPoints = calculateScoreBreakdown(myPokedex, userParticipantPosts, catalogList).total;
  const rankLabel = getUserRankTitle(totalPoints, totalUnlockedCount);

  // Get last beer unlocked by user
  const lastPost = myPosts.length > 0 ? [...myPosts].sort((a, b) => b.time - a.time)[0] : null;

  // Catalog total count
  const totalVariants = catalogList.reduce((acc, b) => acc + (Array.isArray(b?.variants) ? b.variants.length : 1), 0);
  const isDioDellaBirra = totalUnlockedCount >= totalVariants;

  // Level Progression Calculation
  let nextTargetPoints = 50;
  let prevTargetPoints = 0;
  let nextRankName = "Apprendista Bevitore";

  if (isDioDellaBirra) {
    nextTargetPoints = totalPoints;
    prevTargetPoints = totalPoints;
    nextRankName = "Massimo Livello: Ægir (Divinità Norrena)!";
  } else if (totalPoints < 50) {
    nextTargetPoints = 50;
    prevTargetPoints = 0;
    nextRankName = "Apprendista Bevitore";
  } else if (totalPoints < 200) {
    nextTargetPoints = 200;
    prevTargetPoints = 50;
    nextRankName = "Esploratore di Luppoli";
  } else if (totalPoints < 500) {
    nextTargetPoints = 500;
    prevTargetPoints = 200;
    nextRankName = "Sommelier del Bancone";
  } else if (totalPoints < 1200) {
    nextTargetPoints = 1200;
    prevTargetPoints = 500;
    nextRankName = "Mastro Birraio";
  } else {
    nextTargetPoints = totalPoints;
    prevTargetPoints = totalPoints;
    nextRankName = "Massimo Livello Conseguito!";
  }

  const pointsToNextLevel = nextTargetPoints - totalPoints;
  const progressPct = nextTargetPoints === prevTargetPoints
    ? 100
    : Math.min(((totalPoints - prevTargetPoints) / (nextTargetPoints - prevTargetPoints)) * 100, 100);

  // Unlocked Brands Set
  const unlockedBrands = new Set(myPosts.map((p) => p.brand));
  const missingBeers = catalogList.filter((b) => !unlockedBrands.has(b.brand));

  // Seasonal Beer Recommendation logic (single seasonal recommendation)
  const getSeasonalRecommendedBeer = () => {
    const list = missingBeers.length > 0 ? missingBeers : catalogList;
    const now = new Date();
    const month = now.getMonth();

    let targetKeywords: string[] = [];
    let seasonLabel = 'Consigliata per la stagione';

    if (timedEvent) {
      if (timedEvent.name === 'San Patrizio') {
        targetKeywords = ['irlanda', 'scozia', 'scura', 'stout', 'kilkenny', 'guinness'];
        seasonLabel = 'Consigliata per San Patrizio 🍀';
      } else if (timedEvent.name === 'Oktoberfest') {
        targetKeywords = ['germania', 'tedesca', 'marzen', 'bock', 'paulaner', 'augustiner', 'franziskaner'];
        seasonLabel = 'Consigliata per Oktoberfest 🍺';
      } else if (timedEvent.name === 'Estate' || timedEvent.name === 'Ferragosto') {
        targetKeywords = ['bionda', 'lager', 'ipa', 'pils', 'corona', 'heineken', 'peroni', 'moretti', 'ichnusa', 'session'];
        seasonLabel = 'Consigliata per l\'Estate ☀️ (Bionda/IPA)';
      } else if (timedEvent.name === 'Autunno') {
        targetKeywords = ['rossa', 'ipa', 'amber', 'marzen', 'doppelbock', 'menabrea', 'ceres', 'duvel'];
        seasonLabel = 'Consigliata per l\'Autunno 🍂';
      } else if (timedEvent.name === 'Primavera' || timedEvent.name === 'Pasquetta') {
        targetKeywords = ['bianca', 'blanche', 'weiss', 'weizen', 'saison', 'hoegaarden', 'franziskaner'];
        seasonLabel = 'Consigliata per la Primavera 🌸';
      } else if (timedEvent.name === 'Inverno') {
        targetKeywords = ['scura', 'stout', 'porter', 'rossa', 'bock', 'chimay', 'leffe', 'guinness', 'affligem'];
        seasonLabel = 'Consigliata per l\'Inverno ❄️';
      }
    }

    if (targetKeywords.length === 0) {
      if (month >= 5 && month <= 8) {
        targetKeywords = ['bionda', 'lager', 'ipa', 'pils'];
        seasonLabel = 'Consigliata per l\'Estate ☀️ (Bionda/IPA)';
      } else if (month >= 9 && month <= 10) {
        targetKeywords = ['rossa', 'ipa', 'amber', 'marzen'];
        seasonLabel = 'Consigliata per l\'Autunno 🍂';
      } else if (month >= 11 || month <= 2) {
        targetKeywords = ['scura', 'stout', 'porter', 'rossa'];
        seasonLabel = 'Consigliata per l\'Inverno ❄️';
      } else {
        targetKeywords = ['bianca', 'blanche', 'weiss', 'saison'];
        seasonLabel = 'Consigliata per la Primavera 🌸';
      }
    }

    const seasonalBeers = list.filter((b) => {
      const str = (
        (b.brand || '') +
        ' ' +
        (b.type || '') +
        ' ' +
        (b.country || '') +
        ' ' +
        (Array.isArray(b.variants) ? b.variants.join(' ') : '')
      ).toLowerCase();
      return targetKeywords.some((kw) => str.includes(kw));
    });

    const candidateList = seasonalBeers.length > 0 ? seasonalBeers : list;
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / 86400000);
    const index = Math.abs(dayOfYear) % candidateList.length;

    return { beer: candidateList[index] || catalogList[0], seasonLabel };
  };

  const featuredBeerData = getSeasonalRecommendedBeer();
  const featuredBeer = featuredBeerData.beer;

  // Timed Event Progress Calculation (aligned 100% with TrophyGrid & score rules)
  const getEventProgress = () => {
    if (!timedEvent) return null;

    const myParticipantPosts = getUniqueParticipantPosts(posts, currentUserNick);
    const catalogList = allBeersCatalog.length > 0 ? allBeersCatalog : beers;
    const eventMedals = getEventMedals(myParticipantPosts, catalogList);
    const activeMedal = eventMedals.find((m) => m.name.toLowerCase().includes(timedEvent.name.toLowerCase()));
    if (!activeMedal) return null;

    const current = activeMedal.currentCount ?? 0;
    const target = activeMedal.targetCount ?? 10;
    const pct = Math.min(Math.round((current / target) * 100), 100);

    return { current, target, pct };
  };

  const eventProgress = getEventProgress();

  // Relative time formatter helper
  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return '';
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'ora';
    if (diffMins < 60) return `${diffMins}m fa`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h fa`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}gg fa`;
    return new Date(timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const isPostOwnerPrivate = (nick: string) => {
    if (!globalUserPrivacy || !nick) return false;
    const lower = nick.toLowerCase();
    const matchKey = Object.keys(globalUserPrivacy).find((k) => k.toLowerCase() === lower);
    return matchKey ? globalUserPrivacy[matchKey] === true : false;
  };

  const isFriend = (nick: string) =>
    Array.isArray(myFriendsList) && myFriendsList.some((f) => f.toLowerCase() === nick.toLowerCase());

  // Filter out posts from private profiles for non-friends and exclude stories
  const publicAccessiblePosts = posts.filter((p) => {
    if (!p || !p.user || p.isStory || p.brand === 'Storia del Pub') return false;
    if (p.user.toLowerCase() === currentUserNick.toLowerCase()) return true;
    if (isPostOwnerPrivate(p.user) && !isFriend(p.user) && !isAdminUser) {
      return false;
    }
    return true;
  });

  // Filter posts from friends, sorted chronologically descending (newest first)
  const friendsPosts = publicAccessiblePosts.filter(
    (p) => p && p.user && isFriend(p.user) && p.user.toLowerCase() !== currentUserNick.toLowerCase()
  );

  // If user has friends with posts, display them; otherwise fallback to recent global community posts so it's not empty
  const recentCommunityPosts = (
    friendsPosts.length > 0
      ? [...friendsPosts]
      : [...publicAccessiblePosts.filter((p) => p && p.user && p.user.toLowerCase() !== currentUserNick.toLowerCase())]
  )
    .sort((a, b) => (b.time || 0) - (a.time || 0))
    .slice(0, 10);

  const handleTriggerCheers = (postUser: string, postId: string) => {
    playClinkSound();
    setCheeredPosts(prev => ({ ...prev, [postId]: true }));
    setCheersToast(`Hai brindato con ${postUser}! 🥂✨`);
    setTimeout(() => {
      setCheersToast(null);
    }, 2800);
  };

  // Timed Event Banner Styles configuration
  const getEventConfig = () => {
    if (!timedEvent) {
      return {
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        titleColor: '#F8FAFC',
        descColor: '#94A3B8',
        iconColor: '#FFB300',
        icon: 'calendar_month',
        badge: null
      };
    }

    if (timedEvent.name === "San Patrizio") {
      return {
        background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: '#FFFFFF',
        titleColor: '#A7F3D0',
        descColor: '#E6FDF4',
        iconColor: '#34D399',
        icon: 'eco',
        badge: '🍀 EVENTO ATTIVO'
      };
    }

    if (timedEvent.name === "Estate") {
      return {
        background: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        color: '#FFFFFF',
        titleColor: '#FDE68A',
        descColor: '#FEF3C7',
        iconColor: '#F59E0B',
        icon: 'wb_sunny',
        badge: '☀️ SFIDA STAGIONALE ATTIVA'
      };
    }

    if (timedEvent.name === "Ferragosto") {
      return {
        background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#FFFFFF',
        titleColor: '#FCA5A5',
        descColor: '#FEF2F2',
        iconColor: '#F87171',
        icon: 'celebration',
        badge: '🍉 FESTIVITÀ ATTIVA'
      };
    }

    if (timedEvent.name === "Oktoberfest") {
      return {
        background: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        color: '#FFFFFF',
        titleColor: '#FDE68A',
        descColor: '#FEF3C7',
        iconColor: '#F59E0B',
        icon: 'sports_bar',
        badge: '🍺 EVENTO ATTIVO'
      };
    }

    return {
      background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      color: '#FFFFFF',
      titleColor: '#BFDBFE',
      descColor: '#EFF6FF',
      iconColor: '#60A5FA',
      icon: 'celebration',
      badge: '🎉 EVENTO ATTIVO'
    };
  };

  const eventConfig = getEventConfig();
  const greetingName = currentUserDisplayName ? currentUserDisplayName : currentUserNick;

  return (
    <div className="page-container-view" style={{ paddingBottom: '90px' }}>
      {/* Toast notification for cheers */}
      {cheersToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #1E293B, #0F172A)',
          color: '#FFB300',
          padding: '12px 22px',
          borderRadius: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,179,0,0.4)',
          fontWeight: 'bold',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#FFB300' }}>sports_bar</span>
          {cheersToast}
        </div>
      )}

      {/* LUXURY HERO HEADER */}
      <header className="hero" style={{
        marginTop: 0,
        padding: '30px 20px 25px 20px',
        background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '0 0 32px 32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 15px 35px rgba(15, 23, 42, 0.15)',
        marginBottom: '20px'
      }}>
        <FoamBubbles />
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* App Brand HUGE Centered Hero Header - Pure Golden Logo without Window Frame */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              position: 'relative',
            }}
          >
            <img
              src="/pop-it-logo.png"
              alt="POP IT"
              style={{
                height: '135px',
                width: 'auto',
                maxHeight: '145px',
                maxWidth: '90%',
                objectFit: 'contain',
                display: 'block',
                position: 'relative',
                zIndex: 2,
              }}
            />
          </div>

          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                onClick={() => {
                  const opened = onOpenUserStory ? onOpenUserStory(currentUserNick) : false;
                  if (!opened) {
                    onNavigate('page-profile');
                  }
                }}
                title="Vedi le tue storie o vai al tuo Profilo"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0F172A',
                  fontWeight: 900,
                  fontSize: '20px',
                  boxShadow: '0 4px 15px rgba(255, 179, 0, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                {currentUserAvatar ? (
                  <img
                    src={currentUserAvatar}
                    alt={greetingName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  greetingName.charAt(0).toUpperCase()
                )}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                  {getGreeting()}
                </div>
                <h2 style={{ margin: 0, color: '#FFFFFF', fontSize: '20px', fontWeight: 800 }}>
                  {greetingName}
                </h2>
              </div>
            </div>

            <span 
              className="user-rank-title"
              style={{
                fontSize: '11px',
                padding: '6px 14px',
                background: 'rgba(255, 179, 0, 0.15)',
                color: '#FFB300',
                border: '1px solid rgba(255, 179, 0, 0.3)',
                fontWeight: 800,
                borderRadius: '20px',
                backdropFilter: 'blur(8px)',
                letterSpacing: '0.3px'
              }}
            >
              {rankLabel}
            </span>
          </div>

          {/* Level Progress Banner */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '20px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#E2E8F0', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ color: '#FFB300', fontSize: '18px' }}>military_tech</span>
                Livello
              </span>
              <span style={{ color: '#FFB300', fontWeight: 900, fontSize: '16px' }}>
                {totalPoints} <span style={{ fontSize: '12px', opacity: 0.8 }}>pt</span>
              </span>
            </div>

            <div className="progress-container" style={{ height: '8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden', marginBottom: '8px' }}>
              <div
                className="progress-bar"
                style={{
                  borderRadius: '10px',
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #FFB300, #FF6F00)',
                  height: '100%'
                }}
              ></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
              <span>{prevTargetPoints} pt</span>
              {pointsToNextLevel > 0 ? (
                <span>Mancano <strong style={{ color: '#F8FAFC' }}>{pointsToNextLevel} pt</strong> per <strong style={{ color: '#FFB300' }}>{nextRankName}</strong></span>
              ) : (
                <span style={{ color: '#34D399', fontWeight: 'bold' }}>Massimo Livello Conseguito! 🏆</span>
              )}
              <span>{nextTargetPoints} pt</span>
            </div>
          </div>
        </div>
      </header>

      <div className="page-container" style={{ paddingTop: 0 }}>
        {/* 4 MAIN ACTION TILES */}
        <div
          id="homeTopActionTiles"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '25px'
          }}
        >
          <button
            onClick={() => onOpenScanner ? onOpenScanner() : onNavigate('page-explore')}
            style={{
              background: 'linear-gradient(135deg, #FFB300, #FF6F00)',
              border: 'none',
              borderRadius: '20px',
              padding: '16px 6px',
              color: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(255, 111, 0, 0.25)',
              transition: 'transform 0.15s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>photo_camera</span>
            <span style={{ fontSize: '11px', fontWeight: 850 }}>Sblocca</span>
          </button>

          <button
            onClick={() => onNavigate('page-friends')}
            style={{
              background: 'var(--white)',
              border: '1px solid var(--gray)',
              borderRadius: '20px',
              padding: '16px 6px',
              color: 'var(--dark)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--card-shadow)',
              transition: 'transform 0.15s ease',
              position: 'relative',
            }}
          >
            {Array.isArray(myReceivedRequests) && myReceivedRequests.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.9)',
                  border: '2px solid #FFFFFF',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            )}
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: 'var(--primary-dark)' }}>group</span>
            <span style={{ fontSize: '11px', fontWeight: 800 }}>Amici</span>
          </button>

          <button
            onClick={() => onNavigate('page-map-view')}
            style={{
              background: 'var(--white)',
              border: '1px solid var(--gray)',
              borderRadius: '20px',
              padding: '16px 6px',
              color: 'var(--dark)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--card-shadow)',
              transition: 'transform 0.15s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#10B981' }}>map</span>
            <span style={{ fontSize: '11px', fontWeight: 800 }}>Mappa</span>
          </button>

          <button
            onClick={() => onNavigate('page-rules')}
            style={{
              background: 'var(--white)',
              border: '1px solid var(--gray)',
              borderRadius: '20px',
              padding: '16px 6px',
              color: 'var(--dark)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--card-shadow)',
              transition: 'transform 0.15s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#3B82F6' }}>description</span>
            <span style={{ fontSize: '11px', fontWeight: 800 }}>Regolamento</span>
          </button>
        </div>

        {/* DYNAMIC TIMED EVENT BANNER */}
        <div 
          className="dashboard-event" 
          id="dashEventBox"
          style={{
            background: eventConfig.background,
            border: eventConfig.border,
            padding: '20px',
            borderRadius: '24px',
            marginBottom: '25px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'left',
            boxShadow: timedEvent ? '0 10px 25px rgba(180, 83, 9, 0.2)' : '0 4px 15px rgba(15, 23, 42, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Row: Icon aligned alongside first lines (Title + Badge + Active Header) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              color: eventConfig.iconColor,
              background: timedEvent ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 179, 0, 0.15)',
              padding: '12px',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                {eventConfig.icon}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, color: eventConfig.titleColor, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Evento Speciale
                </h4>
                {eventConfig.badge && (
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px',
                    backdropFilter: 'blur(4px)',
                    whiteSpace: 'nowrap'
                  }}>
                    {eventConfig.badge}
                  </span>
                )}
              </div>
              {timedEvent && (
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                  {timedEvent.name} ATTIVO!
                </div>
              )}
            </div>
          </div>

          {/* Full Width Description & Progress Bar */}
          {timedEvent ? (
            <div style={{ width: '100%' }}>
              <p style={{ margin: 0, fontSize: '13px', color: eventConfig.descColor, lineHeight: '1.45' }}>
                {timedEvent.desc}
              </p>

              {eventProgress && (
                <div style={{
                  marginTop: '12px',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '12px', fontWeight: 800 }}>
                    <span style={{ color: eventConfig.titleColor }}>Progresso Sfida Attuale</span>
                    <span style={{
                      color: '#FFFFFF',
                      background: eventProgress.current >= eventProgress.target ? '#10B981' : 'rgba(255,255,255,0.25)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}>
                      {eventProgress.current} / {eventProgress.target} Birre Sbloccate ({eventProgress.pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${eventProgress.pct}%`,
                      height: '100%',
                      background: eventProgress.current >= eventProgress.target
                        ? 'linear-gradient(90deg, #10B981, #34D399)'
                        : 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                      borderRadius: '5px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '13px', color: eventConfig.descColor, lineHeight: '1.4' }}>
              <strong>Nessun evento attivo in questo momento</strong>
              <br />
              Prossimi eventi: San Patrizio (Marzo) e Oktoberfest (Settembre/Ottobre).
            </p>
          )}
        </div>

        {/* LA SPINA DEL GIORNO (UNICA BIRRA CONSIGLIATA STAGIONALE) */}
        {featuredBeer && (
          <div style={{
            background: 'linear-gradient(135deg, #FFFDF5 0%, #FFF9E6 100%)',
            border: '1px dashed #F59E0B',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '25px',
            boxShadow: 'var(--card-shadow)',
            position: 'relative',
            textAlign: 'left'
          }}>
            {/* Header pill & seasonal label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 850,
                padding: '4px 12px',
                borderRadius: '20px',
                boxShadow: '0 4px 10px rgba(245,158,11,0.25)',
                letterSpacing: '0.5px'
              }}>
                🍺 LA SPINA DEL GIORNO
              </span>

              <span style={{
                fontSize: '11px',
                color: '#92400E',
                fontWeight: 800,
                background: 'rgba(245, 158, 11, 0.15)',
                padding: '3px 10px',
                borderRadius: '12px',
              }}>
                {featuredBeerData.seasonLabel}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{
                background: 'white',
                borderRadius: '18px',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                border: '1px solid rgba(245,158,11,0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                flexShrink: 0
              }}>
                🍺
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--dark)', fontWeight: '800' }}>
                  {featuredBeer.brand}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    📍 {featuredBeer.country}
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: featuredBeer.rarity === 'rara' ? '#F3E8FF' : featuredBeer.rarity === 'media' ? '#FEF3C7' : '#E0F2FE',
                    color: featuredBeer.rarity === 'rara' ? '#6B21A8' : featuredBeer.rarity === 'media' ? '#92400E' : '#0369A1'
                  }}>
                    {featuredBeer.rarity ? featuredBeer.rarity.toUpperCase() : 'COMUNE'}
                  </span>
                </div>
              </div>
            </div>
            
            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <strong>Varianti:</strong> {Array.isArray(featuredBeer?.variants) ? featuredBeer.variants.join(', ') : 'Classica'}. Consigliata per la stagione per avanzare nella sfida ed esplorare nuovi stili!
            </p>

            <button
              onClick={() => {
                if (onNavigateToExplore) {
                  onNavigateToExplore(featuredBeer.brand);
                } else {
                  onNavigate('page-explore');
                }
              }}
              style={{
                marginTop: '14px',
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.25)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
              Trovala in Esplora
            </button>
          </div>
        )}

        {/* WIDGET AMICI AL PUB */}
        {recentCommunityPosts.length > 0 && (
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--gray)',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '25px',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, color: 'var(--dark)', fontSize: '16px', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-dark)', fontSize: '22px' }}>group</span>
                Attività al Bancone
              </h3>
              <button
                onClick={() => onNavigate('page-social')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-dark)',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Vedi Tutti →
              </button>
            </div>

            <div 
              className="no-swipe"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '6px',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x',
                scrollbarWidth: 'none'
              }}
            >
              {recentCommunityPosts.map((p) => {
                const isCheered = cheeredPosts[p.postId];
                const timeAgo = formatRelativeTime(p.time);
                return (
                  <div key={p.postId} style={{
                    minWidth: '150px',
                    maxWidth: '150px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '18px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <img
                        src={p.photo}
                        alt={p.brand}
                        style={{
                          width: '100%',
                          height: '110px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          marginBottom: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => onOpenPublicProfile ? onOpenPublicProfile(p.user) : onNavigate('page-social')}
                      />
                      {timeAgo && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(15, 23, 42, 0.75)',
                            color: '#FFFFFF',
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '10px',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {timeAgo}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: 'var(--dark)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                      onClick={() => onOpenPublicProfile ? onOpenPublicProfile(p.user) : onNavigate('page-social')}
                    >
                      {p.user}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--primary-dark)',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                      marginBottom: '8px'
                    }}>
                      {formatBeerTitle(p.brand)}
                    </div>
                    <button
                      onClick={() => handleTriggerCheers(p.user, p.postId)}
                      style={{
                        width: '100%',
                        padding: '6px 4px',
                        borderRadius: '10px',
                        border: 'none',
                        background: isCheered ? '#10B981' : 'linear-gradient(135deg, #FFB300, #FF6F00)',
                        color: isCheered ? '#FFFFFF' : '#0F172A',
                        fontSize: '10px',
                        fontWeight: 850,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sports_bar</span>
                      {isCheered ? 'Brindato! 🥂' : 'Brinda 🍻'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ULTIMA CONQUISTA CARD */}
        <h3 className="hero-section-title" style={{ marginTop: '10px', color: 'var(--dark)', textAlign: 'center', fontSize: '16px', fontWeight: 850 }}>
          Ultimo Stappo
        </h3>

        {lastPost ? (
          <div className="dash-last-card" style={{ margin: '0 0 25px 0', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
            <img src={lastPost.photo} className="dash-last-img" alt="Ultima Birra" style={{ borderRadius: '20px 20px 0 0' }} />
            <div className="dash-last-info" style={{ padding: '16px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: 'var(--dark)', fontSize: '18px', fontWeight: 800 }}>
                {formatBeerTitle(lastPost.brand)}
              </h4>
              <div style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {formatBeerTitle(lastPost.variant)}
                {lastPost.isShiny && (
                  <span style={{ color: '#EAB308', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#FEF9C3', padding: '2px 8px', borderRadius: '12px', fontSize: '10px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      auto_awesome
                    </span>{' '}
                    SHINY
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Sbloccata il {new Date(lastPost.time).toLocaleDateString()} alle {new Date(lastPost.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ) : (
          <div className="dash-empty" style={{ margin: '0 0 25px 0', padding: '30px', borderRadius: '24px', background: 'var(--white)', border: '1px dashed var(--gray)', color: 'var(--text-muted)' }}>
            Nessuna birra sbloccata ancora!
            <br />
            <strong style={{ color: 'var(--dark)' }}>Inizia subito il tuo viaggio al pub! 🍺</strong>
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <div style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <button
            className="btn-main"
            style={{
              marginTop: 0,
              fontSize: '16px',
              padding: '16px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #FFB300, #FF6F00)',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(255, 111, 0, 0.25)',
              color: '#0F172A',
              fontWeight: 900
            }}
            onClick={() => onNavigate('page-explore')}
          >
            <span className="material-symbols-outlined">search</span> Esplora Catalogo & Scatta
          </button>
          <button
            className="btn-secondary"
            style={{ marginTop: 0, fontSize: '16px', padding: '14px', borderRadius: '18px', justifyContent: 'center' }}
            onClick={() => onNavigate('page-profile')}
          >
            <span className="material-symbols-outlined">collections_bookmark</span> La Mia Collezione
          </button>
        </div>

        {/* CONSIGLI SECTION (EXPANDABLE) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            borderRadius: '20px',
            padding: isFeedbackExpanded ? '18px 20px' : '14px 20px',
            marginTop: '25px',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.15)',
            color: 'white',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Header Row - Single line clickable banner */}
          <div
            onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '22px' }}>
                rate_review
              </span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>
                Consigli
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!isFeedbackExpanded && (
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                  Scrivi agli admin
                </span>
              )}
              <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '20px' }}>
                {isFeedbackExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </div>
          </div>

          {/* Step 2: Expanded Content */}
          {isFeedbackExpanded && (
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                Hai suggerimenti per migliorare l'app o hai riscontrato dei problemi? Comunicalo direttamente agli admin!
              </p>
              {feedbackSent ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981', padding: '12px', borderRadius: '14px', fontSize: '12px', fontWeight: 700, textAlign: 'center' }}>
                  ✓ Messaggio inviato con successo agli admin! Grazie per il tuo feedback.
                </div>
              ) : (
                <form onSubmit={handleSendFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <textarea
                    placeholder="Scrivi qui consigli, idee o segnalazioni di problemi..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1px solid #334155',
                      background: '#0F172A',
                      color: 'white',
                      fontSize: '13px',
                      resize: 'none',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !feedbackText.trim()}
                    style={{
                      background: feedbackText.trim() ? 'linear-gradient(135deg, #FFB300, #FF6F00)' : '#334155',
                      color: feedbackText.trim() ? '#0F172A' : '#64748B',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: feedbackText.trim() ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                    Invia agli Admin
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
