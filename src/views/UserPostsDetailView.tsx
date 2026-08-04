import React, { useEffect } from 'react';
import { StarRating } from '../components/StarRating';
import { formatBeerTitle, getBasePoints } from '../beers';
import { BrindisiSummary } from '../components/BrindisiSummary';

interface UserPostsDetailViewProps {
  username: string;
  displayName: string;
  avatar: string | undefined;
  posts: any[];
  currentUserNick: string;
  onToggleLike: (postId: string, imageContainer: HTMLElement | null) => void;
  onBack: () => void;
  initialPostId: string;
  globalDisplayNames?: Record<string, string>;
  globalAvatars?: Record<string, string>;
  onDeletePost?: (postId: string, user: string, brand: string, variant: string) => void;
  onReportFakePost?: (postId: string, user: string, brand: string, variant: string) => void;
  onOpenPublicProfile: (username: string) => void;
  isAdminUser?: boolean;
}

export const UserPostsDetailView: React.FC<UserPostsDetailViewProps> = ({
  username,
  displayName,
  avatar,
  posts,
  currentUserNick,
  onToggleLike,
  onBack,
  initialPostId,
  globalDisplayNames = {},
  globalAvatars = {},
  onDeletePost,
  onReportFakePost,
  onOpenPublicProfile,
  isAdminUser,
}) => {
  const safePosts = Array.isArray(posts) ? posts : [];
  const myPosts = safePosts.filter((p) => p && p.user === username).reverse();

  useEffect(() => {
    if (initialPostId) {
      setTimeout(() => {
        const el = document.getElementById(`post-detail-${initialPostId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'center' });
        }
      }, 50);
    }
  }, [initialPostId]);

  // Support Toast Double Tap Like Animation
  const triggerCinAnimation = (container: HTMLElement) => {
    const exists = container.querySelector('.cin-toast-container');
    if (exists) return;

    const animDiv = document.createElement('div');
    animDiv.className = 'cin-toast-container';
    animDiv.innerHTML = `
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
          <div class="beer-splash-container">
              <div class="beer-drop drop-1"></div>
              <div class="beer-drop drop-2"></div>
              <div class="beer-drop drop-3"></div>
              <div class="beer-drop drop-4"></div>
          </div>
      </div>
    `;
    container.appendChild(animDiv);

    setTimeout(() => {
      animDiv.classList.add('fade-out');
      setTimeout(() => {
        animDiv.remove();
      }, 400);
    }, 1200);
  };

  const handlePostDoubleTap = (postId: string, e: React.MouseEvent<HTMLImageElement>) => {
    const card = e.currentTarget.closest('.post-card');
    const isLiked = posts.find(p => p.postId === postId)?.likes?.[currentUserNick];
    if (!isLiked && card) {
      const imgContainer = card.querySelector('.post-image-container') as HTMLElement;
      if (imgContainer) {
        triggerCinAnimation(imgContainer);
      }
      onToggleLike(postId, imgContainer);
    }
  };

  return (
    <div className="page-container-view" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--light)' }}>
      {/* Top Navbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--white)',
          borderBottom: '1px solid var(--gray)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--dark)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
            borderRadius: '50%'
          }}
          title="Indietro"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>arrow_back</span>
        </button>
        <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--dark)', textAlign: 'center' }}>
          Post di {displayName || username}
        </div>
        <div style={{ width: '36px' }} /> {/* Spacer for symmetry */}
      </div>

      {/* Main Content Area */}
      <div className="social-page-container" style={{ flexGrow: 1 }}>
        <div className="social-feed">
          {myPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '10px' }}>photo_camera</span>
              <p style={{ margin: 0, fontSize: '14px' }}>Nessun post trovato.</p>
            </div>
          ) : (
            myPosts.map((post) => {
              const postUserAvatar = globalAvatars[post.user] || avatar;
              const postUserDisplayName = globalDisplayNames[post.user] || displayName || post.user;
              const isLiked = post.likes && post.likes[currentUserNick];
              const likesCount = post.likes ? Object.keys(post.likes).length : 0;
              const dateStr = new Date(post.time).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              const canDelete = post.user === currentUserNick || isAdminUser;
              const canReport = post.user !== currentUserNick;

              const basePts = getBasePoints(post.brand, post.variant);
              let earnedPts = basePts;
              if (post.isShiny) earnedPts *= 2;

              return (
                <div
                  key={post.postId}
                  id={`post-detail-${post.postId}`}
                  className="post-card"
                  data-post-id={post.postId}
                  style={{ animation: 'fadeIn 0.2s ease-out' }}
                >
                  {/* Card Header */}
                  <div className="post-header" style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                       <div
                        className="post-avatar clickable-user"
                        onClick={() => onOpenPublicProfile(post.user)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: '2px solid var(--primary)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                          color: 'white',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          fontSize: '14px',
                          marginRight: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {postUserAvatar ? (
                          <img
                            src={postUserAvatar}
                            alt={post.user}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                          />
                        ) : (
                          post.user.substring(0, 2)
                        )}
                      </div>
                      <div>
                        <div 
                          className="clickable-user"
                          onClick={() => onOpenPublicProfile(post.user)}
                          style={{ fontWeight: 800, fontSize: '14px', color: 'var(--dark)', cursor: 'pointer' }}
                        >
                          {postUserDisplayName}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className="pts-tag"
                        style={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '11px',
                          background: '#e67e22',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        }}
                      >
                        +{earnedPts} pt
                      </span>
                      {canDelete && onDeletePost && (
                        <button
                          className="btn-delete"
                          onClick={() => onDeletePost(post.postId, post.user, post.brand, post.variant)}
                          title="Elimina post e punti"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Photo */}
                  <div className="post-image-container" style={{ position: 'relative', overflow: 'hidden', width: '100%', display: 'block', background: '#F8FAFC' }}>
                    {post.rating && post.rating > 0 ? (
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
                        <StarRating rating={post.rating} readOnly size={13} />
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFB300', marginLeft: '2px' }}>
                          {post.rating.toFixed(1)}
                        </span>
                      </div>
                    ) : null}
                    <img
                      src={post.photo}
                      className="post-image"
                      alt={`${post.brand} - ${post.variant}`}
                      onDoubleClick={(e) => handlePostDoubleTap(post.postId, e)}
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                    />
                  </div>

                  {/* Card Actions */}
                  <div className="post-actions" style={{ padding: '12px 16px 8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      className={`btn-like ${isLiked ? 'liked' : ''}`}
                      title={isLiked ? 'Rimuovi brindisi' : 'Brinda'}
                      onClick={(e) => {
                        const imgContainer = e.currentTarget.closest('.post-card')?.querySelector('.post-image-container') as HTMLElement;
                        if (!isLiked && imgContainer) {
                          triggerCinAnimation(imgContainer);
                        }
                        onToggleLike(post.postId, imgContainer);
                      }}
                      style={{
                        background: isLiked ? '#FFFBEB' : '#F8FAFC',
                        border: '1px solid ' + (isLiked ? 'var(--primary)' : 'var(--gray)'),
                        borderRadius: '20px',
                        padding: '6px 14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: isLiked ? 'var(--primary-dark)' : 'var(--text-muted)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        sports_bar
                      </span>{' '}
                      {likesCount}
                    </button>
                    
                    {canReport && onReportFakePost && (
                      <button
                        className="btn-report"
                        onClick={() => onReportFakePost(post.postId, post.user, post.brand, post.variant)}
                        title="Segnala Post"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>flag</span>
                      </button>
                    )}
                  </div>

                  <BrindisiSummary
                    likes={post.likes}
                    currentUserNick={currentUserNick}
                    globalDisplayNames={globalDisplayNames}
                    onOpenPublicProfile={onOpenPublicProfile}
                  />

                  {/* Beer info detail banner */}
                  <div style={{ padding: '0 16px 16px 16px' }}>
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid var(--gray)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--dark)' }}>
                          {formatBeerTitle(post.brand)}
                        </div>
                        <div
                          style={{
                            fontSize: '9px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            background:
                              post.rarity === 'rara'
                                ? '#FEE2E2'
                                : post.rarity === 'media'
                                ? '#FEF3C7'
                                : '#F1F5F9',
                            color:
                              post.rarity === 'rara'
                                ? '#991B1B'
                                : post.rarity === 'media'
                                ? '#92400E'
                                : '#475569',
                          }}
                        >
                          {post.rarity || 'comune'}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatBeerTitle(post.variant)}
                      </div>
                      {post.pubName && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            color: 'var(--primary-dark)',
                            marginTop: '6px',
                            fontWeight: '600'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                          {post.pubName}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {post.description && (
                      <div style={{ fontSize: '13px', color: 'var(--dark)', lineHeight: 1.4, marginTop: '6px' }}>
                        <strong style={{ marginRight: '6px' }}>{postUserDisplayName}</strong>
                        {post.description}
                      </div>
                    )}

                    <div className="post-time" style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {dateStr}
                      {post.isShiny && (
                        <span style={{ color: 'var(--primary-dark)', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '4px', fontWeight: 'bold' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
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
