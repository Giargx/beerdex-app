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

  // Build the complete list of players
  const allPlayers = Object.keys(safeScores)
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

  // Calculate actual rank of current user across ALL players in this view
  const myRankIndex = allPlayers.findIndex(p => p.name.toLowerCase() === safeUserNick.toLowerCase());
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : null;
  const totalPlayersCount = allPlayers.length;
  const myScore = safeScores[safeUserNick] || 0;

  // For global leaderboard, display only top 50 players; for friends, show all
  const players = activeTab === 'global' ? allPlayers.slice(0, 50) : allPlayers;

  // Top 3 for Podium graphic
  const top1 = players[0];
  const top2 = players[1];
  const top3 = players[2];
  const remainingPlayers = players.slice(3);

  const getFriendActionHtml = (targetName: string) => {
    if (!targetName || targetName === safeUserNick) return null;
    
    if (safeFriends.includes(targetName)) {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#10B981',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          padding: '4px 10px',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>group</span> Amici
        </span>
      );
    }
    
    if (safeSent.includes(targetName)) {
      return (
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#64748B',
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          padding: '4px 10px',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span> In attesa
        </span>
      );
    }
    
    if (safeReceived.includes(targetName)) {
      return (
        <button
          onClick={() => onNavigateToFriends ? onNavigateToFriends() : null}
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            border: 'none',
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Rispondi
        </button>
      );
    }

    return (
      <button
        onClick={() => onAddFriend ? onAddFriend(targetName) : null}
        title={`Aggiungi @${targetName}`}
        style={{
          background: 'linear-gradient(135deg, #FFB300, #FF6F00)',
          border: 'none',
          color: '#0F172A',
          padding: '6px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
      </button>
    );
  };

  return (
    <div className="page-container-view" style={{ paddingBottom: '90px' }}>
      {/* HERO HEADER (CLASSIC STYLE LIKE PUB & EXPLORE) */}
      <header className="hero">
        <FoamBubbles />
        <h1 style={{ position: 'relative', zIndex: 2 }}>Classifiche</h1>
        <p style={{ position: 'relative', zIndex: 2 }}>Sfidali a colpi di boccali e controlla chi domina il Pub.</p>
      </header>

      <div className="page-container" style={{ paddingTop: 0 }}>
        {/* SEGMENTED TAB SWITCHER */}
        <div
          id="leaderboardTabs"
          style={{
            display: 'flex',
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '5px',
            marginBottom: '20px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)'
          }}
        >
          <button
            onClick={() => setActiveTab('friends')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '16px',
              border: 'none',
              background: activeTab === 'friends' ? 'linear-gradient(135deg, #FFB300, #FF6F00)' : 'transparent',
              color: activeTab === 'friends' ? '#0F172A' : '#64748B',
              fontWeight: 850,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeTab === 'friends' ? '0 4px 15px rgba(255, 111, 0, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
            Solo Amici
          </button>
          <button
            onClick={() => setActiveTab('global')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '16px',
              border: 'none',
              background: activeTab === 'global' ? 'linear-gradient(135deg, #FFB300, #FF6F00)' : 'transparent',
              color: activeTab === 'global' ? '#0F172A' : '#64748B',
              fontWeight: 850,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: activeTab === 'global' ? '0 4px 15px rgba(255, 111, 0, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>public</span>
            Globale
          </button>
        </div>

        {/* SEARCH BAR (GLOBAL MODE) */}
        {activeTab === 'global' && (
          <div id="leaderboardSearchBox" style={{ position: 'relative', marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '18px',
              padding: '6px 8px 6px 16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#94A3B8', fontSize: '20px', marginRight: '8px' }}>search</span>
              <input
                type="text"
                placeholder="Cerca un utente per nickname..."
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
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '14px',
                  background: 'transparent',
                  color: 'var(--dark)'
                }}
              />
              <button
                onClick={handleSearchSubmit}
                style={{
                  background: 'linear-gradient(135deg, #FFB300, #FF6F00)',
                  border: 'none',
                  color: '#0F172A',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cerca
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '6px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                zIndex: 20,
                overflow: 'hidden'
              }}>
                {suggestions.slice(0, 5).map((match) => (
                  <div
                    key={match}
                    onClick={() => handleSuggestionClick(match)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F1F5F9',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--dark)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94A3B8' }}>person</span>
                    {match}
                  </div>
                ))}
              </div>
            )}

            {searchResult && (
              <div style={{ marginTop: '12px' }}>
                {searchResult === 'self' && (
                  <p style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                    Non puoi cercare te stesso!
                  </p>
                )}
                {searchResult === 'not_found' && (
                  <p style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>
                    Utente non trovato.
                  </p>
                )}
                {searchResult !== 'self' && searchResult !== 'not_found' && (
                  <div style={{
                    background: 'linear-gradient(135deg, #FFFDF5, #FFF9E6)',
                    border: '1px solid #F59E0B',
                    borderRadius: '18px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: '15px',
                        color: 'var(--dark)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => onOpenPublicProfile ? onOpenPublicProfile(searchResult) : null}
                    >
                      <span className="material-symbols-outlined" style={{ color: '#F59E0B' }}>person</span> @{searchResult}
                    </div>
                    <div>{getFriendActionHtml(searchResult)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {players.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px dashed #E2E8F0',
            color: 'var(--text-muted)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94A3B8', marginBottom: '10px' }}>emoji_events</span>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Nessun utente trovato in questa classifica.</p>
          </div>
        ) : (
          <>
            {/* GORGEOUS PODIUM FOR TOP 3 */}
            <div style={{
              background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
              borderRadius: '28px',
              padding: '24px 14px 0 14px',
              marginBottom: '25px',
              color: '#FFFFFF',
              boxShadow: '0 15px 35px rgba(15, 23, 42, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <FoamBubbles />
              
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '24px', paddingTop: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '1px', color: '#FFB300', textTransform: 'uppercase' }}>
                  🏆 Podio del Bancone
                </span>
              </div>

              {/* PODIUM 3 COLUMNS ALIGNED AT BASELINE */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative',
                zIndex: 2
              }}>
                {/* 2nd PLACE (LEFT) */}
                {top2 ? (
                  <div
                    onClick={() => onOpenPublicProfile ? onOpenPublicProfile(top2.name) : null}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ position: 'relative', marginBottom: '6px' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        border: '3px solid #94A3B8',
                        overflow: 'hidden',
                        background: '#334155',
                        boxShadow: '0 4px 15px rgba(148, 163, 184, 0.4)'
                      }}>
                        {safeAvatars[top2.name] ? (
                          <img src={safeAvatars[top2.name]} alt={top2.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: 'white' }}>
                            {top2.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #E2E8F0, #94A3B8)',
                        color: '#0F172A',
                        fontWeight: 900,
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                      }}>
                        2°
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '12px', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px', textAlign: 'center' }}>
                      {safeDisplayNames[top2.name] || top2.name}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                      {top2.score} pt
                    </div>

                    {/* Podium base 2nd */}
                    <div style={{
                      width: '100%',
                      height: '65px',
                      background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.3) 0%, rgba(148, 163, 184, 0.05) 100%)',
                      border: '1px solid rgba(148, 163, 184, 0.4)',
                      borderBottom: 'none',
                      borderRadius: '16px 16px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px'
                    }}>
                      🥈
                    </div>
                  </div>
                ) : <div style={{ flex: 1 }} />}

                {/* 1st PLACE (CENTER - ALIGNED AT BASELINE) */}
                {top1 ? (
                  <div
                    onClick={() => onOpenPublicProfile ? onOpenPublicProfile(top1.name) : null}
                    style={{
                      flex: 1.15,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ position: 'relative', marginBottom: '6px' }}>
                      <span style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)', fontSize: '20px' }}>👑</span>
                      <div style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        border: '3.5px solid #FFB300',
                        overflow: 'hidden',
                        background: '#334155',
                        boxShadow: '0 0 25px rgba(255, 179, 0, 0.6)'
                      }}>
                        {safeAvatars[top1.name] ? (
                          <img src={safeAvatars[top1.name]} alt={top1.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '22px', color: '#FFB300' }}>
                            {top1.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #FFB300, #FF6F00)',
                        color: '#0F172A',
                        fontWeight: 900,
                        fontSize: '11px',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(255, 111, 0, 0.5)'
                      }}>
                        1°
                      </span>
                    </div>

                    <div style={{ fontWeight: 900, fontSize: '13px', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '95px', textAlign: 'center' }}>
                      {safeDisplayNames[top1.name] || top1.name}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '13px', color: '#FFB300', marginBottom: '6px' }}>
                      {top1.score} pt
                    </div>

                    {/* Podium base 1st */}
                    <div style={{
                      width: '100%',
                      height: '95px',
                      background: 'linear-gradient(180deg, rgba(255, 179, 0, 0.35) 0%, rgba(255, 111, 0, 0.08) 100%)',
                      border: '1px solid rgba(255, 179, 0, 0.5)',
                      borderBottom: 'none',
                      borderRadius: '18px 18px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px'
                    }}>
                      🥇
                    </div>
                  </div>
                ) : null}

                {/* 3rd PLACE (RIGHT) */}
                {top3 ? (
                  <div
                    onClick={() => onOpenPublicProfile ? onOpenPublicProfile(top3.name) : null}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ position: 'relative', marginBottom: '6px' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        border: '3px solid #D97706',
                        overflow: 'hidden',
                        background: '#334155',
                        boxShadow: '0 4px 15px rgba(217, 119, 6, 0.3)'
                      }}>
                        {safeAvatars[top3.name] ? (
                          <img src={safeAvatars[top3.name]} alt={top3.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: 'white' }}>
                            {top3.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #FDBA74, #C2410C)',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                      }}>
                        3°
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '12px', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px', textAlign: 'center' }}>
                      {safeDisplayNames[top3.name] || top3.name}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '12px', color: '#FDBA74', marginBottom: '6px' }}>
                      {top3.score} pt
                    </div>

                    {/* Podium base 3rd */}
                    <div style={{
                      width: '100%',
                      height: '45px',
                      background: 'linear-gradient(180deg, rgba(217, 119, 6, 0.3) 0%, rgba(217, 119, 6, 0.05) 100%)',
                      border: '1px solid rgba(217, 119, 6, 0.4)',
                      borderBottom: 'none',
                      borderRadius: '16px 16px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px'
                    }}>
                      🥉
                    </div>
                  </div>
                ) : <div style={{ flex: 1 }} />}
              </div>
            </div>

            {/* REMAINING PLAYERS LIST (#4 AND BEYOND) */}
            {remainingPlayers.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
                {remainingPlayers.map((player, idx) => {
                  const actualRank = idx + 4;
                  const rankLabel = typeof getUserRankTitle === 'function' ? getUserRankTitle(player.score) : 'Bevitore';
                  const avatar = safeAvatars[player.name];
                  const isMe = player.name === safeUserNick;

                  return (
                    <div
                      key={player.name}
                      style={{
                        background: isMe ? 'linear-gradient(135deg, #FFFDF0 0%, #FFF8D4 100%)' : '#FFFFFF',
                        border: isMe ? '2px solid #F59E0B' : '1px solid rgba(226, 232, 240, 0.8)',
                        borderRadius: '20px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isMe ? '0 6px 20px rgba(245, 158, 11, 0.15)' : '0 2px 8px rgba(15, 23, 42, 0.02)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        {/* Rank Badge */}
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#F1F5F9',
                          color: '#475569',
                          fontWeight: 850,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          #{actualRank}
                        </div>

                        {/* Avatar */}
                        <div
                          onClick={() => onOpenPublicProfile ? onOpenPublicProfile(player.name) : null}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            border: isMe ? '2px solid #F59E0B' : '2px solid #E2E8F0',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800
                          }}
                        >
                          {avatar ? (
                            <img src={avatar} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '18px', fontWeight: 900, color: 'white', textTransform: 'uppercase' }}>
                              {(safeDisplayNames[player.name] || player.name).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              onClick={() => onOpenPublicProfile ? onOpenPublicProfile(player.name) : null}
                              style={{
                                fontWeight: 800,
                                fontSize: '14px',
                                color: 'var(--dark)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {safeDisplayNames[player.name] || player.name}
                            </span>

                            {isMe && (
                              <span style={{
                                background: '#FFB300',
                                color: '#0F172A',
                                fontSize: '9px',
                                fontWeight: 900,
                                padding: '1px 6px',
                                borderRadius: '10px',
                                flexShrink: 0
                              }}>
                                TU
                              </span>
                            )}

                            {['gargo', 'forne02', 'aviatore'].includes((player.name || '').toLowerCase()) && (
                              <span style={{
                                background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                                color: 'white',
                                fontSize: '8px',
                                fontWeight: 900,
                                padding: '2px 5px',
                                borderRadius: '6px',
                                flexShrink: 0
                              }}>
                                ADMIN
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {rankLabel}
                          </div>
                        </div>
                      </div>

                      {/* Score & Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <div style={{
                          background: 'rgba(255, 179, 0, 0.12)',
                          color: 'var(--primary-dark)',
                          fontWeight: 900,
                          fontSize: '13px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {player.score} <span style={{ fontSize: '10px' }}>pt</span>
                        </div>

                        {activeTab === 'global' && getFriendActionHtml(player.name)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* MY RANK STICKY/PINNED FOOTER BADGE */}
        {myRank && (
          <div style={{
            position: 'sticky',
            bottom: '20px',
            background: 'linear-gradient(135deg, #1E293B, #0F172A)',
            borderRadius: '22px',
            padding: '14px 20px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)',
            border: '1px solid rgba(255, 179, 0, 0.4)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '6px 12px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #FFB300, #FF6F00)',
                color: '#0F172A',
                fontWeight: 900,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap'
              }}>
                #{myRank} / {totalPlayersCount}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                  La tua posizione ({activeTab === 'friends' ? 'Amici' : 'Globale'})
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  {safeDisplayNames[safeUserNick] || safeUserNick}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '16px', fontWeight: 900, color: '#FFB300', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {myScore} <span style={{ fontSize: '11px', color: '#94A3B8' }}>pt</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
