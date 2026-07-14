import React from 'react';
import { playClinkSound } from '../utils/audio';
import { FoamBubbles } from '../components/FoamBubbles';
import { getBasePoints } from '../beers';

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
  likes?: Record<string, boolean>;
}

interface PubViewProps {
  currentUserNick: string;
  posts: Post[];
  globalAvatars: Record<string, string>;
  globalDisplayNames?: Record<string, string>;
  myFriendsList: string[];
  isAdminUser: boolean;
  onToggleLike: (postId: string, cardElement: HTMLElement | null) => void;
  onDeletePost: (postId: string, postUser: string, brand: string, variant: string) => void;
  onReportFakePost: (postId: string, postUser: string, brand: string, variant: string) => void;
  onOpenPublicProfile: (username: string) => void;
  getAvatarZoomProps?: (url: string | undefined) => any;
}

export const PubView: React.FC<PubViewProps> = ({
  currentUserNick,
  posts,
  globalAvatars,
  globalDisplayNames,
  myFriendsList,
  isAdminUser,
  onToggleLike,
  onDeletePost,
  onReportFakePost,
  onOpenPublicProfile,
  getAvatarZoomProps,
}) => {
  // Filter visible posts (only user's posts, their friends' posts, or all posts if admin)
  const visiblePosts = posts.filter(
    (post) =>
      post.user === currentUserNick ||
      myFriendsList.includes(post.user) ||
      isAdminUser
  );

  const triggerCinAnimation = (targetContainer: HTMLElement) => {
    if (!targetContainer) return;
    
    // Check if there is already a toast container to avoid multiple overlaps
    if (targetContainer.querySelector('.cin-toast-container')) return;

    playClinkSound();

    const container = document.createElement('div');
    container.className = 'cin-toast-container';
    container.innerHTML = `
      <div class="cin-toast-content">
          <div style="display:flex; align-items:center; gap:0px; position:relative; z-index: 10;">
              <!-- Left beer mug: handle on left, mouth on right -->
              <div class="cin-mug left-mug">
                  <svg viewBox="0 0 100 100" width="80" height="80">
                      <!-- Handle -->
                      <path d="M35,38 C20,38 20,68 35,68" fill="none" stroke="#F8FAFC" stroke-width="7" stroke-linecap="round"/>
                      <path d="M35,38 C20,38 20,68 35,68" fill="none" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
                      <!-- Mug glass container -->
                      <path d="M35,28 L72,28 C77,28 77,78 72,78 L35,78 C30,78 30,28 35,28 Z" fill="rgba(255,255,255,0.18)" stroke="#F8FAFC" stroke-width="3.5"/>
                      <!-- Beer Liquid inside -->
                      <path d="M36,44 L70,44 C73,44 73,76 70,76 L36,76 C33,76 33,44 36,44 Z" fill="#FFB300"/>
                      <!-- Foam top overflow -->
                      <path d="M30,30 C30,18 43,14 52,22 C60,14 74,18 74,30 C74,34 30,34 30,30 Z" fill="#FFFFFF"/>
                      <!-- Glass reflection stripes -->
                      <rect x="42" y="48" width="5" height="24" rx="2" fill="#FFE082" opacity="0.75"/>
                      <rect x="52" y="48" width="5" height="24" rx="2" fill="#FFE082" opacity="0.75"/>
                      <rect x="62" y="48" width="5" height="24" rx="2" fill="#FFE082" opacity="0.75"/>
                  </svg>
              </div>
              <!-- Right beer mug: handle on right, mouth on left -->
              <div class="cin-mug right-mug">
                  <svg viewBox="0 0 100 100" width="80" height="80">
                      <!-- Handle -->
                      <path d="M65,38 C80,38 80,68 65,68" fill="none" stroke="#F8FAFC" stroke-width="7" stroke-linecap="round"/>
                      <path d="M65,38 C80,38 80,68 65,68" fill="none" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
                      <!-- Mug glass container -->
                      <path d="M65,28 L28,28 C23,28 23,78 28,78 L65,78 C70,78 70,28 65,28 Z" fill="rgba(255,255,255,0.18)" stroke="#F8FAFC" stroke-width="3.5"/>
                      <!-- Beer Liquid inside -->
                      <path d="M64,44 L30,44 C27,44 27,76 30,76 L64,76 C67,76 67,44 64,44 Z" fill="#FFB300"/>
                      <!-- Foam top overflow -->
                      <path d="M70,30 C70,18 57,14 48,22 C40,14 26,18 26,30 C26,34 70,34 70,30 Z" fill="#FFFFFF"/>
                      <!-- Glass reflection stripes -->
                      <rect x="53" y="48" width="5" height="24" rx="2" fill="#FFE082" opacity="0.75"/>
                      <rect x="43" y="48" width="5" height="24" rx="2" fill="#FFE082" opacity="0.75"/>
                      <rect x="33" y="48" width="5" height="24" rx="2" fill="#FFE082" opacity="0.75"/>
                  </svg>
              </div>
          </div>
          <!-- Splash drops container -->
          <div class="beer-splash-container">
              <div class="beer-drop drop-1"></div>
              <div class="beer-drop drop-2"></div>
              <div class="beer-drop drop-3"></div>
              <div class="beer-drop drop-4"></div>
          </div>
      </div>
    `;
    
    targetContainer.appendChild(container);
    setTimeout(() => {
      container.classList.add('fade-out');
      setTimeout(() => {
        container.remove();
      }, 400);
    }, 1200);
  };

  const handlePostDoubleTap = (postId: string, e: React.MouseEvent<HTMLImageElement>) => {
    const imgContainer = e.currentTarget.parentElement;
    if (imgContainer) {
      triggerCinAnimation(imgContainer);
    }
    
    // Check if already liked by current user. If not, trigger like
    const post = posts.find((p) => p.postId === postId);
    const isLiked = post?.likes && post.likes[currentUserNick];
    if (!isLiked) {
      onToggleLike(postId, imgContainer);
    }
  };

  return (
    <div className="page-container-view">
      <header className="hero">
        <FoamBubbles />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
          {/* Animated Beer Styled SVG for PUB */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" style={{ width: '180px', height: '68px', filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.15))' }}>
            <defs>
              <linearGradient id="beerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="50%" stopColor="#FFA000" />
                <stop offset="100%" stopColor="#FF6F00" />
              </linearGradient>
              <linearGradient id="foamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#ECEFF1" />
              </linearGradient>
            </defs>

            <style>{`
              @keyframes bubbleRiseUp {
                0% { transform: translateY(0); opacity: 0; }
                20% { opacity: 0.8; }
                80% { opacity: 0.8; }
                100% { transform: translateY(-40px); opacity: 0; }
              }
              .beer-bubble {
                animation: bubbleRiseUp 3s infinite ease-in;
                fill: rgba(255, 255, 255, 0.7);
              }
              .beer-bubble-fast {
                animation: bubbleRiseUp 2s infinite ease-in;
                animation-delay: 0.8s;
                fill: rgba(255, 255, 255, 0.85);
              }
              .beer-bubble-slow {
                animation: bubbleRiseUp 4s infinite ease-in;
                animation-delay: 0.4s;
                fill: rgba(255, 255, 255, 0.5);
              }
            `}</style>

            {/* LETTER P (Styled as a pint of Pilsner with a curved foam head & left handle) */}
            <g transform="translate(10, 10)">
              <path d="M 15 10 L 55 10 A 25 25 0 0 1 55 60 L 35 60 L 35 90 L 15 90 Z" fill="url(#beerGrad)" stroke="#FF8F00" strokeWidth="3" />
              <path d="M 10 10 C 20 -2 30 15 40 5 C 50 15 60 -2 60 10 Z" fill="url(#foamGrad)" stroke="#CFD8DC" strokeWidth="1.5" />
              <path d="M 15 25 L 5 25 C 0 25, 0 45, 5 45 L 15 45" fill="none" stroke="url(#foamGrad)" strokeWidth="4" strokeLinecap="round" />
              
              <circle cx="25" cy="50" r="2" className="beer-bubble" />
              <circle cx="45" cy="40" r="3" className="beer-bubble-fast" />
              <circle cx="35" cy="30" r="1.5" className="beer-bubble-slow" />
            </g>

            {/* LETTER U (Styled as a classic beer mug) */}
            <g transform="translate(110, 10)">
              <path d="M 15 10 L 15 60 A 20 20 0 0 0 55 60 L 55 10 Z" fill="url(#beerGrad)" stroke="#FF8F00" strokeWidth="3" />
              <path d="M 10 10 C 20 -2 30 15 40 5 C 50 15 60 -2 60 10 Z" fill="url(#foamGrad)" stroke="#CFD8DC" strokeWidth="1.5" />
              <path d="M 55 20 L 68 20 C 74 20 74 50 68 50 L 55 50" fill="none" stroke="#FFA000" strokeWidth="4" />
              
              <circle cx="25" cy="55" r="2" className="beer-bubble-fast" />
              <circle cx="45" cy="45" r="1.5" className="beer-bubble" />
              <circle cx="35" cy="65" r="3" className="beer-bubble-slow" />
            </g>

            {/* LETTER B (Styled as double loops with foam & barrel contour) */}
            <g transform="translate(210, 10)">
              <path d="M 15 10 L 50 10 A 18 18 0 0 1 50 48 A 20 20 0 0 1 50 90 L 15 90 Z" fill="url(#beerGrad)" stroke="#FF8F00" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 40 10 C 45 3 50 15 55 10 Z" fill="url(#foamGrad)" stroke="#CFD8DC" strokeWidth="1.2" />
              <path d="M 42 48 C 47 41 52 53 57 48 Z" fill="url(#foamGrad)" stroke="#CFD8DC" strokeWidth="1.2" />
              <path d="M 10 10 C 20 -2 30 15 38 10 Z" fill="url(#foamGrad)" stroke="#CFD8DC" strokeWidth="1.5" />
              
              <circle cx="25" cy="30" r="2" className="beer-bubble" />
              <circle cx="35" cy="60" r="3" className="beer-bubble-slow" />
              <circle cx="45" cy="75" r="1.5" className="beer-bubble-fast" />
            </g>
          </svg>
        </div>
        <p style={{ position: 'relative', zIndex: 2 }}>Scopri cosa stanno bevendo i tuoi amici al bancone.</p>
      </header>

      <div className="social-page-container">
        <div className="social-feed">
          {visiblePosts.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>Nessun post.</p>
          ) : (
            [...visiblePosts].reverse().map((post) => {
              const avatar = globalAvatars[post.user];
              const canDelete = post.user === currentUserNick || isAdminUser;
              const canReport = post.user !== currentUserNick && !isAdminUser;

              // Calculate points received upon unlocking
              const basePts = getBasePoints(post.brand, post.variant);
              let earnedPts = basePts;
              if (post.isShiny) earnedPts *= 2;
              if (post.isShared) earnedPts *= 2;

              const pointsBadge = (
                <span
                  className="pts-tag"
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    background: '#e67e22',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    marginLeft: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    verticalAlign: 'middle'
                  }}
                >
                  +{earnedPts} pt
                </span>
              );

              let actionText: React.ReactNode = (
                <>
                  ha sbloccato la 🍺 <strong className="beer-highlight">{post.brand}</strong> ({post.variant})
                  {pointsBadge}
                </>
              );

              if (post.isShared && post.taggedFriend) {
                actionText = (
                  <>
                    sta bevendo una 🍻 <strong className="beer-highlight">{post.brand}</strong> ({post.variant}) con{' '}
                    <strong className="clickable-user" onClick={() => onOpenPublicProfile(post.taggedFriend!)}>
                      {post.taggedFriend}
                    </strong>
                    {pointsBadge}
                  </>
                );
              }

              const date = new Date(post.time);
              const timeStr = date.toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              const likesCount = post.likes ? Object.keys(post.likes).length : 0;
              const isLiked = post.likes && post.likes[currentUserNick];

              return (
                <div key={post.postId} className="post-card" data-post-id={post.postId}>
                  <div className="post-header">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        className="post-avatar clickable-user"
                        onClick={() => onOpenPublicProfile(post.user)}
                        style={{ cursor: 'pointer' }}
                        {...(getAvatarZoomProps ? getAvatarZoomProps(avatar) : {})}
                      >
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={post.user}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                          />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                            person
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="post-user clickable-user" onClick={() => onOpenPublicProfile(post.user)}>
                          {globalDisplayNames?.[post.user] ? `${globalDisplayNames[post.user]} (@${post.user})` : post.user}
                        </div>
                        <div className="post-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {timeStr}
                          {post.isShiny && (
                            <span style={{ color: 'var(--primary-dark)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                                auto_awesome
                              </span>{' '}
                              Shiny!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        className="btn-delete"
                        onClick={() => onDeletePost(post.postId, post.user, post.brand, post.variant)}
                        title="Elimina post e punti"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>

                  <div className="post-image-container" style={{ position: 'relative', overflow: 'hidden', width: '100%', display: 'block' }}>
                    <img
                      src={post.photo}
                      className="post-image"
                      alt="Beer Unlock"
                      onDoubleClick={(e) => handlePostDoubleTap(post.postId, e)}
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </div>

                  <div className="post-actions">
                    <button
                      className={`btn-like ${isLiked ? 'liked' : ''}`}
                      onClick={(e) => {
                        const imgContainer = e.currentTarget.closest('.post-card')?.querySelector('.post-image-container') as HTMLElement;
                        if (!isLiked && imgContainer) {
                          triggerCinAnimation(imgContainer);
                        }
                        onToggleLike(post.postId, imgContainer);
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        sports_bar
                      </span>{' '}
                      {likesCount}
                    </button>
                    
                    {canReport && (
                      <button
                        className="btn-report"
                        onClick={() => onReportFakePost(post.postId, post.user, post.brand, post.variant)}
                        title="Segnala Post"
                      >
                        <span className="material-symbols-outlined">flag</span>
                      </button>
                    )}
                  </div>

                  <div className="post-caption">
                    <strong className="clickable-user" onClick={() => onOpenPublicProfile(post.user)}>
                      {globalDisplayNames?.[post.user] ? globalDisplayNames[post.user] : post.user}
                    </strong>{' '}
                    {actionText}
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
