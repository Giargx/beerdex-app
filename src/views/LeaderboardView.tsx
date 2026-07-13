import React, { useState } from 'react';
import { normalizeStr } from '../beers';

interface LeaderboardViewProps {
  currentUserNick: string;
  leaderboardScores: Record<string, number>;
  myFriendsList: string[];
  mySentRequests: string[];
  myReceivedRequests: string[];
  globalAvatars: Record<string, string>;
  onAddFriend: (name: string) => void;
  onOpenPublicProfile: (name: string) => void;
  onNavigateToFriends: () => void;
  getUserRankTitle: (score: number) => string;
  getAvatarZoomProps?: (url: string | undefined) => any;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUserNick,
  leaderboardScores,
  myFriendsList,
  mySentRequests,
  myReceivedRequests,
  globalAvatars,
  onAddFriend,
  onOpenPublicProfile,
  onNavigateToFriends,
  getUserRankTitle,
  getAvatarZoomProps,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'global'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  // Suggestions logic
  const normalizedQuery = normalizeStr(searchQuery);
  const suggestions = searchQuery.length > 0
    ? Object.keys(leaderboardScores).filter(
        (name) =>
          normalizeStr(name).includes(normalizedQuery) &&
          name.toLowerCase() !== currentUserNick.toLowerCase()
      )
    : [];

  const handleSearchSubmit = () => {
    if (!searchQuery) return;
    const normalizedTarget = normalizeStr(searchQuery);
    
    if (normalizedTarget === normalizeStr(currentUserNick)) {
      setSearchResult('self');
      return;
    }

    const matchedName = Object.keys(leaderboardScores).find(
      (name) => normalizeStr(name) === normalizedTarget
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
  const players = Object.keys(leaderboardScores)
    .filter((name) => {
      if (activeTab === 'friends') {
        return name === currentUserNick || myFriendsList.includes(name);
      }
      return true;
    })
    .map((name) => ({
      name,
      score: leaderboardScores[name] || 0,
    }))
    .sort((a, b) => b.score - a.score);

  const getFriendActionHtml = (targetName: string) => {
    if (targetName === currentUserNick) return null;
    
    if (myFriendsList.includes(targetName)) {
      return (
        <span className="badge-status" style={{ color: 'var(--social-blue)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            group
          </span>{' '}
          Amici
        </span>
      );
    }
    
    if (mySentRequests.includes(targetName)) {
      return (
        <span className="badge-status" style={{ color: 'var(--text-muted)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            schedule
          </span>{' '}
          In attesa
        </span>
      );
    }
    
    if (myReceivedRequests.includes(targetName)) {
      return (
        <button className="btn-action btn-accept" onClick={onNavigateToFriends}>
          Rispondi
        </button>
      );
    }

    return (
      <button className="btn-action btn-add" onClick={() => onAddFriend(targetName)}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
          person_add
        </span>{' '}
        Aggiungi
      </button>
    );
  };

  return (
    <div className="page-container-view">
      <header className="hero">
        <h1>Classifiche</h1>
        <p>Sfidali a colpi di boccali e controlla chi domina il Pub.</p>
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
                  onClick={() => onOpenPublicProfile(searchResult)}
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
            <p style={{ textAlign: 'center' }}>Caricamento classifica...</p>
          ) : (
            players.map((player, index) => {
              const rankLabel = getUserRankTitle(player.score);
              const avatar = globalAvatars[player.name];

              let medalHtml: React.ReactNode = <span style={{ fontSize: '16px' }}>{index + 1}</span>;
              if (index === 0) {
                medalHtml = <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>looks_one</span>;
              } else if (index === 1) {
                medalHtml = <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>looks_two</span>;
              } else if (index === 2) {
                medalHtml = <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>looks_3</span>;
              }

              return (
                <div
                  key={player.name}
                  className={`leaderboard-item ${player.name === currentUserNick ? 'is-current-user' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <div className="rank">{medalHtml}</div>
                    <div
                      className="post-avatar"
                      style={{ width: '40px', height: '40px', margin: '0 10px 0 5px' }}
                      {...(getAvatarZoomProps ? getAvatarZoomProps(avatar) : {})}
                    >
                      {avatar ? (
                        <img src={avatar} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                          person
                        </span>
                      )}
                    </div>
                    <div className="lb-user">
                      <span className="clickable-user" onClick={() => onOpenPublicProfile(player.name)}>
                        {player.name}
                      </span>
                      <br />
                      <small style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                        {rankLabel}
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
