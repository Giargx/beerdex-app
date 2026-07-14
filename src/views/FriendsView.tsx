import React, { useState } from 'react';
import { FoamBubbles } from '../components/FoamBubbles';

interface FriendsViewProps {
  myFriendsList: string[];
  myReceivedRequests: string[];
  mySentRequests: string[];
  myRejectedRequests: string[];
  onAcceptRequest: (sender: string) => void;
  onRejectRequest: (sender: string) => void;
  onCancelSentRequest: (target: string) => void;
  onRemoveFriend: (friend: string) => void;
  onRestoreRejectedRequest: (sender: string) => void;
  onOpenPublicProfile: (name: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  myFriendsList,
  myReceivedRequests,
  mySentRequests,
  myRejectedRequests,
  onAcceptRequest,
  onRejectRequest,
  onCancelSentRequest,
  onRemoveFriend,
  onRestoreRejectedRequest,
  onOpenPublicProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'received' | 'sent' | 'accepted' | 'rejected'>('received');

  return (
    <div className="page-container-view">
      <header className="hero">
        <FoamBubbles />
        <h1 style={{ position: 'relative', zIndex: 2 }}>Gestione Amici</h1>
        <p style={{ position: 'relative', zIndex: 2 }}>Aggiungi, accetta e gestisci la tua cerchia.</p>
      </header>

      <div className="page-container">
        <div className="tabs">
          <div
            className={`tab ${activeSubTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('received')}
          >
            Ricevute
            {myReceivedRequests.length > 0 && (
              <span
                className="material-symbols-outlined"
                id="tabBeerBadge"
                style={{ marginLeft: '5px', fontSize: '16px', color: 'var(--primary-dark)', display: 'inline-block' }}
              >
                priority_high
              </span>
            )}
          </div>
          <div
            className={`tab ${activeSubTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('sent')}
          >
            Inviate
          </div>
          <div
            className={`tab ${activeSubTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('accepted')}
          >
            Accettate
          </div>
          <div
            className={`tab ${activeSubTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('rejected')}
          >
            Rifiutate
          </div>
        </div>

        <div className="list-container" id="friendsManagerList">
          {activeSubTab === 'received' && (
            <>
              {myReceivedRequests.length === 0 ? (
                <p style={{ textAlign: 'center' }}>Nessuna richiesta ricevuta.</p>
              ) : (
                myReceivedRequests.map((sender) => (
                  <div key={sender} className="list-item">
                    <div
                      className="lb-user clickable-user"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => onOpenPublicProfile(sender)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-muted)' }}>
                        mail
                      </span>{' '}
                      {sender}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn-action btn-accept" onClick={() => onAcceptRequest(sender)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          check
                        </span>{' '}
                        Accetta
                      </button>
                      <button className="btn-action btn-reject" onClick={() => onRejectRequest(sender)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          close
                        </span>{' '}
                        Rifiuta
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeSubTab === 'sent' && (
            <>
              {mySentRequests.length === 0 ? (
                <p style={{ textAlign: 'center' }}>Nessuna richiesta inviata.</p>
              ) : (
                mySentRequests.map((target) => (
                  <div key={target} className="list-item">
                    <div
                      className="lb-user clickable-user"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => onOpenPublicProfile(target)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-muted)' }}>
                        send
                      </span>{' '}
                      {target}
                    </div>
                    <button className="btn-action btn-cancel" onClick={() => onCancelSentRequest(target)}>
                      Annulla
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeSubTab === 'accepted' && (
            <>
              {myFriendsList.length === 0 ? (
                <p style={{ textAlign: 'center' }}>Nessun amico aggiunto.</p>
              ) : (
                myFriendsList.map((friend) => (
                  <div key={friend} className="list-item">
                    <div
                      className="lb-user clickable-user"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => onOpenPublicProfile(friend)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--social-blue)' }}>
                        handshake
                      </span>{' '}
                      {friend}
                    </div>
                    <button className="btn-action btn-reject" onClick={() => onRemoveFriend(friend)}>
                      Rimuovi
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {activeSubTab === 'rejected' && (
            <>
              {myRejectedRequests.length === 0 ? (
                <p style={{ textAlign: 'center' }}>Nessun utente rifiutato.</p>
              ) : (
                myRejectedRequests.map((sender) => (
                  <div key={sender} className="list-item">
                    <div
                      className="lb-user clickable-user"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => onOpenPublicProfile(sender)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--danger)' }}>
                        block
                      </span>{' '}
                      {sender}
                    </div>
                    <button className="btn-action btn-accept" onClick={() => onRestoreRejectedRequest(sender)}>
                      Sblocca
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
