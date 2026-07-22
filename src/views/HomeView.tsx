import React, { useEffect, useState } from 'react';
import { FoamBubbles } from '../components/FoamBubbles';
import { beers } from '../beers';

interface Post {
  postId: string;
  user: string;
  brand: string;
  variant: string;
  photo: string;
  time: number;
  isShiny: boolean;
  isShared: boolean;
  taggedFriend: string | null;
}

interface HomeViewProps {
  currentUserNick: string;
  currentUserDisplayName?: string;
  posts: Post[];
  leaderboardScores: Record<string, number>;
  onNavigate: (pageId: string) => void;
  getUserRankTitle: (score: number, unlockedCount?: number) => string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUserNick,
  currentUserDisplayName,
  posts,
  leaderboardScores,
  onNavigate,
  getUserRankTitle,
}) => {
  const [timedEvent, setTimedEvent] = useState<{ name: string; desc: string } | null>(null);

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

  const myPosts = posts.filter((p) => p.user === currentUserNick);
  const totalUnlockedCount = new Set(myPosts.map(p => p.brand + ' - ' + p.variant)).size;
  const totalPoints = leaderboardScores[currentUserNick] || 0;
  const rankLabel = getUserRankTitle(totalPoints, totalUnlockedCount);

  // Get last beer unlocked by user
  const lastPost = myPosts.length > 0 ? [...myPosts].sort((a, b) => b.time - a.time)[0] : null;

  // New Rank Progression Tiers
  let nextTargetPoints = 50;
  let prevTargetPoints = 0;
  let nextRankName = "Apprendista Bevitore";

  const totalVariants = beers.reduce((acc, b) => acc + b.variants.length, 0);
  const isDioDellaBirra = totalUnlockedCount >= totalVariants;

  if (isDioDellaBirra) {
    nextTargetPoints = totalPoints;
    prevTargetPoints = totalPoints;
    nextRankName = "Massimo Livello: Dio della Birra!";
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

  // New Collector Metrics
  const shinyCount = myPosts.filter(p => p.isShiny).length;
  const countriesExplored = new Set(myPosts.map(p => {
    const b = beers.find(beerItem => beerItem.brand === p.brand);
    return b ? b.country : '';
  }).filter(Boolean)).size;

  // Deterministic pick of a missing beer of the week
  const unlockedBrands = new Set(myPosts.map((p) => p.brand));
  const missingBeers = beers.filter((b) => !unlockedBrands.has(b.brand));
  const getBeerOfTheWeek = () => {
    const list = missingBeers.length > 0 ? missingBeers : beers;
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    const index = (weekNum + today.getFullYear()) % list.length;
    return list[index];
  };
  const beerOfTheWeek = getBeerOfTheWeek();

  // Timed Event Banner Styles configuration
  const getEventConfig = () => {
    if (!timedEvent) {
      return {
        background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        border: '1px solid rgba(148, 163, 184, 0.25)',
        color: 'var(--dark)',
        titleColor: 'var(--dark)',
        descColor: 'var(--text-muted)',
        iconColor: '#64748B',
        icon: 'calendar_month',
        badge: null
      };
    }

    if (timedEvent.name === "San Patrizio") {
      return {
        background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
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
        border: '1px solid rgba(245, 158, 11, 0.2)',
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
        border: '1px solid rgba(239, 68, 68, 0.2)',
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
        border: '1px solid rgba(245, 158, 11, 0.2)',
        color: '#FFFFFF',
        titleColor: '#FDE68A',
        descColor: '#FEF3C7',
        iconColor: '#F59E0B',
        icon: 'sports_bar',
        badge: '🍺 EVENTO ATTIVO'
      };
    }

    if (timedEvent.name === "Primavera") {
      return {
        background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        color: '#FFFFFF',
        titleColor: '#BAE6FD',
        descColor: '#F0F9FF',
        iconColor: '#38BDF8',
        icon: 'local_florist',
        badge: '🌸 SFIDA STAGIONALE ATTIVA'
      };
    }

    if (timedEvent.name === "Autunno") {
      return {
        background: 'linear-gradient(135deg, #C2410C 0%, #7C2D12 100%)',
        border: '1px solid rgba(249, 115, 22, 0.2)',
        color: '#FFFFFF',
        titleColor: '#FFEDD5',
        descColor: '#FFF7ED',
        iconColor: '#FB923C',
        icon: 'wb_twilight',
        badge: '🍁 SFIDA STAGIONALE ATTIVA'
      };
    }

    if (timedEvent.name === "Inverno") {
      return {
        background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
        border: '1px solid rgba(96, 165, 250, 0.2)',
        color: '#FFFFFF',
        titleColor: '#BFDBFE',
        descColor: '#EFF6FF',
        iconColor: '#60A5FA',
        icon: 'ac_unit',
        badge: '❄️ SFIDA STAGIONALE ATTIVA'
      };
    }

    if (timedEvent.name === "Pasquetta") {
      return {
        background: 'linear-gradient(135deg, #CA8A04 0%, #854D0E 100%)',
        border: '1px solid rgba(234, 179, 8, 0.2)',
        color: '#FFFFFF',
        titleColor: '#FEF08A',
        descColor: '#FEFCE8',
        iconColor: '#FACC15',
        icon: 'egg',
        badge: '🧺 FESTIVITÀ ATTIVA'
      };
    }

    return {
      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
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
    <div className="page-container-view">
      <header className="hero">
        <FoamBubbles />
        <h1 style={{ position: 'relative', zIndex: 2 }}>Il mio Bancone</h1>
        <p style={{ position: 'relative', zIndex: 2 }}>
          Bentornato nel pub, <span style={{ fontWeight: 'bold' }}>{greetingName}</span>!
        </p>
      </header>

      <div className="page-container">
        {/* Dynamic Timed Event Banner */}
        <div 
          className="dashboard-event" 
          id="dashEventBox"
          style={{
            background: eventConfig.background,
            border: eventConfig.border,
            padding: '22px',
            borderRadius: '24px',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            textAlign: 'left',
            boxShadow: timedEvent ? '0 10px 25px rgba(180, 83, 9, 0.15)' : '0 4px 15px rgba(148, 163, 184, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            color: eventConfig.iconColor,
            background: timedEvent ? 'rgba(255, 255, 255, 0.1)' : 'rgba(100, 116, 139, 0.08)',
            padding: '12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              {eventConfig.icon}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, color: eventConfig.titleColor, fontSize: '14px', fontWeight: 800 }}>
                Evento a Tempo Limitato
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
            {timedEvent ? (
              <p style={{ margin: 0, fontSize: '13px', color: eventConfig.descColor, lineHeight: '1.4' }}>
                <strong style={{ fontSize: '14px' }}>{timedEvent.name} ATTIVO!</strong>
                <br />
                {timedEvent.desc}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: eventConfig.descColor, lineHeight: '1.4' }}>
                <strong>Nessun evento attivo in questo momento</strong>
                <br />
                Prossimi eventi: San Patrizio (Marzo) e Oktoberfest (Settembre/Ottobre).
              </p>
            )}
          </div>
        </div>

        {/* Level & Points Progress Section */}
        <div className="dashboard-stats" style={{ padding: '20px', borderRadius: '24px', background: 'var(--white)', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', marginBottom: '25px', textAlign: 'left' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: 'var(--dark)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>military_tech</span>
            Progresso Collezionista
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="user-rank-title" style={{ fontSize: '12px', padding: '5px 10px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#FFFFFF', fontWeight: 'bold', borderRadius: '8px' }}>
              {rankLabel}
            </span>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {totalPoints} <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 'bold' }}>pt</span>
            </div>
          </div>

          <div className="progress-container" style={{ height: '10px', borderRadius: '20px', background: 'var(--gray)', overflow: 'hidden', marginTop: '12px', marginBottom: '8px' }}>
            <div
              className="progress-bar"
              style={{ borderRadius: '20px', width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))', height: '100%' }}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            <span>{prevTargetPoints} pt</span>
            {pointsToNextLevel > 0 ? (
              <span>Mancano <strong>{pointsToNextLevel} pt</strong> per diventare <strong>{nextRankName}</strong></span>
            ) : (
              <span>Sei al livello massimo! 🏆</span>
            )}
            <span>{nextTargetPoints} pt</span>
          </div>
        </div>

        {/* Collector Metrics Dashboard Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '25px'
        }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray)', borderRadius: '20px', padding: '12px 6px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--primary-dark)', marginBottom: '4px' }}>sports_bar</span>
            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--dark)' }}>{totalUnlockedCount}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sbloccate</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray)', borderRadius: '20px', padding: '12px 6px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#EAB308', marginBottom: '4px' }}>auto_awesome</span>
            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--dark)' }}>{shinyCount}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shiny</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray)', borderRadius: '20px', padding: '12px 6px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#10B981', marginBottom: '4px' }}>public</span>
            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--dark)' }}>{countriesExplored}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paesi</div>
          </div>
        </div>

        {/* Beer of the Week Card */}
        {beerOfTheWeek && (
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
            <span style={{
              position: 'absolute',
              top: '-10px',
              left: '20px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '20px',
              boxShadow: '0 4px 10px rgba(245,158,11,0.2)'
            }}>
              CONSIGLIATA DELLA SETTIMANA
            </span>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                border: '1px solid rgba(245,158,11,0.15)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
              }}>
                🍺
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--dark)', fontWeight: 'bold' }}>
                  {beerOfTheWeek.brand}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    📍 {beerOfTheWeek.country}
                  </span>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: beerOfTheWeek.rarity === 'rara' ? '#F3E8FF' : beerOfTheWeek.rarity === 'media' ? '#FEF3C7' : '#E0F2FE',
                    color: beerOfTheWeek.rarity === 'rara' ? '#6B21A8' : beerOfTheWeek.rarity === 'media' ? '#92400E' : '#0369A1'
                  }}>
                    {beerOfTheWeek.rarity.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <strong>Varianti:</strong> {beerOfTheWeek.variants.join(', ')}. Una birra fantastica da aggiungere alla tua collezione. Clicca sotto per cercarla nel catalogo!
            </p>
            <button
              onClick={() => onNavigate('page-explore')}
              style={{
                marginTop: '12px',
                width: '100%',
                padding: '10px',
                fontSize: '13px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>
              Trovala in Esplora
            </button>
          </div>
        )}

        <h3 className="hero-section-title" style={{ marginTop: '10px', color: 'var(--dark)', textAlign: 'center' }}>
          Ultima Conquista
        </h3>

        {lastPost ? (
          <div className="dash-last-card" style={{ margin: '0 0 25px 0' }}>
            <img src={lastPost.photo} className="dash-last-img" alt="Ultima Birra" />
            <div className="dash-last-info">
              <h4 style={{ margin: '0 0 5px 0', color: 'var(--dark)', fontSize: '18px' }}>
                {lastPost.brand}
              </h4>
              <div style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {lastPost.variant}
                {lastPost.isShiny && (
                  <span style={{ color: 'var(--primary-dark)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      auto_awesome
                    </span>{' '}
                    SHINY
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Sbloccata il: {new Date(lastPost.time).toLocaleDateString()} alle {new Date(lastPost.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ) : (
          <div className="dash-empty" style={{ margin: '0 0 25px 0' }}>
            Nessuna birra sbloccata!
            <br />
            Inizia la tua avventura!
          </div>
        )}

        <div style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <button
            className="btn-main"
            style={{
              marginTop: 0,
              fontSize: '16px',
              padding: '14px',
              background: 'linear-gradient(135deg, #f39c12, #e67e22)',
              justifyContent: 'center',
            }}
            onClick={() => onNavigate('page-explore')}
          >
            <span className="material-symbols-outlined">search</span> Vai a Esplorare e Scatta
          </button>
          <button
            className="btn-secondary"
            style={{ marginTop: 0, fontSize: '16px', padding: '14px', justifyContent: 'center' }}
            onClick={() => onNavigate('page-profile')}
          >
            <span className="material-symbols-outlined">collections_bookmark</span> La Mia Collezione
          </button>
        </div>
      </div>
    </div>
  );
};

