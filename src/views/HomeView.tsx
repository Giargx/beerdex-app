import React, { useEffect, useState } from 'react';

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
  posts: Post[];
  leaderboardScores: Record<string, number>;
  onNavigate: (pageId: string) => void;
  getUserRankTitle: (score: number) => string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUserNick,
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

  return (
    <div className="page-container-view">
      <header className="hero">
        <h1>Il mio Bancone</h1>
        <p>Bentornato nel pub, <span style={{ fontWeight: 'bold' }}>{currentUserNick}</span>!</p>
      </header>

      <div className="page-container">
        <div className="dashboard-event" id="dashEventBox">
          <div style={{ color: 'var(--social-blue)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
              calendar_month
            </span>
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: 'var(--dark)' }}>Evento a Tempo Limitato</h4>
            {timedEvent ? (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>{timedEvent.name} ATTIVO!</strong>
                <br />
                {timedEvent.desc}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>Nessun evento attivo</strong>
                <br />
                Prossimi appuntamenti: San Patrizio (Marzo) e Oktoberfest (Settembre/Ottobre).
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
          <div className="dash-last-card">
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
          <div className="dash-empty">
            Nessuna birra sbloccata!
            <br />
            Inizia la tua avventura!
          </div>
        )}

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
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
