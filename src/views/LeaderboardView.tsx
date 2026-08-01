import React, { useState } from 'react';
import { normalizeStr } from '../beers';
import { FoamBubbles } from '../components/FoamBubbles';

interface LeaderboardViewProps {
  currentUserNick: string;
  leaderboardScores: Record<string, number>;
  myFriendsList: string[];
  mySentRequests: string[];
  myReceivedRequests: string[];
  globalAvatars: Record<string, string>;
  globalDisplayNames?: Record<string, string>;
  onAddFriend: (name: string) => void;
  onOpenPublicProfile: (name: string) => void;
  onNavigateToFriends: () => void;
  getUserRankTitle: (score: number, unlockedCount?: number) => string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUserNick = '',
  leaderboardScores = {},
  myFriendsList = [],
  mySentRequests = [],
  myReceivedRequests = [],
  globalAvatars = {},
  globalDisplayNames = {},
  onAddFriend,
  onOpenPublicProfile,
  onNavigateToFriends,
  getUserRankTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'global'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // Safe data fallbacks
  const safeScores = leaderboardScores && typeof leaderboardScores === 'object' ? leaderboardScores : {};
  const safeFriends = Array.isArray(myFriendsList) ? myFriendsList : [];
  const safeSent = Array.isArray(mySentRequests) ? mySentRequests : [];
  const safeReceived = Array.isArray(myReceivedRequests) ? myReceivedRequests : [];
  const safeAvatars = globalAvatars && typeof globalAvatars === 'object' ? globalAvatars : {};
  const safeDisplayNames = globalDisplayNames && typeof globalDisplayNames === 'object' ? globalDisplayNames : {};
  const safeUserNick = currentUserNick || '';

  // Suggestions logic
  const normalizedQuery = normalizeStr(searchQuery || '');
  const suggestions = searchQuery.length > 0
    ? Object.keys(safeScores).filter(
        (name) =>
          name &&
          normalizeStr(name).includes(normalizedQuery) &&
          name.toLowerCase() !== safeUserNick.toLowerCase()
      )
    : [];

  const handleSearchSubmit = () => {
    if (!searchQuery) return;
    const normalizedTarget = normalizeStr(searchQuery);
    
    if (normalizedTarget === normalizeStr(safeUserNick)) {
      setSearchResult('self');
      return;
    }

    const matchedName = Object.keys(safeScores).find(
      (name) => name && normalizeStr(name) === normalizedTarget
    );

    if (matchedName) {
      setSearchResult(matchedName);
    } else {
      setSearchResult('not_found');
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (name: string) => {
    setSearchQuery(name);
    setSearchResult(name);
    setShowSuggestions(false);
  };

  // Build the list of players to show
  const players = Object.keys(safeScores)
    .filter((name) => {
      if (!name) return false;
      if (activeTab === 'friends') {
        return name === safeUserNick || safeFriends.includes(name);
      }
      return true;
    })
    .map((name) => ({
      name,
      score: typeof safeScores[name] === 'number' ? safeScores[name] : 0,
    }))
    .sort((a, b) => b.score - a.score);

  const getFriendActionHtml = (targetName: string) => {
    if (!targetName || targetName === safeUserNick) return null;
    
    if (safeFriends.includes(targetName)) {
      return (
        <span className="badge-status" style={{ color: 'var(--social-blue)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            group
          </span>{' '}
          Amici
        </span>
      );
    }
    
    if (safeSent.includes(targetName)) {
      return (
        <span className="badge-status" style={{ color: 'var(--text-muted)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            schedule
          </span>{' '}
          In attesa
        </span>
      );
    }
    
    if (safeReceived.includes(targetName)) {
      return (
        <button className="btn-action btn-accept" onClick={() => onNavigateToFriends ? onNavigateToFriends() : null}>
          Rispondi
        </button>
      );
    }

    return (
      <button className="btn-action btn-add" onClick={() => onAddFriend ? onAddFriend(targetName) : null} title={`Aggiungi @${targetName}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          person_add
        </span>
      </button>
    );
  };

  return (
    <div className="page-container-view">
      <header className="hero">
        <FoamBubbles />
        <h1 style={{ position: 'relative', zIndex: 2 }}>Classifiche</h1>
        <p style={{ position: 'relative', zIndex: 2 }}>Sfidali a colpi di boccali e controlla chi domina il Pub.</p>
      </header>

      <div className="page-container">
        <div className="tabs">
          <div
            className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Solo Amici
          </div>
          <div
            className={`tab ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            Globale
          </div>
        </div>

        {activeTab === 'global' && (
          <div className="add-friend-wrapper">
            <div className="add-friend-box">
              <input
                type="text"
                placeholder="Digita un Nickname per cercare..."
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) {
                    setSearchResult(null);
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <button onClick={handleSearchSubmit}>Cerca</button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-box" style={{ display: 'block' }}>
                {suggestions.slice(0, 5).map((match) => (
                  <div
                    key={match}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(match)}
                  >
                    {match}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {searchResult && activeTab === 'global' && (
          <div id="searchResultArea">
            {searchResult === 'self' && (
              <p style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                Non puoi cercare te stesso!
              </p>
            )}
            {searchResult === 'not_found' && (
              <p style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                Utente non trovato.
              </p>
            )}
            {searchResult !== 'self' && searchResult !== 'not_found' && (
              <div className="search-result-card">
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '18px',
                    color: 'var(--dark)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  onClick={() => onOpenPublicProfile ? onOpenPublicProfile(searchResult) : null}
                >
                  <span className="material-symbols-outlined">person</span> {searchResult}
                </div>
                <div>{getFriendActionHtml(searchResult)}</div>
              </div>
            )}
          </div>
        )}

        <div className="list-container leaderboard-list" id="leaderboardList">
          {players.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
              Nessun utente trovato in questa classifica.
            </p>
          ) : (
            players.map((player, index) => {
              const rankLabel = typeof getUserRankTitle === 'function' 
                ? getUserRankTitle(player.score) 
                : 'Bevitore';
              const avatar = safeAvatars[player.name];

              let medalHtml: React.ReactNode;
              if (index === 0) {
                medalHtml = (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFE066 0%, #F59E0B 100%)',
                      color: '#78350F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '15px',
                      boxShadow: '0 3px 8px rgba(245, 158, 11, 0.4), inset 0 1px 2px rgba(255,255,255,0.9)',
                      border: '1.5px solid #FEF08A',
                      flexShrink: 0,
                    }}
                    title="1° Posto - Oro"
                  >
                    🥇
                  </div>
                );
              } else if (index === 1) {
                medalHtml = (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F3F4F6 0%, #9CA3AF 100%)',
                      color: '#1F2937',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '15px',
                      boxShadow: '0 3px 8px rgba(156, 163, 175, 0.35), inset 0 1px 2px rgba(255,255,255,0.9)',
                      border: '1.5px solid #FFFFFF',
                      flexShrink: 0,
                    }}
                    title="2° Posto - Argento"
                  >
                    🥈
                  </div>
                );
              } else if (index === 2) {
                medalHtml = (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FDBA74 0%, #C2410C 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '15px',
                      boxShadow: '0 3px 8px rgba(194, 65, 12, 0.35), inset 0 1px 2px rgba(255,255,255,0.7)',
                      border: '1.5px solid #FFEDD5',
                      flexShrink: 0,
                    }}
                    title="3° Posto - Bronzo"
                  >
                    🥉
                  </div>
                );
              } else {
                medalHtml = (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#F8FAFC',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                );
              }

              return (
                <div
                  key={player.name}
                  className={`leaderboard-item ${player.name === safeUserNick ? 'is-current-user' : ''}`}
                >
                  <div className="lb-player-left" style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <div className="rank">{medalHtml}</div>
                    <div
                      className="post-avatar"
                      onClick={() => onOpenPublicProfile ? onOpenPublicProfile(player.name) : null}
                      style={{ width: '40px', height: '40px', margin: '0 10px 0 5px', cursor: 'pointer' }}
                    >
                      {avatar ? (
                        <img src={avatar} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                          person
                        </span>
                      )}
                    </div>
                    <div 
                      className="lb-user" 
                      onClick={() => onOpenPublicProfile ? onOpenPublicProfile(player.name) : null}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="clickable-user" style={{ fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{safeDisplayNames?.[player.name] ? safeDisplayNames[player.name] : player.name}</span>
                        {['gargo', 'forne02', 'aviatore'].includes((player.name || '').toLowerCase()) && (
                          <span
                            style={{
                              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                              color: 'white',
                              fontSize: '8px',
                              fontWeight: 900,
                              padding: '2px 5px',
                              borderRadius: '6px',
                              letterSpacing: '0.5px',
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            ADMIN
                          </span>
                        )}
                      </span>
                      <br />
                      <small style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                        {safeDisplayNames?.[player.name] ? `@${player.name} • ${rankLabel}` : rankLabel}
                      </small>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="lb-score">
                      {player.score}{' '}
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                        emoji_events
                      </span>
                    </div>
                    {activeTab === 'global' && getFriendActionHtml(player.name)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
