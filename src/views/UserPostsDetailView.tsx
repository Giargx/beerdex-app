import React, { useEffect, useState } from 'react';
import { StarRating } from '../components/StarRating';
import { formatBeerTitle, getBasePoints, getUniqueParticipantPosts } from '../beers';
import { BrindisiSummary } from '../components/BrindisiSummary';
import { ReportPostModal } from '../components/ReportPostModal';
import { LikersBottomSheetModal } from '../components/LikersBottomSheetModal';

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
  allPokedexProfiles?: Record<string, Record<string, any>>;
  onDeletePost?: (postId: string, user: string, brand: string, variant: string) => void;
  onReportFakePost?: (postId: string, user: string, brand: string, variant: string) => void;
  onOpenPublicProfile: (username: string) => void;
  isAdminUser?: boolean;
  isPrivate?: boolean;
  isFriend?: boolean;
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
  allPokedexProfiles = {},
  onDeletePost,
  onReportFakePost,
  onOpenPublicProfile,
  isAdminUser,
  isPrivate = false,
  isFriend = false,
}) => {
  const [selectedReportPost, setSelectedReportPost] = useState<any>(null);
  const [selectedParticipantsPost, setSelectedParticipantsPost] = useState<any>(null);
  const [activeLikersPost, setActiveLikersPost] = useState<any>(null);
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('beerdex_saved_posts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleToggleSavePost = (postId: string) => {
    setSavedPostIds((prev) => {
      const next = prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId];
      try {
        localStorage.setItem('beerdex_saved_posts', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const safePosts = Array.isArray(posts) ? posts : [];
  const myPosts = username === '__SINGLE_POST__'
    ? safePosts.filter((p) => p && p.postId === initialPostId)
    : getUniqueParticipantPosts(safePosts, username).reverse();

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
          {username === '__SINGLE_POST__' ? 'Dettaglio Post' : `Post di ${displayName || username}`}
        </div>
        <div style={{ width: '36px' }} /> {/* Spacer for symmetry */}
      </div>

      {/* Main Content Area */}
      <div className="social-page-container" style={{ flexGrow: 1 }}>
        <div className="social-feed">
          {isPrivate && !isFriend && username.toLowerCase() !== currentUserNick.toLowerCase() && !isAdminUser && username !== '__SINGLE_POST__' ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '2px solid #FCD34D', color: '#D97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>lock</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>Profilo Privato</h3>
              <p style={{ margin: '0 auto', fontSize: '14px', color: '#64748B', maxWidth: '300px', lineHeight: '1.4' }}>
                I post e i dettagli di @{username} sono visibili solo ai suoi amici confermati.
              </p>
            </div>
          ) : myPosts.length === 0 ? (
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
                  {/* Card Header: Dual/Multi Avatars for Shared Drinks or Single Avatar */}
                  <div className="post-header" style={{ padding: '12px 16px' }}>
                    {(() => {
                      const allParticipants: string[] = Array.from(
                        new Set([
                          post.user,
                          ...(Array.isArray((post as any).taggedFriends) ? (post as any).taggedFriends.filter(Boolean) : []),
                          ...(post.taggedFriend ? post.taggedFriend.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                        ])
                      );

                      const isShared = allParticipants.length > 1;
                      const displayedAvatars = allParticipants.slice(0, 3);
                      const extraCount = allParticipants.length - 3;

                      return (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {isShared ? (
                            /* Multi-Participant Avatar Stack */
                            <div
                              onClick={() => {
                                if (allParticipants.length > 3) {
                                  setSelectedParticipantsPost(post);
                                } else {
                                  onOpenPublicProfile(allParticipants[0]);
                                }
                              }}
                              style={{
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center',
                                marginRight: '10px',
                                cursor: 'pointer',
                              }}
                            >
                              {displayedAvatars.map((pNick, idx) => {
                                const pAv = globalAvatars[pNick] || (pNick === username ? avatar : undefined);
                                return (
                                  <div
                                    key={pNick}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenPublicProfile(pNick);
                                    }}
                                    style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '50%',
                                      padding: '2px',
                                      background: idx === 0
                                        ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                                        : 'linear-gradient(135deg, #E67E22 0%, #D35400 100%)',
                                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                      marginLeft: idx > 0 ? '-12px' : '0',
                                      zIndex: 3 - idx,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        background: '#FFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {pAv ? (
                                        <img src={pAv} alt={pNick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#D97706', textTransform: 'uppercase' }}>
                                          {(globalDisplayNames?.[pNick] || pNick).charAt(0).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {extraCount > 0 && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedParticipantsPost(post);
                                  }}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#0F172A',
                                    color: '#FFFFFF',
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginLeft: '-10px',
                                    zIndex: 4,
                                    border: '2px solid #FFFFFF',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                  }}
                                >
                                  +{extraCount}
                                </div>
                              )}

                              {/* Joint Drink 🍻 Badge */}
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '-2px',
                                  right: '-6px',
                                  background: '#F59E0B',
                                  borderRadius: '50%',
                                  width: '16px',
                                  height: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                  zIndex: 5,
                                }}
                              >
                                🍻
                              </div>
                            </div>
                          ) : (
                            /* Single User Avatar */
                            <div
                              className="post-avatar clickable-user"
                              onClick={() => onOpenPublicProfile(post.user)}
                              style={{
                                cursor: 'pointer',
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
                                postUserDisplayName.charAt(0).toUpperCase()
                              )}
                            </div>
                          )}

                          <div style={{ marginLeft: '4px' }}>
                            {isShared ? (
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                {allParticipants.length <= 3 ? (
                                  allParticipants.map((pNick, idx) => (
                                    <React.Fragment key={pNick}>
                                      <strong
                                        className="clickable-user"
                                        onClick={() => onOpenPublicProfile(pNick)}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {globalDisplayNames?.[pNick] || pNick}
                                      </strong>
                                      {idx < allParticipants.length - 2 && <span>,</span>}
                                      {idx === allParticipants.length - 2 && <span style={{ color: '#D97706', fontWeight: 700 }}>e</span>}
                                    </React.Fragment>
                                  ))
                                ) : (
                                  <>
                                    <strong
                                      className="clickable-user"
                                      onClick={() => onOpenPublicProfile(allParticipants[0])}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {globalDisplayNames?.[allParticipants[0]] || allParticipants[0]}
                                    </strong>
                                    <span>,</span>
                                    <strong
                                      className="clickable-user"
                                      onClick={() => onOpenPublicProfile(allParticipants[1])}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {globalDisplayNames?.[allParticipants[1]] || allParticipants[1]}
                                    </strong>
                                    <button
                                      onClick={() => setSelectedParticipantsPost(post)}
                                      style={{
                                        background: 'rgba(245, 158, 11, 0.15)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '2px 8px',
                                        color: '#D97706',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      e altri {extraCount}
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div
                                className="clickable-user"
                                onClick={() => onOpenPublicProfile(post.user)}
                                style={{ fontWeight: 800, fontSize: '14px', color: 'var(--dark)', cursor: 'pointer' }}
                              >
                                {postUserDisplayName}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Trash Icon for My Post / Flag Icon for Other User's Post */}
                      {post.user === currentUserNick || isAdminUser ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (onDeletePost) onDeletePost(post.postId, post.user, post.brand, post.variant);
                          }}
                          title="Elimina Post"
                          style={{
                            background: '#FEF2F2',
                            border: '1px solid #FCA5A5',
                            cursor: 'pointer',
                            color: '#EF4444',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', pointerEvents: 'none' }}>
                            delete
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setSelectedReportPost(post);
                          }}
                          title="Segnala Post"
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            color: '#64748B',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', pointerEvents: 'none' }}>
                            flag
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Photo */}
                  <div className="post-image-container" style={{ position: 'relative', overflow: 'hidden', width: '100%', display: 'block', background: '#F8FAFC' }}>
                    {(() => {
                      const isPostShared = Boolean(
                        post.isShared ||
                        (post.taggedFriend && post.taggedFriend.trim() !== '') ||
                        (Array.isArray((post as any).taggedFriends) && (post as any).taggedFriends.filter(Boolean).length > 0)
                      );
                      const authorPokedex = allPokedexProfiles?.[post.user];
                      const effectiveRating =
                        (typeof post.rating === 'number' && post.rating > 0 ? post.rating : 0) ||
                        (authorPokedex?.[`${post.brand}-${post.variant}`]?.rating || 0);

                      if (effectiveRating <= 0 || isPostShared) return null;

                      return (
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
                          <StarRating rating={effectiveRating} readOnly size={13} />
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFB300', marginLeft: '2px' }}>
                            {effectiveRating.toFixed(1)}
                          </span>
                        </div>
                      );
                    })()}
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
                  <div className="post-actions" style={{ padding: '10px 16px 4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isLiked ? 'none' : '1px solid #CBD5E1',
                        background: isLiked ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : '#F8FAFC',
                        color: isLiked ? '#FFFFFF' : '#64748B',
                        boxShadow: isLiked ? '0 4px 14px rgba(245, 158, 11, 0.45)' : 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '22px',
                          color: isLiked ? '#FFFFFF' : '#F59E0B',
                          filter: isLiked ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' : 'none',
                        }}
                      >
                        sports_bar
                      </span>
                    </button>
                    
                    {/* Bookmark Button */}
                    <button
                      onClick={() => handleToggleSavePost(post.postId)}
                      title={savedPostIds.includes(post.postId) ? 'Rimuovi dai Segnalibri' : 'Salva Post'}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: savedPostIds.includes(post.postId) ? '#F59E0B' : '#94A3B8',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                        {savedPostIds.includes(post.postId) ? 'bookmark_added' : 'bookmark'}
                      </span>
                    </button>
                  </div>

                  {/* Brindisi Count underneath Like Icon - Click opens Likers Bottom Sheet ("tendina da sotto") */}
                  <div
                    onClick={() => setActiveLikersPost(post)}
                    style={{
                      padding: '2px 16px 6px 16px',
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--dark, #0F172A)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      width: 'fit-content',
                    }}
                    title="Vedi chi ha brindato"
                  >
                    <span>
                      {likesCount === 1 ? '1 brindisi' : `${likesCount} brindisi`}
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#94A3B8' }}>
                      keyboard_arrow_down
                    </span>
                  </div>

                  {/* Likers Summary */}
                  <div onClick={() => setActiveLikersPost(post)} style={{ cursor: 'pointer' }}>
                    <BrindisiSummary
                      likes={post.likes}
                      currentUserNick={currentUserNick}
                      globalDisplayNames={globalDisplayNames}
                      globalAvatars={globalAvatars}
                      onOpenPublicProfile={onOpenPublicProfile}
                    />
                  </div>

                  {/* Beer info detail banner & caption (matching PubView 1:1) */}
                  <div className="post-caption" style={{ padding: '0 16px 16px 16px' }}>
                    {(() => {
                      const allParticipants: string[] = Array.from(
                        new Set([
                          post.user,
                          ...(Array.isArray((post as any).taggedFriends) ? (post as any).taggedFriends.filter(Boolean) : []),
                          ...(post.taggedFriend ? post.taggedFriend.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                        ])
                      );

                      const isPostShared = Boolean(
                        post.isShared ||
                        (post.taggedFriend && post.taggedFriend.trim() !== '') ||
                        (Array.isArray((post as any).taggedFriends) && (post as any).taggedFriends.filter(Boolean).length > 0)
                      );

                      const participantRatings = allParticipants.map((partNick) => {
                        const name = globalDisplayNames?.[partNick] || partNick;
                        const postRating = (post as any).ratings && typeof (post as any).ratings[partNick] === 'number' ? (post as any).ratings[partNick] : 0;
                        const userPokedex = allPokedexProfiles?.[partNick];
                        const dexRating = userPokedex?.[`${post.brand}-${post.variant}`]?.rating || 0;
                        const fallbackRating = partNick === post.user && typeof post.rating === 'number' ? post.rating : 0;
                        const rating = postRating || dexRating || fallbackRating || 0;

                        return { user: partNick, name, rating };
                      });

                      return (
                        <div
                          style={{
                            background: '#FFFDF5',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            borderRadius: '16px',
                            padding: '12px 14px',
                            marginTop: '4px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '18px' }}>🍺</span>
                              <span>{formatBeerTitle(post.brand)}</span>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>({formatBeerTitle(post.variant)})</span>
                            </div>
                            <span
                              className="pts-tag"
                              style={{
                                color: 'white',
                                fontWeight: 800,
                                fontSize: '11px',
                                background: post.isShiny
                                  ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                                  : 'linear-gradient(135deg, #E67E22, #D35400)',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                boxShadow: '0 2px 6px rgba(230, 126, 34, 0.3)',
                                verticalAlign: 'middle',
                              }}
                            >
                              +{earnedPts} pt
                            </span>
                          </div>

                          {/* Participants List */}
                          {allParticipants.length > 1 && (
                            <div
                              style={{
                                fontSize: '12px',
                                color: '#78350F',
                                fontWeight: 700,
                                marginTop: '8px',
                                paddingTop: '8px',
                                borderTop: '1px dashed rgba(245, 158, 11, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '6px',
                              }}
                            >
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>
                                🍻 Bevuta condivisa con:
                              </span>
                              {allParticipants.map((partNick, idx) => (
                                <React.Fragment key={partNick}>
                                  <span
                                    className="clickable-user"
                                    onClick={() => onOpenPublicProfile(partNick)}
                                    style={{
                                      cursor: 'pointer',
                                      background: 'rgba(245, 158, 11, 0.15)',
                                      padding: '2px 8px',
                                      borderRadius: '10px',
                                      color: '#B45309',
                                      fontWeight: 800,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    @{globalDisplayNames?.[partNick] || partNick}
                                  </span>
                                  {idx < allParticipants.length - 1 && <span style={{ color: '#D97706' }}>•</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          )}

                          {/* Individual Participant Ratings (Only on Shared Posts) */}
                          {isPostShared && (
                            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(245, 158, 11, 0.2)' }}>
                              <div style={{ fontSize: '11px', fontWeight: 800, color: '#92400E', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
                                Valutazioni dei Partecipanti
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {participantRatings.map((pr) => (
                                  <div
                                    key={pr.user}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      fontSize: '12px',
                                      background: 'rgba(255, 255, 255, 0.85)',
                                      padding: '6px 10px',
                                      borderRadius: '10px',
                                      border: '1px solid rgba(245, 158, 11, 0.15)',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1E293B' }}>
                                      <span
                                        className="clickable-user"
                                        onClick={() => onOpenPublicProfile(pr.user)}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {pr.name}
                                      </span>
                                    </div>
                                    {pr.rating > 0 ? (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <StarRating rating={pr.rating} readOnly size={13} />
                                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#B45309' }}>
                                          {pr.rating.toFixed(1)}/5
                                        </span>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
                                        Non ancora votata
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Description */}
                    {post.description && (
                      <div style={{ fontSize: '13px', color: 'var(--dark)', lineHeight: 1.4, marginTop: '8px' }}>
                        <strong style={{ marginRight: '6px' }}>{globalDisplayNames[post.user] || post.user}</strong>
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



      {/* Report Post Modal */}
      <ReportPostModal
        isOpen={Boolean(selectedReportPost)}
        post={selectedReportPost}
        onClose={() => setSelectedReportPost(null)}
        onSubmitReport={(postId, postUser, brand, variant) => {
          if (onReportFakePost) {
            onReportFakePost(postId, postUser, brand, variant);
          }
        }}
      />

      {/* Participants List Modal */}
      {selectedParticipantsPost && (
        <div
          onClick={() => setSelectedParticipantsPost(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px 20px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>🍻</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
                  Partecipanti al Brindisi
                </h3>
              </div>
              <button
                onClick={() => setSelectedParticipantsPost(null)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {(() => {
              const allParticipants: string[] = Array.from(
                new Set([
                  selectedParticipantsPost.user,
                  ...(Array.isArray(selectedParticipantsPost.taggedFriends) ? selectedParticipantsPost.taggedFriends.filter(Boolean) : []),
                  ...(selectedParticipantsPost.taggedFriend ? selectedParticipantsPost.taggedFriend.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                ])
              );

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {allParticipants.map((pNick) => {
                    const disp = globalDisplayNames?.[pNick] || pNick;
                    const av = globalAvatars?.[pNick] || (pNick === username ? avatar : undefined);
                    const isAuthor = pNick === selectedParticipantsPost.user;

                    return (
                      <div
                        key={pNick}
                        onClick={() => {
                          setSelectedParticipantsPost(null);
                          onOpenPublicProfile(pNick);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '16px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: '#E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #FFFFFF',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            }}
                          >
                            {av ? (
                              <img src={av} alt={disp} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '18px', fontWeight: 900, color: '#334155', textTransform: 'uppercase' }}>
                                {disp.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{disp}</span>
                              {isAuthor && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                  }}
                                >
                                  Creatore
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>@{pNick}</div>
                          </div>
                        </div>

                        <span className="material-symbols-outlined" style={{ color: '#94A3B8', fontSize: '20px' }}>
                          chevron_right
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
        </div>
      )}

      {/* Likers Bottom Sheet Modal */}
      <LikersBottomSheetModal
        isOpen={!!activeLikersPost}
        onClose={() => setActiveLikersPost(null)}
        likes={activeLikersPost?.likes}
        globalDisplayNames={globalDisplayNames}
        globalAvatars={globalAvatars}
        onOpenPublicProfile={onOpenPublicProfile}
      />
    </div>
  );
};
