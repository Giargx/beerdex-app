import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { getBasePoints, formatBeerTitle } from '../beers';

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
  onToggleLike: (postId: string, element: HTMLElement | null) => void;
  onOpenPublicProfile: (username: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  stories,
  initialIndex = 0,
  currentUserNick,
  globalAvatars = {},
  globalDisplayNames = {},
  allPokedexProfiles = {},
  onClose,
  onToggleLike,
  onOpenPublicProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen || stories.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2; // 50 steps = 2.5 seconds or 5 seconds timer
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, stories.length, isPaused, onClose]);

  if (!isOpen || stories.length === 0) return null;

  const currentStory = stories[currentIndex];
  if (!currentStory) return null;

  const avatar = globalAvatars[currentStory.user];
  const displayName = globalDisplayNames[currentStory.user] || currentStory.user;
  const isLiked = currentStory.likes && currentStory.likes[currentUserNick];
  const likesCount = currentStory.likes ? Object.keys(currentStory.likes).length : 0;
  const isStoryPost = currentStory.isStory || currentStory.brand === 'Storia del Pub';
  const earnedPts = isStoryPost ? 0 : (currentStory.isShiny ? getBasePoints(currentStory.brand, currentStory.variant) * 2 : getBasePoints(currentStory.brand, currentStory.variant));

  const timeAgo = () => {
    const diff = Math.floor((Date.now() - currentStory.time) / 1000 / 60);
    if (diff < 60) return `${Math.max(1, diff)}m fa`;
    const hours = Math.floor(diff / 60);
    return `${hours}h fa`;
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 26000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
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
        }}
      >
        {/* Top Progress Bars */}
        <div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {stories.map((s, idx) => {
              let width = '0%';
              if (idx < currentIndex) width = '100%';
              else if (idx === currentIndex) width = `${progress}%`;

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
                      transition: idx === currentIndex ? 'width 0.1s linear' : 'none',
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
              </div>
            </div>

            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>close</span>
            </button>
          </div>
        </div>

        {/* Center Story Image & Touch Nav Controls */}
        <div style={{ position: 'relative', flex: 1, margin: '16px 0', borderRadius: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Left Touch Area */}
          <div
            onClick={handlePrev}
            style={{ position: 'absolute', left: 0, top: 0, width: '35%', height: '100%', zIndex: 10, cursor: 'pointer' }}
          />
          {/* Right Touch Area */}
          <div
            onClick={handleNext}
            style={{ position: 'absolute', right: 0, top: 0, width: '65%', height: '100%', zIndex: 10, cursor: 'pointer' }}
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

                {/* Music Badge */}
                {currentStory.musicTitle && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(10px)',
                      color: '#FDE047',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: '1px solid rgba(253, 224, 71, 0.4)',
                      zIndex: 15,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>music_note</span>
                    <span>{currentStory.musicTitle}</span>
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

        {/* Bottom Story Footer Info & Interactive Brindisi */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '14px 16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            {currentStory.brand ? (
              <>
                <div style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 800 }}>
                  🍺 {formatBeerTitle(currentStory.brand || 'Storia del Pub')}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', fontWeight: 600 }}>
                  {isStoryPost ? 'Storia 24h' : formatBeerTitle(currentStory.variant)} • <span style={{ color: '#FDE047' }}>+{earnedPts} pt</span>
                </div>
              </>
            ) : (
              <div style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 800 }}>
                {(currentStory as any).caption || `Storia di ${displayName}`}
              </div>
            )}
            {currentStory.brand && (() => {
              const authorPokedex = allPokedexProfiles?.[currentStory.user];
              const effectiveRating =
                (typeof currentStory.rating === 'number' && currentStory.rating > 0 ? currentStory.rating : 0) ||
                (authorPokedex?.[`${currentStory.brand}-${currentStory.variant}`]?.rating || 0);

              if (effectiveRating <= 0) return null;

              return (
                <div style={{ marginTop: '4px' }}>
                  <StarRating rating={effectiveRating} readOnly size={12} />
                </div>
              );
            })()}
          </div>

          <button
            onClick={() => onToggleLike(currentStory.postId, null)}
            style={{
              borderRadius: '20px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: isLiked ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#FFFFFF',
              color: isLiked ? '#FFFFFF' : '#0F172A',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isLiked ? '#FFFFFF' : '#F59E0B' }}>
              sports_bar
            </span>
            Brindisi ({likesCount})
          </button>
        </div>
      </div>
    </div>
  );
};
