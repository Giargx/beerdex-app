import React from 'react';

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
        <h1>Al Pub</h1>
        <p>Scopri cosa stanno bevendo i tuoi amici al bancone.</p>
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

              let actionText: React.ReactNode = (
                <>
                  ha sbloccato la 🍺 <strong className="beer-highlight">{post.brand}</strong> ({post.variant})
                </>
              );

              if (post.isShared && post.taggedFriend) {
                actionText = (
                  <>
                    sta bevendo una 🍻 <strong className="beer-highlight">{post.brand}</strong> ({post.variant}) con{' '}
                    <strong className="clickable-user" onClick={() => onOpenPublicProfile(post.taggedFriend!)}>
                      {post.taggedFriend}
                    </strong>
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
                        className="post-avatar"
                        {...(getAvatarZoomProps ? getAvatarZoomProps(avatar) : {})}
                      >
                        {avatar ? (
                          <img src={avatar} alt={post.user} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                            person
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="post-user clickable-user" onClick={() => onOpenPublicProfile(post.user)}>
                          {post.user}
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
                    />
                  </div>

                  <div className="post-actions">
                    <button
                      className={`btn-like ${isLiked ? 'liked' : ''}`}
                      onClick={(e) => {
                        const imgContainer = e.currentTarget.closest('.post-card')?.querySelector('.post-image-container') as HTMLElement;
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
                      {post.user}
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
