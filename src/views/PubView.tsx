import React from 'react';
import { playClinkSound } from '../utils/audio';
import { FoamBubbles } from '../components/FoamBubbles';
import { getBasePoints, formatBeerTitle } from '../beers';
import { StarRating } from '../components/StarRating';
import type { PokedexEntry } from '../components/TrophyGrid';

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
  rating?: number;
}

interface PubViewProps {
  currentUserNick: string;
  posts: Post[];
  globalAvatars: Record<string, string>;
  globalDisplayNames?: Record<string, string>;
  myFriendsList: string[];
  isAdminUser: boolean;
  myPokedex?: Record<string, PokedexEntry>;
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
  myPokedex,
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
          <div style="display:flex; align-items:center; justify-content:center; position:relative; width:160px; height:110px;">
              <!-- Impact Spark Flash -->
              <div class="clink-spark-flash"></div>
              
              <!-- Left Beer Mug -->
              <div class="cin-mug left-mug">
                  <svg viewBox="0 0 100 110" width="85" height="95">
                      <path d="M 28 35 C 10 35 10 75 28 75" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>
                      <path d="M 28 35 C 10 35 10 75 28 75" fill="none" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
                      <path d="M 30 26 L 76 26 C 82 26 80 84 74 84 L 32 84 C 26 84 24 26 30 26 Z" fill="rgba(255, 255, 255, 0.22)" stroke="#FFFFFF" stroke-width="3.5"/>
                      <path d="M 32 40 L 74 40 C 77 40 76 81 72 81 L 34 81 C 30 81 29 40 32 40 Z" fill="#F59E0B"/>
                      <path d="M 25 28 C 25 14 42 10 52 18 C 62 10 78 14 78 28 C 78 32 25 32 25 28 Z" fill="#FFFFFF"/>
                      <rect x="42" y="44" width="6" height="30" rx="3" fill="#FDE68A" opacity="0.8"/>
                      <rect x="54" y="44" width="6" height="30" rx="3" fill="#FDE68A" opacity="0.8"/>
                      <rect x="66" y="44" width="6" height="30" rx="3" fill="#FDE68A" opacity="0.8"/>
                  </svg>
              </div>
              
              <!-- Right Beer Mug -->
              <div class="cin-mug right-mug">
                  <svg viewBox="0 0 100 110" width="85" height="95">
                      <path d="M 72 35 C 90 35 90 75 72 75" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>
                      <path d="M 72 35 C 90 35 90 75 72 75" fill="none" stroke="#E2E8F0" stroke-width="3" stroke-linecap="round"/>
                      <path d="M 70 26 L 24 26 C 18 26 20 84 26 84 L 68 84 C 74 84 76 26 70 26 Z" fill="rgba(255, 255, 255, 0.22)" stroke="#FFFFFF" stroke-width="3.5"/>
                      <path d="M 68 40 L 26 40 C 23 40 24 81 28 81 L 66 81 C 70 81 71 40 68 40 Z" fill="#F59E0B"/>
                      <path d="M 75 28 C 75 14 58 10 48 18 C 38 10 22 14 22 28 C 22 32 75 32 75 28 Z" fill="#FFFFFF"/>
                      <rect x="52" y="44" width="6" height="30" rx="3" fill="#FDE68A" opacity="0.8"/>
                      <rect x="40" y="44" width="6" height="30" rx="3" fill="#FDE68A" opacity="0.8"/>
                      <rect x="28" y="44" width="6" height="30" rx="3" fill="#FDE68A" opacity="0.8"/>
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
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary-dark)' }}>sports_bar</span>
          <h1 style={{ fontSize: '36px', margin: 0, fontWeight: 800 }}>Pub</h1>
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
                  ha sbloccato la 🍺 <strong className="beer-highlight">{formatBeerTitle(post.brand)}</strong> ({formatBeerTitle(post.variant)})
                </>
              );

              if (post.isShared && post.taggedFriend) {
                actionText = (
                  <>
                    sta bevendo una 🍻 <strong className="beer-highlight">{formatBeerTitle(post.brand)}</strong> ({formatBeerTitle(post.variant)}) con{' '}
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
              const effectiveRating = post.rating || (post.user === currentUserNick ? myPokedex?.[`${post.brand}-${post.variant}`]?.rating : 0) || 0;

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
                          {globalDisplayNames?.[post.user] || post.user}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {pointsBadge}
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
                  </div>

                  <div className="post-image-container" style={{ position: 'relative', overflow: 'hidden', width: '100%', display: 'block' }}>
                    {effectiveRating > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(8px)',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          zIndex: 5,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <StarRating
                          rating={effectiveRating}
                          readOnly
                          size={13}
                        />
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFB300', marginLeft: '2px' }}>
                          {effectiveRating.toFixed(1)}
                        </span>
                      </div>
                    )}
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

                    <div className="post-time" style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {timeStr}
                      {post.isShiny && (
                        <span style={{ color: 'var(--primary-dark)', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '4px', fontWeight: 'bold' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                            auto_awesome
                          </span>{' '}
                          Shiny!
                        </span>
                      )}
                    </div>
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
