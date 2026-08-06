import React, { useState, useRef, useEffect } from 'react';
import { playPopSound, playClinkSound } from '../utils/audio';

export interface StoryFilter {
  id: string;
  name: string;
  icon: string;
  cssFilter: string;
}

export const INSTA_FILTERS: StoryFilter[] = [
  { id: 'normal', name: 'Normale', icon: 'auto_awesome', cssFilter: 'none' },
  { id: 'sunset', name: 'Tramonto', icon: 'wb_twilight', cssFilter: 'sepia(0.35) contrast(1.15) saturate(1.4) hue-rotate(-10deg)' },
  { id: 'vintage', name: 'Vintage', icon: 'camera_roll', cssFilter: 'sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.85)' },
  { id: 'cyber', name: 'Cyber Neon', icon: 'bolt', cssFilter: 'contrast(1.25) saturate(1.8) hue-rotate(180deg)' },
  { id: 'bw', name: 'B&W Retrò', icon: 'filter_b_and_w', cssFilter: 'grayscale(1) contrast(1.2) brightness(0.95)' },
  { id: 'golden', name: 'Luce Dorata', icon: 'sports_bar', cssFilter: 'sepia(0.4) saturate(1.6) contrast(1.1) brightness(1.05)' },
  { id: 'emerald', name: 'Smeraldo', icon: 'eco', cssFilter: 'contrast(1.15) saturate(1.3) hue-rotate(90deg)' },
];

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  icon: string;
  url: string;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'none', title: 'Nessuna Musica', artist: 'Silenzio', icon: 'music_off', url: '' },
  { id: 'brindisi', title: 'Festa al Bancone 🍻', artist: 'Pub Vibe', icon: 'sports_bar', url: '/sounds/brindisi.mp3' },
  { id: 'rock', title: 'Rock in Pub 🎸', artist: 'Live Band', icon: 'music_note', url: '/sounds/stappo.mp3' },
  { id: 'cheers', title: 'Cin Cin Vibes 🥂', artist: 'Beerdex Beats', icon: 'celebration', url: '/sounds/brindisi.mp4' },
];

interface StoryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishStory: (storyData: {
    mediaUrl: string;
    isVideo: boolean;
    filterId: string;
    overlayText: string;
    textColor: string;
    textStyle: string;
    musicTrackId: string;
    musicTitle: string;
  }) => void;
}

export const StoryEditorModal: React.FC<StoryEditorModalProps> = ({
  isOpen,
  onClose,
  onPublishStory,
}) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [overlayText, setOverlayText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textStyle, setTextStyle] = useState<'badge' | 'plain' | 'neon'>('badge');
  const [selectedMusic, setSelectedMusic] = useState<string>('none');
  const [activeTab, setActiveTab] = useState<'filter' | 'text' | 'music'>('filter');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setMediaUrl(null);
      setIsVideo(false);
      setSelectedFilter('normal');
      setOverlayText('');
      setSelectedMusic('none');
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    }
  }, [isOpen]);

  // Handle Music Audio Preview
  const handleSelectMusic = (trackId: string) => {
    setSelectedMusic(trackId);
    const track = MUSIC_TRACKS.find((t) => t.id === trackId);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    if (track && track.url) {
      audioPreviewRef.current = new Audio(track.url);
      audioPreviewRef.current.volume = 0.7;
      audioPreviewRef.current.play().catch(() => {});
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileIsVideo = file.type.startsWith('video/');
    setIsVideo(fileIsVideo);

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setMediaUrl(ev.target.result as string);
        playPopSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const currentFilterCss = INSTA_FILTERS.find((f) => f.id === selectedFilter)?.cssFilter || 'none';

  const handlePublish = () => {
    if (!mediaUrl) return;
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    const musicTrack = MUSIC_TRACKS.find((t) => t.id === selectedMusic);
    playClinkSound();
    onPublishStory({
      mediaUrl,
      isVideo,
      filterId: selectedFilter,
      overlayText: overlayText.trim(),
      textColor,
      textStyle,
      musicTrackId: selectedMusic,
      musicTitle: musicTrack && musicTrack.id !== 'none' ? musicTrack.title : '',
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <button
          onClick={() => {
            if (audioPreviewRef.current) audioPreviewRef.current.pause();
            onClose();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="material-symbols-outlined" style={{ color: '#F59E0B' }}>auto_awesome</span>
          Crea Storia Pub
        </div>

        {mediaUrl ? (
          <button
            onClick={handlePublish}
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Pubblica</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
          </button>
        ) : (
          <div style={{ width: '40px' }} />
        )}
      </div>

      {/* Main Canvas / Media Picker Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '58vh',
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#020617',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!mediaUrl ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>photo_camera_front</span>
            </div>
            <h3 style={{ color: '#FFFFFF', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>Scatta Foto o Carica Video</h3>
            <p style={{ color: '#94A3B8', margin: '0 0 20px 0', fontSize: '13px', lineHeight: '1.5' }}>
              Condividi momenti al bancone con filtri, testo e musica in tempo reale per 24 ore nel Pub! 🍺
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#FFFFFF',
                color: '#0F172A',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(255,255,255,0.2)',
              }}
            >
              <span className="material-symbols-outlined">add_a_photo</span>
              Scegli Foto o Video
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <>
            {isVideo ? (
              <video
                src={mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: currentFilterCss,
                  transition: 'filter 0.3s ease',
                }}
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Anteprima storia"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: currentFilterCss,
                  transition: 'filter 0.3s ease',
                }}
              />
            )}

            {/* Overlay Text Layer */}
            {overlayText && (
              <div
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '85%',
                  textAlign: 'center',
                  padding: textStyle === 'badge' ? '8px 16px' : '4px 8px',
                  borderRadius: textStyle === 'badge' ? '14px' : '0',
                  background: textStyle === 'badge' ? 'rgba(0, 0, 0, 0.65)' : 'transparent',
                  backdropFilter: textStyle === 'badge' ? 'blur(8px)' : 'none',
                  color: textColor,
                  fontSize: '22px',
                  fontWeight: 900,
                  textShadow: textStyle === 'neon' ? `0 0 12px ${textColor}, 0 0 20px ${textColor}` : '0 2px 8px rgba(0,0,0,0.8)',
                  zIndex: 20,
                  wordBreak: 'break-word',
                  fontFamily: 'inherit',
                }}
              >
                {overlayText}
              </div>
            )}

            {/* Selected Music Badge */}
            {selectedMusic !== 'none' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(10px)',
                  color: '#FDE047',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(253, 224, 71, 0.4)',
                  zIndex: 20,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 4s linear infinite' }}>music_note</span>
                <span>{MUSIC_TRACKS.find((m) => m.id === selectedMusic)?.title}</span>
              </div>
            )}

            {/* Retake Media Button */}
            <button
              onClick={() => {
                setMediaUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              title="Cambia Foto/Video"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#FFFFFF',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 25,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>
            </button>
          </>
        )}
      </div>

      {/* Editing Toolbar & Tools (Only visible after media is loaded) */}
      {mediaUrl && (
        <div style={{ width: '100%', maxWidth: '480px', marginTop: '14px' }}>
          {/* Studio Navigation Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setActiveTab('filter')}
              style={{
                background: activeTab === 'filter' ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
              Filtri ({INSTA_FILTERS.find(f => f.id === selectedFilter)?.name})
            </button>

            <button
              onClick={() => setActiveTab('text')}
              style={{
                background: activeTab === 'text' ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>title</span>
              Testo
            </button>

            <button
              onClick={() => setActiveTab('music')}
              style={{
                background: activeTab === 'music' ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>music_note</span>
              Musica
            </button>
          </div>

          {/* TAB 1: FILTERS CAROUSEL */}
          {activeTab === 'filter' && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                padding: '4px 2px 8px 2px',
                touchAction: 'pan-x',
              }}
            >
              {INSTA_FILTERS.map((f) => {
                const isSelected = selectedFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    style={{
                      flexShrink: 0,
                      background: isSelected ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(255, 255, 255, 0.1)',
                      border: isSelected ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                      color: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '8px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: isSelected ? 900 : 600,
                      boxShadow: isSelected ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{f.icon}</span>
                    <span>{f.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: TEXT OVERLAY TOOL */}
          {activeTab === 'text' && (
            <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <input
                type="text"
                placeholder="Scrivi una didascalia sulla storia..."
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '10px',
                  fontFamily: 'inherit',
                }}
              />

              {/* Color & Style Palette */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {['#FFFFFF', '#FDE047', '#000000', '#EC4899', '#EF4444', '#10B981', '#3B82F6'].map((color) => (
                    <div
                      key={color}
                      onClick={() => setTextColor(color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: color,
                        border: textColor === color ? '2.5px solid #FFFFFF' : '1.5px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        boxShadow: textColor === color ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setTextStyle('badge')}
                    style={{
                      background: textStyle === 'badge' ? '#F59E0B' : 'rgba(255,255,255,0.15)',
                      color: '#FFF',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Sfondo
                  </button>
                  <button
                    onClick={() => setTextStyle('neon')}
                    style={{
                      background: textStyle === 'neon' ? '#EC4899' : 'rgba(255,255,255,0.15)',
                      color: '#FFF',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Neon
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MUSIC TRACK PICKER */}
          {activeTab === 'music' && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 2px 8px 2px', touchAction: 'pan-x' }}>
              {MUSIC_TRACKS.map((t) => {
                const isSelected = selectedMusic === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectMusic(t.id)}
                    style={{
                      flexShrink: 0,
                      background: isSelected ? 'linear-gradient(135deg, #FDE047 0%, #F59E0B 100%)' : 'rgba(255, 255, 255, 0.1)',
                      border: isSelected ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                      color: isSelected ? '#0F172A' : '#FFFFFF',
                      borderRadius: '16px',
                      padding: '8px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: isSelected ? 900 : 600,
                      boxShadow: isSelected ? '0 4px 14px rgba(253, 224, 71, 0.4)' : 'none',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>
                    <span>{t.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
