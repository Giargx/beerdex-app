import React, { useEffect, useState } from 'react';
import { FoamBubbles } from '../components/FoamBubbles';

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
  getUserRankTitle: (score: number) => string;
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
    const month = now.getMonth() + 1;
    if (month === 3) {
      setTimedEvent({
        name: "San Patrizio",
        desc: "Mese di Marzo! Sblocca 2 varianti irlandesi o scozzesi per vincere la medaglia!",
      });
    } else if (month >= 6 && month <= 8) {
      setTimedEvent({
        name: "Solstizio d'Estate",
        desc: "Estate! Sblocca 3 birre Bionde o IPA per rinfrescarti e vincere la medaglia!",
      });
    } else if (month === 9 || month === 10) {
      setTimedEvent({
        name: "Oktoberfest",
        desc: "Periodo Oktoberfest! Sblocca 3 varianti tedesche tra Settembre e Ottobre!",
      });
    } else {
      setTimedEvent(null);
    }
  }, []);

  const totalPoints = leaderboardScores[currentUserNick] || 0;
  const rankLabel = getUserRankTitle(totalPoints);

  // Calculate progress bar percentage
  let progressPct = 0;
  if (totalPoints < 10) {
    progressPct = (totalPoints / 10) * 100;
  } else if (totalPoints < 50) {
    progressPct = ((totalPoints - 10) / 40) * 100;
  } else if (totalPoints < 100) {
    progressPct = ((totalPoints - 50) / 50) * 100;
  } else if (totalPoints < 200) {
    progressPct = ((totalPoints - 100) / 100) * 100;
  } else {
    progressPct = 100;
  }

  // Get last beer unlocked by user
  const myPosts = posts.filter((p) => p.user === currentUserNick);
  const lastPost = myPosts.length > 0 ? [...myPosts].sort((a, b) => b.time - a.time)[0] : null;

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

    if (timedEvent.name === "Solstizio d'Estate") {
      return {
        background: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        color: '#FFFFFF',
        titleColor: '#FDE68A',
        descColor: '#FEF3C7',
        iconColor: '#F59E0B',
        icon: 'wb_sunny',
        badge: '☀️ EVENTO ATTIVO'
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
          {eventConfig.badge && (
            <span style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '4px 8px',
              borderRadius: '20px',
              letterSpacing: '0.5px',
              backdropFilter: 'blur(4px)'
            }}>
              {eventConfig.badge}
            </span>
          )}

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
          <div style={{ flex: 1, paddingRight: eventConfig.badge ? '80px' : '0' }}>
            <h4 style={{ margin: '0 0 6px 0', color: eventConfig.titleColor, fontSize: '15px', fontWeight: 'bold' }}>
              Evento a Tempo Limitato
            </h4>
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

        <div className="dashboard-stats">
          <h3 style={{ marginTop: 0, color: 'var(--dark)' }}>Punteggio Totale</h3>
          <div className="progress-text" style={{ fontSize: '22px', color: 'var(--primary-dark)', marginBottom: '5px' }}>
            {totalPoints} <span className="material-symbols-outlined">emoji_events</span>
          </div>
          <div>
            <span className="user-rank-title" style={{ fontSize: '14px', padding: '6px 12px' }}>
              {rankLabel}
            </span>
          </div>
          <div className="progress-container" style={{ height: '15px', borderRadius: '20px', marginTop: '15px' }}>
            <div
              className="progress-bar"
              style={{ borderRadius: '20px', width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        <h3 className="hero-section-title" style={{ marginTop: '30px', color: 'var(--dark)', textAlign: 'center' }}>
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

