import React, { useState } from 'react';
import { FoamBubbles } from '../components/FoamBubbles';

interface FriendsViewProps {
  myFriendsList: string[];
  myReceivedRequests: string[];
  mySentRequests: string[];
  myRejectedRequests: string[];
  globalAvatars?: Record<string, string>;
  globalDisplayNames?: Record<string, string>;
  onAcceptRequest: (sender: string) => void;
  onRejectRequest: (sender: string) => void;
  onCancelSentRequest: (target: string) => void;
  onRemoveFriend: (friend: string) => void;
  onRestoreRejectedRequest: (sender: string) => void;
  onOpenPublicProfile: (name: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  myFriendsList = [],
  myReceivedRequests = [],
  mySentRequests = [],
  myRejectedRequests = [],
  globalAvatars = {},
  globalDisplayNames = {},
  onAcceptRequest,
  onRejectRequest,
  onCancelSentRequest,
  onRemoveFriend,
  onRestoreRejectedRequest,
  onOpenPublicProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'received' | 'sent' | 'accepted' | 'rejected'>('received');
  const [searchQuery, setSearchQuery] = useState('');

  const filterList = (list: string[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((user) => {
      const name = (globalDisplayNames[user] || '').toLowerCase();
      const nick = user.toLowerCase();
      return name.includes(q) || nick.includes(q);
    });
  };

  const tabs: { id: 'received' | 'sent' | 'accepted' | 'rejected'; label: string; count: number; icon: string; badgeColor?: string }[] = [
    { id: 'received', label: 'Richieste', count: myReceivedRequests.length, icon: 'inbox', badgeColor: '#EF4444' },
    { id: 'accepted', label: 'Miei Amici', count: myFriendsList.length, icon: 'group' },
    { id: 'sent', label: 'Inviate', count: mySentRequests.length, icon: 'send' },
    { id: 'rejected', label: 'Rifiutate', count: myRejectedRequests.length, icon: 'block' },
  ];

  return (
    <div className="page-container-view" style={{ paddingBottom: '60px' }}>
      <header className="hero">
        <FoamBubbles />
        <h1 style={{ position: 'relative', zIndex: 2 }}>Gestione Amici</h1>
        <p style={{ position: 'relative', zIndex: 2 }}>Aggiungi, accetta e gestisci la tua cerchia nel Pub.</p>
      </header>

      <div className="page-container" style={{ paddingTop: 0, maxWidth: '640px', margin: '0 auto' }}>
        {/* Segmented Pill Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '5px',
            marginBottom: '16px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)',
            overflowX: 'auto',
            touchAction: 'pan-x',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontWeight: isActive ? 900 : 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: isActive ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    style={{
                      background: isActive ? '#FFFFFF' : tab.badgeColor || '#E2E8F0',
                      color: isActive ? '#D97706' : tab.badgeColor ? '#FFFFFF' : '#475569',
                      fontSize: '10px',
                      fontWeight: 900,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      marginLeft: '2px',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              fontSize: '20px',
              pointerEvents: 'none',
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Cerca amico per nome o @nickname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 38px 12px 42px',
              fontSize: '13px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          )}
        </div>

        {/* Content List Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* TAB 1: RICEVUTE */}
          {activeSubTab === 'received' && (
            <>
              {filterList(myReceivedRequests).length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#FFFBEB',
                      color: '#D97706',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>inbox</span>
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {searchQuery ? 'Nessuna richiesta trovata' : 'Nessuna richiesta in arrivo'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                    {searchQuery
                      ? `Nessuna richiesta corrisponde a "${searchQuery}".`
                      : 'Quando altri giocatori ti invieranno una richiesta di amicizia, apparirà qui!'}
                  </p>
                </div>
              ) : (
                filterList(myReceivedRequests).map((sender) => {
                  const av = globalAvatars[sender];
                  const disp = globalDisplayNames[sender] || sender;
                  return (
                    <div
                      key={sender}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <div
                        onClick={() => onOpenPublicProfile(sender)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            padding: '2px',
                            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {av ? (
                              <img src={av} alt={sender} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#64748B' }}>
                                person
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{disp}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>@{sender}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => onAcceptRequest(sender)}
                          style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 3px 8px rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                          Accetta
                        </button>
                        <button
                          onClick={() => onRejectRequest(sender)}
                          style={{
                            background: '#FEF2F2',
                            color: '#EF4444',
                            border: '1px solid #FCA5A5',
                            padding: '8px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                          Rifiuta
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: INVIATE */}
          {activeSubTab === 'sent' && (
            <>
              {filterList(mySentRequests).length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#F1F5F9',
                      color: '#64748B',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>send</span>
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {searchQuery ? 'Nessun utente trovato' : 'Nessuna richiesta inviata'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                    {searchQuery
                      ? `Nessun contatto trovato per "${searchQuery}".`
                      : 'Cerca i tuoi amici nella Classifica per inviare loro una richiesta di amicizia!'}
                  </p>
                </div>
              ) : (
                filterList(mySentRequests).map((target) => {
                  const av = globalAvatars[target];
                  const disp = globalDisplayNames[target] || target;
                  return (
                    <div
                      key={target}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                      }}
                    >
                      <div
                        onClick={() => onOpenPublicProfile(target)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            padding: '2px',
                            background: '#CBD5E1',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {av ? (
                              <img src={av} alt={target} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#64748B' }}>
                                person
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{disp}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>@{target} • In attesa</div>
                        </div>
                      </div>

                      <button
                        onClick={() => onCancelSentRequest(target)}
                        style={{
                          background: '#F1F5F9',
                          color: '#64748B',
                          border: '1px solid #CBD5E1',
                          padding: '8px 14px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                        Annulla
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 3: MIEI AMICI */}
          {activeSubTab === 'accepted' && (
            <>
              {filterList(myFriendsList).length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#ECFDF5',
                      color: '#10B981',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>group</span>
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {searchQuery ? 'Nessun amico trovato' : 'Nessun amico ancora aggiunto'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                    {searchQuery
                      ? `Nessun amico corrisponde a "${searchQuery}".`
                      : 'Aggiungi i tuoi compagni di bevuta dalla pagina Classifiche o dai loro profili!'}
                  </p>
                </div>
              ) : (
                filterList(myFriendsList).map((friend) => {
                  const av = globalAvatars[friend];
                  const disp = globalDisplayNames[friend] || friend;
                  return (
                    <div
                      key={friend}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                      }}
                    >
                      <div
                        onClick={() => onOpenPublicProfile(friend)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            padding: '2px',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {av ? (
                              <img src={av} alt={friend} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#64748B' }}>
                                person
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{disp}</span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: '#10B981',
                                background: '#ECFDF5',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                border: '1px solid #A7F3D0',
                              }}
                            >
                              Amico ✓
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>@{friend}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveFriend(friend)}
                        style={{
                          background: '#FEF2F2',
                          color: '#EF4444',
                          border: '1px solid #FCA5A5',
                          padding: '8px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_remove</span>
                        Rimuovi
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* TAB 4: RIFIUTATE */}
          {activeSubTab === 'rejected' && (
            <>
              {filterList(myRejectedRequests).length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid #F1F5F9',
                    boxShadow: '0 4px 15px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#FEF2F2',
                      color: '#EF4444',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>block</span>
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                    {searchQuery ? 'Nessun utente trovato' : 'Nessuna richiesta rifiutata'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                    {searchQuery
                      ? `Nessun contatto corrisponde a "${searchQuery}".`
                      : 'Gli utenti di cui hai rifiutato la richiesta appariranno qui.'}
                  </p>
                </div>
              ) : (
                filterList(myRejectedRequests).map((sender) => {
                  const av = globalAvatars[sender];
                  const disp = globalDisplayNames[sender] || sender;
                  return (
                    <div
                      key={sender}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                      }}
                    >
                      <div
                        onClick={() => onOpenPublicProfile(sender)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                      >
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            padding: '2px',
                            background: '#CBD5E1',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {av ? (
                              <img src={av} alt={sender} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#64748B' }}>
                                person
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>{disp}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>@{sender} • Rifiutato</div>
                        </div>
                      </div>

                      <button
                        onClick={() => onRestoreRejectedRequest(sender)}
                        style={{
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 3px 8px rgba(245, 158, 11, 0.25)',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock_open</span>
                        Sblocca
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
