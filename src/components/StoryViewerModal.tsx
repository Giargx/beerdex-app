import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import { POPULAR_MUSIC_TRACKS } from './StoryEditorModal';
import { markStorySeen } from '../utils/stories';

const cleanUsername = (str?: string): string => {
  if (!str) return '';
  const trimmed = str.trim();
  if (trimmed.includes('@')) {
    return trimmed.split('@')[0];
  }
  return trimmed;
};

export interface StoryPost {
  postId: string;
  user: string;
  brand: string;
  variant: string;
  photo: string;
  time: number;
  isShiny: boolean;
  isStory?: boolean;
  isVideo?: boolean;
  mediaUrl?: string;
  filterId?: string;
  overlayText?: string;
  textColor?: string;
  textStyle?: string;
  musicTrackId?: string;
  musicTitle?: string;
  musicAudioUrl?: string;
  likes?: Record<string, boolean>;
  rating?: number;
}

interface StoryViewerModalProps {
  isOpen: boolean;
  stories: StoryPost[];
  initialIndex?: number;
  currentUserNick: string;
  globalAvatars?: Record<string, string>;
  globalDisplayNames?: Record<string, string>;
  allPokedexProfiles?: Record<string, Record<string, any>>;
  onClose: () => void;
  onToggleLike?: (postId: string, element: HTMLElement | null) => void;
  onOpenPublicProfile: (username: string) => void;
  onDeleteStory?: (postId: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  stories,
  initialIndex = 0,
  currentUserNick,
  globalAvatars = {},
  globalDisplayNames = {},
  allPokedexProfiles: _allPokedexProfiles = {},
  onClose,
  onToggleLike: _onToggleLike,
  onOpenPublicProfile,
  onDeleteStory,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showViewersModal, setShowViewersModal] = useState<boolean>(false);
  const [storyViewersMap, setStoryViewersMap] = useState<Record<string, number>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (stories.length === 0 && isOpen) {
      onClose();
    } else if (currentIndex >= stories.length && stories.length > 0) {
      setCurrentIndex(stories.length - 1);
    }
  }, [stories.length, currentIndex, isOpen, onClose]);

  // Calcola l'URL dell'audio per la storia corrente
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (isOpen && currentStory) {
      const sId = currentStory.postId || (currentStory as any).id || (currentStory as any).time;
      if (sId) {
        markStorySeen(String(sId));

        // Registra la visualizzazione nel Realtime DB
        if (currentUserNick) {
          set(ref(db, `pub_stories_views/${sId}/${currentUserNick}`), Date.now()).catch(() => {});
        }

        // Ascolta in tempo reale chi ha visto la storia
        const unsubscribe = onValue(ref(db, `pub_stories_views/${sId}`), (snap) => {
          setStoryViewersMap(snap.val() || {});
        });

        return () => unsubscribe();
      }
    } else {
      setStoryViewersMap({});
    }
  }, [isOpen, currentIndex, currentStory, currentUserNick]);

  let currentAudioUrl = '';

  if (currentStory) {
    if (currentStory.musicTrackId) {
      const foundTrack = POPULAR_MUSIC_TRACKS.find((t) => t.id === currentStory.musicTrackId);
      if (foundTrack) {
        currentAudioUrl = foundTrack.audioUrl;
      }
    }

    if (!currentAudioUrl && currentStory.musicAudioUrl) {
      if (
        currentStory.musicAudioUrl.includes('out-of-sight.mp3') ||
        currentStory.musicAudioUrl.includes('fight-club.mp3') ||
        currentStory.musicAudioUrl.includes('pixabay.com')
      ) {
        currentAudioUrl = POPULAR_MUSIC_TRACKS[0]?.audioUrl || '';
      } else {
        currentAudioUrl = currentStory.musicAudioUrl;
      }
    }

    if (!currentAudioUrl && (currentStory.musicTitle || currentStory.musicTrackId)) {
      currentAudioUrl = POPULAR_MUSIC_TRACKS[0]?.audioUrl || '';
    }
  }

  // Gestione Riproduzione Audio
  useEffect(() => {
    if (!isOpen || stories.length === 0 || !currentAudioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 1.0;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay audio in attesa di interazione utente:", err);
      });
    }
  }, [currentIndex, isOpen, currentAudioUrl, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 1.0;
    }
  }, [isMuted]);

  const tryPlayAudio = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(() => {});
    }
  };

  // Timer per la durata della storia: 15 SECONDI (15.000 ms)
  useEffect(() => {
    if (!isOpen || stories.length === 0 || isPaused || isFlipping) return;

    const STORY_DURATION_MS = 15000; // 15 secondi per storia
    const TICK_MS = 100;
    const INCREMENT = (TICK_MS / STORY_DURATION_MS) * 100; // ~0.6667% per tick

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            const currentS = stories[currentIndex];
            const nextS = stories[currentIndex + 1];
            const isDifferentUser =
              nextS && currentS && (nextS.user || '').toLowerCase() !== (currentS.user || '').toLowerCase();

            if (isDifferentUser) {
              setIsFlipping(true);
              setTimeout(() => {
                setCurrentIndex((idx) => idx + 1);
                setProgress(0);
                setTimeout(() => setIsFlipping(false), 220);
              }, 220);
            } else {
              setCurrentIndex((idx) => idx + 1);
              setProgress(0);
            }
            return 100;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + INCREMENT;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, stories, isPaused, isFlipping, onClose]);

  if (!isOpen || stories.length === 0) return null;
  if (!currentStory) return null;

  const avatar = globalAvatars[currentStory.user];
  const displayName = globalDisplayNames[currentStory.user] || currentStory.user;

  // Stories belonging to the current user in view
  const currentUserStories = stories.filter(
    (s) => (s.user || '').toLowerCase() === (currentStory.user || '').toLowerCase()
  );
  const userStoryIndex = currentUserStories.findIndex((s) => s.postId === currentStory.postId);

  const timeAgo = () => {
    const diff = Math.floor((Date.now() - currentStory.time) / 1000 / 60);
    if (diff < 60) return `${Math.max(1, diff)}m fa`;
    const hours = Math.floor(diff / 60);
    return `${hours}h fa`;
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      const nextStory = stories[currentIndex + 1];
      const isDifferentUser = nextStory && currentStory && (nextStory.user || '').toLowerCase() !== (currentStory.user || '').toLowerCase();

      if (isDifferentUser) {
        setIsFlipping(true);
        setTimeout(() => {
          setCurrentIndex((idx) => idx + 1);
          setProgress(0);
          setTimeout(() => setIsFlipping(false), 220);
        }, 220);
      } else {
        setCurrentIndex((idx) => idx + 1);
        setProgress(0);
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevStory = stories[currentIndex - 1];
      const isDifferentUser = prevStory && currentStory && (prevStory.user || '').toLowerCase() !== (currentStory.user || '').toLowerCase();

      if (isDifferentUser) {
        setIsFlipping(true);
        setTimeout(() => {
          setCurrentIndex((idx) => idx - 1);
          setProgress(0);
          setTimeout(() => setIsFlipping(false), 220);
        }, 220);
      } else {
        setCurrentIndex((idx) => idx - 1);
        setProgress(0);
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes storyMusicMarquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
      {currentAudioUrl && (
        <audio
          ref={audioRef}
          src={currentAudioUrl}
          loop
          preload="auto"
          playsInline
          onError={() => {
            if (audioRef.current && currentAudioUrl !== POPULAR_MUSIC_TRACKS[0]?.audioUrl) {
              audioRef.current.src = POPULAR_MUSIC_TRACKS[0]?.audioUrl || '';
              audioRef.current.play().catch(() => {});
            }
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          outline: 'none',
          perspective: '1000px',
        }}
        onMouseDown={() => {
          tryPlayAudio();
          setIsPaused(true);
        }}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => {
          tryPlayAudio();
          setIsPaused(true);
        }}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
            height: '100%',
            maxHeight: '840px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px',
            boxSizing: 'border-box',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
            transform: isFlipping ? 'rotateY(90deg) scale(0.88)' : 'rotateY(0deg) scale(1)',
            opacity: isFlipping ? 0.2 : 1,
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {/* Top Progress Bars (Filtered for Current User Stories) */}
          <div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
              {currentUserStories.map((s, idx) => {
                let width = '0%';
                if (idx < userStoryIndex) width = '100%';
                else if (idx === userStoryIndex) width = `${progress}%`;

                return (
                  <div
                    key={s.postId}
                    style={{
                      flex: 1,
                      height: '3px',
                      background: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width,
                        background: '#FFFFFF',
                        transition: idx === userStoryIndex ? 'width 0.1s linear' : 'none',
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Story Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                onClick={() => {
                  onClose();
                  onOpenPublicProfile(currentStory.user);
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    padding: '2px',
                    background: 'linear-gradient(45deg, #F59E0B, #E67E22, #EC4899)',
                    transform: isFlipping ? 'rotateY(180deg) scale(0.7)' : 'rotateY(0deg) scale(1)',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {avatar ? (
                      <img src={avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>person</span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 800 }}>
                    {displayName}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', fontWeight: 600 }}>
                    {timeAgo()}
                  </div>
                  {/* Minimal Scrolling Music Ticker in Header */}
                  {currentStory.musicTitle && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: '#FDE047',
                        fontSize: '10px',
                        fontWeight: 700,
                        marginTop: '3px',
                        maxWidth: '145px',
                        overflow: 'hidden',
                        background: 'rgba(0, 0, 0, 0.45)',
                        padding: '1px 6px',
                        borderRadius: '8px',
                        border: '1px solid rgba(253, 224, 71, 0.3)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#FDE047', flexShrink: 0 }}>
                        music_note
                      </span>
                      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                            paddingLeft: '100%',
                            animation: 'storyMusicMarquee 7s linear infinite',
                          }}
                        >
                          {currentStory.musicTitle}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(currentStory?.musicTitle || currentStory?.musicAudioUrl || currentStory?.musicTrackId) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    style={{
                      background: 'rgba(0, 0, 0, 0.45)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: isMuted ? '#94A3B8' : '#FDE047',
                      borderRadius: '50%',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    title={isMuted ? 'Attiva Audio' : 'Disattiva Audio'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {isMuted ? 'volume_off' : 'volume_up'}
                    </span>
                  </button>
                )}

                {currentStory && (currentStory.user || '').toLowerCase() === (currentUserNick || '').toLowerCase() && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPaused(true);
                        setShowViewersModal(true);
                      }}
                      style={{
                        background: 'rgba(0, 0, 0, 0.55)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        color: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '5px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      title="Chi ha visto la storia"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#F59E0B' }}>
                        visibility
                      </span>
                      <span>{Object.keys(storyViewersMap).length}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPaused(true);
                        if (window.confirm('Vuoi eliminare definitivamente questa storia?')) {
                          if (onDeleteStory) {
                            onDeleteStory(currentStory.postId);
                          }
                        }
                        setIsPaused(false);
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: '#FFFFFF',
                        borderRadius: '50%',
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      title="Elimina Storia"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        delete
                      </span>
                    </button>
                  </>
                )}

                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    close
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Center Story Image & Touch Nav Controls */}
          <div style={{ position: 'relative', flex: 1, margin: '12px 0 0 0', borderRadius: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent' }}>
            {/* Left Touch Area */}
            <div
              onClick={() => {
                tryPlayAudio();
                handlePrev();
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '35%',
                height: '100%',
                zIndex: 10,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            />
            {/* Right Touch Area */}
            <div
              onClick={() => {
                tryPlayAudio();
                handleNext();
              }}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '65%',
                height: '100%',
                zIndex: 10,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            />

            {/* Media Content (Photo or Video with Instagram Filter) */}
            {(() => {
              const mediaSrc = currentStory.mediaUrl || currentStory.photo;
              const filterCss = (() => {
                switch (currentStory.filterId) {
                  case 'sunset': return 'sepia(0.35) contrast(1.15) saturate(1.4) hue-rotate(-10deg)';
                  case 'vintage': return 'sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.85)';
                  case 'cyber': return 'contrast(1.25) saturate(1.8) hue-rotate(180deg)';
                  case 'bw': return 'grayscale(1) contrast(1.2) brightness(0.95)';
                  case 'golden': return 'sepia(0.4) saturate(1.6) contrast(1.1) brightness(1.05)';
                  case 'emerald': return 'contrast(1.15) saturate(1.3) hue-rotate(90deg)';
                  default: return 'none';
                }
              })();

              return (
                <>
                  {currentStory.isVideo ? (
                    <video
                      src={mediaSrc}
                      autoPlay
                      loop
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px', filter: filterCss }}
                    />
                  ) : (
                    <img
                      src={mediaSrc}
                      alt={currentStory.brand}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px', filter: filterCss }}
                    />
                  )}

                  {/* Overlay Text Layer */}
                  {currentStory.overlayText && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '42%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        maxWidth: '85%',
                        textAlign: 'center',
                        padding: currentStory.textStyle === 'badge' ? '8px 16px' : '4px 8px',
                        borderRadius: currentStory.textStyle === 'badge' ? '14px' : '0',
                        background: currentStory.textStyle === 'badge' ? 'rgba(0, 0, 0, 0.65)' : 'transparent',
                        backdropFilter: currentStory.textStyle === 'badge' ? 'blur(8px)' : 'none',
                        color: currentStory.textColor || '#FFFFFF',
                        fontSize: '22px',
                        fontWeight: 900,
                        textShadow: currentStory.textStyle === 'neon' ? `0 0 12px ${currentStory.textColor}, 0 0 20px ${currentStory.textColor}` : '0 2px 8px rgba(0,0,0,0.8)',
                        zIndex: 15,
                        wordBreak: 'break-word',
                      }}
                    >
                      {currentStory.overlayText}
                    </div>
                  )}
                </>
              );
            })()}

          {currentStory.isShiny && (
            <div
              style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#FFF',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 900,
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                zIndex: 15,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
              SHINY!
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Story Viewers Bottom Sheet Modal */}
    {showViewersModal && createPortal(
      <div
        onClick={() => {
          setShowViewersModal(false);
          setIsPaused(false);
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 9999999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          touchAction: 'none',
          pointerEvents: 'auto',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          style={{
            background: '#FFFFFF',
            borderRadius: '28px 28px 0 0',
            padding: '16px 20px calc(28px + env(safe-area-inset-bottom, 16px)) 20px',
            maxHeight: '75vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div style={{ width: '40px', height: '4px', background: '#CBD5E1', borderRadius: '4px', margin: '0 auto 14px auto' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#F59E0B' }}>
                visibility
              </span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
                Visualizzazioni storia ({Object.keys(storyViewersMap).length})
              </h3>
            </div>
            <button
              onClick={() => {
                setShowViewersModal(false);
                setIsPaused(false);
              }}
              type="button"
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>

          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', WebkitOverflowScrolling: 'touch' }}>
            {Object.keys(storyViewersMap).length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px', margin: '20px 0' }}>
                Nessuna visualizzazione ancora per questa storia.
              </p>
            ) : (
              Object.keys(storyViewersMap).map((viewerNick) => {
                const uKey = viewerNick.toLowerCase();
                const av = globalAvatars[viewerNick] || globalAvatars[uKey];
                const rawDisp = globalDisplayNames?.[viewerNick] || globalDisplayNames?.[uKey] || viewerNick;
                const disp = cleanUsername(rawDisp);
                const cleanNick = cleanUsername(viewerNick);

                return (
                  <div
                    key={viewerNick}
                    onClick={() => {
                      setShowViewersModal(false);
                      onClose();
                      onOpenPublicProfile(viewerNick);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      background: '#F8FAFC',
                      border: '1px solid #F1F5F9',
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
                          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontWeight: 900,
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        {av ? (
                          <img src={av} alt={disp} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          disp.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                          {disp}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                          @{cleanNick}
                        </div>
                      </div>
                    </div>

                    <span className="material-symbols-outlined" style={{ color: '#CBD5E1', fontSize: '20px' }}>
                      chevron_right
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
};
