import React, { useState, useMemo } from 'react';
import { playClinkSound } from '../utils/audio';
import { FoamBubbles } from '../components/FoamBubbles';
import { getBasePoints, formatBeerTitle } from '../beers';
import { StarRating } from '../components/StarRating';
import { BrindisiSummary } from '../components/BrindisiSummary';
import { PostOptionsMenuModal } from '../components/PostOptionsMenuModal';
import { ReportPostModal } from '../components/ReportPostModal';
import { StoryViewerModal } from '../components/StoryViewerModal';
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
  isStory?: boolean;
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
  allPokedexProfiles?: Record<string, Record<string, PokedexEntry>>;
  globalUserPrivacy?: Record<string, boolean>;
  onRateBeer?: (brand: string, variant: string, rating: number) => void;
  onToggleLike: (postId: string, cardElement: HTMLElement | null) => void;
  onDeletePost: (postId: string, postUser: string, brand: string, variant: string) => void;
  onReportFakePost: (postId: string, postUser: string, brand: string, variant: string) => void;
  onOpenPublicProfile: (username: string) => void;
  onOpenScanner?: () => void;
  onOpenStoryUpload?: () => void;
  onShareToStory?: (postId: string) => void;
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
  allPokedexProfiles,
  globalUserPrivacy,
  onRateBeer,
  onToggleLike,
  onDeletePost,
  onReportFakePost,
  onOpenPublicProfile,
  onOpenScanner,
  onOpenStoryUpload,
  onShareToStory,
  getAvatarZoomProps,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'friends' | 'me'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals & Interactive States
  const [selectedOptionsMenuPost, setSelectedOptionsMenuPost] = useState<Post | null>(null);
  const [selectedReportPost, setSelectedReportPost] = useState<Post | null>(null);
  const [selectedParticipantsPost, setSelectedParticipantsPost] = useState<Post | null>(null);
  const [activeStoryViewerIndex, setActiveStoryViewerIndex] = useState<number | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('beerdex_saved_posts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Toggle Save Post
  const handleToggleSavePost = (postId: string) => {
    setSavedPostIds((prev) => {
      const isAlreadySaved = prev.includes(postId);
      const updated = isAlreadySaved ? prev.filter((id) => id !== postId) : [...prev, postId];
      try {
        localStorage.setItem('beerdex_saved_posts', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Base visible posts filter with DEDUPLICATION for shared drinking sessions (Excludes 24h Stories from main feed)
  const visiblePosts = useMemo(() => {
    const accessible = posts.filter((post) => {
      if (post.isStory) return false; // 24h stories only appear in top Story bar
      const isMine = post.user === currentUserNick;
      const isFriend = myFriendsList.includes(post.user);
      const isPostOwnerPrivate = globalUserPrivacy?.[post.user] === true;

      // Privacy Check: if post owner's profile is private, only friends, owner, or admin can view
      if (isPostOwnerPrivate && !isMine && !isFriend && !isAdminUser) {
        return false;
      }

      const canAccess = isMine || isFriend || isAdminUser;
      if (!canAccess) return false;

      if (activeFilter === 'friends' && !isFriend && !isMine) return false;
      if (activeFilter === 'me' && !isMine) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const brand = (post.brand || '').toLowerCase();
        const variant = (post.variant || '').toLowerCase();
        const user = (post.user || '').toLowerCase();
        const friend = (post.taggedFriend || '').toLowerCase();
        const dispName = (globalDisplayNames?.[post.user] || '').toLowerCase();
        const dispFriend = (post.taggedFriend ? globalDisplayNames?.[post.taggedFriend] || '' : '').toLowerCase();

        return (
          brand.includes(q) ||
          variant.includes(q) ||
          user.includes(q) ||
          friend.includes(q) ||
          dispName.includes(q) ||
          dispFriend.includes(q)
        );
      }

      return true;
    });

    // Deduplicate shared posts from the same drinking session (single joint post)
    const uniquePosts: typeof posts = [];
    const seenSessions = new Set<string>();

    accessible.forEach((post) => {
      let participants: string[] = [post.user];
      if (Array.isArray((post as any).taggedFriends)) {
        participants.push(...(post as any).taggedFriends.filter(Boolean));
      } else if (post.taggedFriend) {
        participants.push(...post.taggedFriend.split(',').map((s) => s.trim()).filter(Boolean));
      }
      participants = Array.from(new Set(participants)).sort();

      if (post.isShared || participants.length > 1) {
        const timeGroup = Math.floor(post.time / (10 * 60 * 1000));
        const sessionKey = `${participants.join('::')}::${post.brand}::${post.variant}::${timeGroup}`;
        const photoKey = post.photo ? `${participants.join('::')}::${post.photo}` : '';

        if (seenSessions.has(sessionKey) || (photoKey && seenSessions.has(photoKey))) {
          return; // Skip duplicate post for the same shared session
        }
        seenSessions.add(sessionKey);
        if (photoKey) seenSessions.add(photoKey);
      }
      uniquePosts.push(post);
    });

    return uniquePosts;
  }, [posts, currentUserNick, myFriendsList, isAdminUser, activeFilter, searchQuery, globalDisplayNames, globalUserPrivacy]);

  // Active 24h Stories
  const storyPosts = useMemo(() => {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const accessibleAll = posts.filter((p) => {
      const isMine = p.user === currentUserNick;
      const isFriend = myFriendsList.includes(p.user);
      return (isMine || isFriend || isAdminUser) && p.time >= twentyFourHoursAgo;
    });

    const explicitStories = accessibleAll.filter((p) => p.isStory);
    const pool = explicitStories.length > 0 ? explicitStories : accessibleAll;

    const userStoryMap = new Map<string, Post>();
    pool.forEach((p) => {
      if (!userStoryMap.has(p.user) || p.time > userStoryMap.get(p.user)!.time) {
        userStoryMap.set(p.user, p);
      }
    });

    return Array.from(userStoryMap.values());
  }, [posts, currentUserNick, myFriendsList, isAdminUser]);

  // Statistics for Pub Header
  const totalToastCount = useMemo(() => {
    return posts.reduce((sum, p) => sum + (p.likes ? Object.keys(p.likes).length : 0), 0);
  }, [posts]);

  const triggerCinAnimation = (targetContainer: HTMLElement) => {
    if (!targetContainer) return;
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
    
    const post = posts.find((p) => p.postId === postId);
    const isLiked = post?.likes && post.likes[currentUserNick];
    if (!isLiked) {
      onToggleLike(postId, imgContainer);
    }
  };

  return (
    <div className="page-container-view" style={{ paddingBottom: '40px' }}>
      {/* Pub Hero Banner - Identico a Esplora */}
      <header
        className="hero"
        style={{
          position: 'relative',
          padding: '28px 20px 24px 20px',
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          color: '#1E293B',
          borderRadius: '0 0 24px 24px',
          borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
          boxShadow: '0 8px 25px rgba(245, 158, 11, 0.1)',
          overflow: 'hidden',
        }}
      >
        <FoamBubbles />

        {/* Ambient Amber Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#FFFFFF' }}>
                sports_bar
              </span>
            </div>
            <h1 style={{ fontSize: '32px', margin: 0, fontWeight: 900, letterSpacing: '-0.5px', color: '#1E293B' }}>
              Il Pub
            </h1>
          </div>

          <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
            Il bancone virtuale dove festeggiare e brindare con i tuoi amici.
          </p>

          {/* Stat Counter Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              padding: '6px 18px',
              borderRadius: '30px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>sports_bar</span>
              {totalToastCount} Brindisi al Bancone
            </span>
          </div>
        </div>
      </header>

      {/* 24h Instagram-style Stories Carousel Bar */}
      <div style={{ maxWidth: '640px', margin: '16px auto 0 auto', padding: '0 16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#F59E0B' }}>auto_awesome</span>
          STORIE DEL PUB
        </div>
        <div
          style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            padding: '4px 2px 10px 2px',
            touchAction: 'pan-x',
            overscrollBehaviorX: 'contain',
          }}
        >
          {/* 1st Story Item: My Story / Create Story with Camera Badge */}
          {(() => {
            const myAvatar = globalAvatars[currentUserNick];
            const myStoryIdx = storyPosts.findIndex((s) => s.user === currentUserNick);
            const hasMyStory = myStoryIdx !== -1;

            return (
              <div
                onClick={() => {
                  if (hasMyStory) {
                    setActiveStoryViewerIndex(myStoryIdx);
                  } else if (onOpenStoryUpload) {
                    onOpenStoryUpload();
                  } else if (onOpenScanner) {
                    onOpenScanner();
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    padding: '3px',
                    background: hasMyStory
                      ? 'linear-gradient(45deg, #F59E0B, #E67E22, #EC4899)'
                      : '#CBD5E1',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {myAvatar ? (
                      <img src={myAvatar} alt="La tua storia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#64748B' }}>person</span>
                    )}
                  </div>

                  {/* Camera Badge to Add Story */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenStoryUpload) {
                        onOpenStoryUpload();
                      } else if (onOpenScanner) {
                        onOpenScanner();
                      }
                    }}
                    title="Aggiungi una Storia (Scatta foto)"
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #FFFFFF',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', fontWeight: 900 }}>
                      photo_camera
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#0F172A',
                    marginTop: '4px',
                    maxWidth: '64px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  La tua storia
                </span>
              </div>
            );
          })()}

          {/* Other Friends' Stories */}
          {storyPosts
            .filter((s) => s.user !== currentUserNick)
            .map((story) => {
              const idx = storyPosts.findIndex((p) => p.postId === story.postId);
              const av = globalAvatars[story.user];
              const disp = globalDisplayNames?.[story.user] || story.user;
              return (
                <div
                  key={story.postId}
                  onClick={() => setActiveStoryViewerIndex(idx)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      padding: '3px',
                      background: 'linear-gradient(45deg, #F59E0B, #E67E22, #EC4899)',
                      boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#FFFFFF',
                        border: '2px solid #FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {av ? (
                        <img src={av} alt={disp} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#64748B' }}>person</span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#334155',
                      marginTop: '4px',
                      maxWidth: '64px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {disp}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Filter Tabs & Search Control Bar */}
      <div style={{ maxWidth: '640px', margin: '12px auto 0 auto', padding: '0 16px' }}>
        {/* Search Bar */}
        <div
          style={{
            position: 'relative',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '14px',
              color: '#94A3B8',
              fontSize: '20px',
              pointerEvents: 'none',
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Cerca birra, marca o amico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 38px 10px 42px',
              fontSize: '13px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
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

        {/* Filter Pills with touch-action: pan-x to lock vertical page scrolling */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            touchAction: 'pan-x',
            overscrollBehaviorX: 'contain',
          }}
        >
          <button
            className={`pub-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: activeFilter === 'all' ? 'none' : '1px solid #E2E8F0',
              background: activeFilter === 'all' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#FFFFFF',
              color: activeFilter === 'all' ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeFilter === 'all' ? '0 3px 10px rgba(245, 158, 11, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>dynamic_feed</span>
            Tutti i Brindisi ({posts.length})
          </button>

          <button
            className={`pub-filter-pill ${activeFilter === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveFilter('friends')}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: activeFilter === 'friends' ? 'none' : '1px solid #E2E8F0',
              background: activeFilter === 'friends' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#FFFFFF',
              color: activeFilter === 'friends' ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeFilter === 'friends' ? '0 3px 10px rgba(245, 158, 11, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>group</span>
            Amici
          </button>

          <button
            className={`pub-filter-pill ${activeFilter === 'me' ? 'active' : ''}`}
            onClick={() => setActiveFilter('me')}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: activeFilter === 'me' ? 'none' : '1px solid #E2E8F0',
              background: activeFilter === 'me' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#FFFFFF',
              color: activeFilter === 'me' ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeFilter === 'me' ? '0 3px 10px rgba(245, 158, 11, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>person</span>
            I Miei Post
          </button>
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="social-page-container" style={{ maxWidth: '640px', margin: '16px auto 0 auto' }}>
        <div className="social-feed">
          {visiblePosts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                background: '#FFFFFF',
                borderRadius: '24px',
                margin: '0 16px',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
                border: '1px solid #F1F5F9',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>sports_bar</span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>
                {searchQuery ? 'Nessun risultato trovato' : 'Nessun brindisi al bancone'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                {searchQuery
                  ? `Nessuna birra o amico corrisponde alla ricerca "${searchQuery}".`
                  : activeFilter === 'friends'
                  ? 'I tuoi amici non hanno ancora pubblicato brindisi. Aggiungi altri amici o sblocca tu una birra!'
                  : activeFilter === 'me'
                  ? 'Non hai ancora sbloccato nessuna birra. Vai a sbloccarne una con il codice a barre!'
                  : 'Il bancone del pub è momentaneamente vuoto. Sblocca la tua prima birra per inaugurare la bacheca!'}
              </p>
            </div>
          ) : (
            [...visiblePosts].reverse().map((post) => {
              const isSaved = savedPostIds.includes(post.postId);
              const user1 = post.user;
              const av1 = globalAvatars[user1];
              const disp1 = globalDisplayNames?.[user1] || user1;

              // Calculate points received upon unlocking
              const basePts = getBasePoints(post.brand, post.variant);
              let earnedPts = basePts;
              if (post.isShiny) earnedPts *= 2;

              const pointsBadge = (
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
              );

              const date = new Date(post.time);
              const timeStr = date.toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              const likesCount = post.likes ? Object.keys(post.likes).length : 0;
              const isLiked = post.likes && post.likes[currentUserNick];
              const authorPokedex = allPokedexProfiles?.[post.user] || (post.user === currentUserNick ? myPokedex : undefined);
              const effectiveRating =
                (typeof post.rating === 'number' && post.rating > 0 ? post.rating : 0) ||
                (authorPokedex?.[`${post.brand}-${post.variant}`]?.rating || 0);

              return (
                <div
                  key={post.postId}
                  className="post-card"
                  data-post-id={post.postId}
                  style={{
                    borderRadius: '20px',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                    marginBottom: '20px',
                    background: '#FFFFFF',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Card Header: Dual Avatars for Shared Drinks or Single Avatar */}
                  <div
                    className="post-header"
                    style={{
                      padding: '14px 16px',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
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
                                const pAv = globalAvatars[pNick];
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
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>
                                          person
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
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                padding: '2px',
                                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
                              }}
                              {...(getAvatarZoomProps ? getAvatarZoomProps(av1) : {})}
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
                                {av1 ? (
                                  <img
                                    src={av1}
                                    alt={user1}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onContextMenu={(e) => e.preventDefault()}
                                    draggable={false}
                                  />
                                ) : (
                                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#64748B' }}>
                                    person
                                  </span>
                                )}
                              </div>
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
                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
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
                                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                      {globalDisplayNames?.[allParticipants[0]] || allParticipants[0]}
                                    </strong>
                                    <span>,</span>
                                    <strong
                                      className="clickable-user"
                                      onClick={() => onOpenPublicProfile(allParticipants[1])}
                                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
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
                                        color: '#B45309',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                      }}
                                    >
                                      <span>e altri {allParticipants.length - 2}</span>
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                        expand_more
                                      </span>
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div
                                className="post-user clickable-user"
                                onClick={() => onOpenPublicProfile(user1)}
                                style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}
                              >
                                {disp1}
                              </div>
                            )}

                            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              {isShared ? 'Bevuta condivisa 🍻 • ' : ''}{timeStr}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 3-Dots Options Menu Button (more_vert) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelectedOptionsMenuPost(post);
                      }}
                      title="Opzioni Post"
                      style={{
                        background: '#F1F5F9',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#475569',
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 20,
                        WebkitTapHighlightColor: 'rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '22px', pointerEvents: 'none' }}>more_vert</span>
                    </button>
                  </div>

                  {/* Post Image Container */}
                  <div
                    className="post-image-container"
                    style={{ position: 'relative', overflow: 'hidden', width: '100%', display: 'block', background: '#0F172A' }}
                  >
                    {/* Shiny Ribbon Badge */}
                    {post.isShiny && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          zIndex: 5,
                          fontSize: '11px',
                          fontWeight: 900,
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
                        SHINY!
                      </div>
                    )}

                    {/* Star Rating Badge */}
                    {effectiveRating > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(15, 23, 42, 0.82)',
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
                    )}

                    <img
                      src={post.photo}
                      className="post-image"
                      alt="Beer Unlock"
                      onDoubleClick={(e) => handlePostDoubleTap(post.postId, e)}
                      onContextMenu={(e) => e.preventDefault()}
                      draggable={false}
                      style={{ display: 'block', width: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Actions Bar */}
                  <div
                    className="post-actions"
                    style={{
                      padding: '12px 16px 6px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
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
                        borderRadius: '20px',
                        padding: '8px 18px',
                        fontSize: '13px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: isLiked ? 'none' : '1px solid #E2E8F0',
                        background: isLiked ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#F8FAFC',
                        color: isLiked ? '#FFFFFF' : '#475569',
                        boxShadow: isLiked ? '0 4px 12px rgba(245, 158, 11, 0.35)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isLiked ? '#FFFFFF' : '#F59E0B' }}>
                        sports_bar
                      </span>
                      <span>Brindisi</span>
                      {likesCount > 0 && (
                        <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 900, marginLeft: '2px' }}>
                          ({likesCount})
                        </span>
                      )}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleSavePost(post.postId)}
                        title={isSaved ? 'Rimuovi dai Segnalibri' : 'Salva Post'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: isSaved ? '#F59E0B' : '#94A3B8',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                          {isSaved ? 'bookmark_added' : 'bookmark'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Likers Summary with Avatars */}
                  <BrindisiSummary
                    likes={post.likes}
                    currentUserNick={currentUserNick}
                    globalDisplayNames={globalDisplayNames}
                    globalAvatars={globalAvatars}
                    onOpenPublicProfile={onOpenPublicProfile}
                  />

                  {/* Clear Structural Card Division: Dedicated Beer Info Box & Caption */}
                  <div className="post-caption" style={{ padding: '0 16px 16px 16px' }}>
                    {(() => {
                      const allParticipants: string[] = Array.from(
                        new Set([
                          post.user,
                          ...(Array.isArray((post as any).taggedFriends) ? (post as any).taggedFriends.filter(Boolean) : []),
                          ...(post.taggedFriend ? post.taggedFriend.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                        ])
                      );

                      const participantRatings = allParticipants.map((partNick) => {
                        const name = globalDisplayNames?.[partNick] || partNick;
                        const postRating = (post as any).ratings && typeof (post as any).ratings[partNick] === 'number' ? (post as any).ratings[partNick] : 0;
                        const userPokedex = allPokedexProfiles?.[partNick] || (partNick === currentUserNick ? myPokedex : undefined);
                        const dexRating = userPokedex?.[`${post.brand}-${post.variant}`]?.rating || 0;
                        const fallbackRating = partNick === post.user && typeof post.rating === 'number' ? post.rating : 0;
                        const rating = postRating || dexRating || fallbackRating || 0;

                        return { user: partNick, name, rating };
                      });

                      const myParticipantRating = participantRatings.find((p) => p.user === currentUserNick);

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
                            {pointsBadge}
                          </div>

                          {/* Participants List - Perfectly Aligned */}
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

                          {/* Individual Participant Ratings */}
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
                                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
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

                            {/* Button for current user to rate/edit rating if participant */}
                            {allParticipants.includes(currentUserNick) && onRateBeer && (
                              <button
                                onClick={() => {
                                  onRateBeer(post.brand, post.variant, myParticipantRating?.rating || 0);
                                }}
                                style={{
                                  marginTop: '8px',
                                  width: '100%',
                                  padding: '7px 12px',
                                  borderRadius: '10px',
                                  border: '1px solid #FCD34D',
                                  background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                                  color: '#B45309',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.12)',
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#F59E0B' }}>
                                  star
                                </span>
                                {myParticipantRating?.rating ? 'Modifica la tua Valutazione' : 'Aggiungi la tua Valutazione ⭐'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3-Dots Options Menu Modal */}
      <PostOptionsMenuModal
        isOpen={Boolean(selectedOptionsMenuPost)}
        post={selectedOptionsMenuPost}
        currentUserNick={currentUserNick}
        isAdminUser={isAdminUser}
        isSaved={selectedOptionsMenuPost ? savedPostIds.includes(selectedOptionsMenuPost.postId) : false}
        onClose={() => setSelectedOptionsMenuPost(null)}
        onSavePost={(postId) => handleToggleSavePost(postId)}
        onShareToStory={(postId) => {
          if (onShareToStory) {
            onShareToStory(postId);
          } else {
            const idx = storyPosts.findIndex((s) => s.postId === postId);
            if (idx !== -1) {
              setActiveStoryViewerIndex(idx);
            } else {
              setActiveStoryViewerIndex(0);
            }
          }
        }}
        onOpenReportModal={(post) => setSelectedReportPost(post)}
        onDeletePost={onDeletePost}
      />

      {/* Report Post Modal with Reasons */}
      <ReportPostModal
        isOpen={Boolean(selectedReportPost)}
        post={selectedReportPost}
        onClose={() => setSelectedReportPost(null)}
        onSubmitReport={(postId, postUser, brand, variant) => {
          onReportFakePost(postId, postUser, brand, variant);
        }}
      />

      {/* 24h Instagram-style Fullscreen Story Viewer */}
      {activeStoryViewerIndex !== null && (
        <StoryViewerModal
          isOpen={activeStoryViewerIndex !== null}
          stories={storyPosts}
          initialIndex={activeStoryViewerIndex}
          currentUserNick={currentUserNick}
          globalAvatars={globalAvatars}
          globalDisplayNames={globalDisplayNames}
          allPokedexProfiles={allPokedexProfiles}
          onClose={() => setActiveStoryViewerIndex(null)}
          onToggleLike={onToggleLike}
          onOpenPublicProfile={onOpenPublicProfile}
        />
      )}

      {/* Participants Sheet / Tendina Modal */}
      {selectedParticipantsPost && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 29000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedParticipantsPost(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px',
              boxSizing: 'border-box',
              maxHeight: '80vh',
              overflowY: 'auto',
              animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '4px',
                background: '#CBD5E1',
                borderRadius: '2px',
                margin: '0 auto 16px auto',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🍻</span>
                <span>Partecipanti al Brindisi</span>
              </div>
              <button
                onClick={() => setSelectedParticipantsPost(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {(() => {
              const parts: string[] = Array.from(
                new Set([
                  selectedParticipantsPost.user,
                  ...(Array.isArray((selectedParticipantsPost as any).taggedFriends) ? (selectedParticipantsPost as any).taggedFriends.filter(Boolean) : []),
                  ...(selectedParticipantsPost.taggedFriend ? selectedParticipantsPost.taggedFriend.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                ])
              );

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {parts.map((pNick) => {
                    const av = globalAvatars[pNick];
                    const disp = globalDisplayNames?.[pNick] || pNick;
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
                          transition: 'background 0.15s ease',
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
                              <span className="material-symbols-outlined" style={{ color: '#64748B' }}>person</span>
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
        </div>
      )}
    </div>
  );
};
