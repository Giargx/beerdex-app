import React, { useState, useRef, useEffect } from 'react';
import { playPopSound } from '../utils/audio';

export interface StoryFilter {
  id: string;
  name: string;
  icon: string;
  cssFilter: string;
}

export const INSTA_FILTERS: StoryFilter[] = [
  { id: 'normal', name: 'Normale', icon: 'auto_awesome', cssFilter: 'none' },
  { id: 'sunset', name: 'Tramonto', icon: 'wb_twilight', cssFilter: 'sepia(0.35) contrast(1.15) saturate(1.4) hue-rotate(-10deg)' },
  { id: 'vintage', name: 'Vintage 90s', icon: 'camera_roll', cssFilter: 'sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.85)' },
  { id: 'cyber', name: 'Cyber Neon', icon: 'bolt', cssFilter: 'contrast(1.25) saturate(1.8) hue-rotate(180deg)' },
  { id: 'bw', name: 'B&W Drama', icon: 'filter_b_and_w', cssFilter: 'grayscale(1) contrast(1.2) brightness(0.95)' },
  { id: 'golden', name: 'Birra Dorata', icon: 'sports_bar', cssFilter: 'sepia(0.4) saturate(1.6) contrast(1.1) brightness(1.05)' },
  { id: 'emerald', name: 'Freschezza', icon: 'eco', cssFilter: 'contrast(1.15) saturate(1.3) hue-rotate(90deg)' },
];

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
}

export const POPULAR_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track_1',
    title: 'Highway to Hell 🎸',
    artist: 'Pub Rock Vibe',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'track_2',
    title: 'Festa al Bancone 🍻',
    artist: 'Oktoberfest Party',
    coverUrl: 'https://images.unsplash.com/photo-1538488881523-2390740a6b7e?w=150&auto=format&fit=crop&q=80',
    audioUrl: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
  },
  {
    id: 'track_3',
    title: 'Summer Chill Sax 🎷',
    artist: 'Lounge Sunset Vibes',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'track_4',
    title: 'Deep Night Club 🎧',
    artist: 'Electronic House Beat',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
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
    musicAudioUrl: string;
  }) => void;
}

export const StoryEditorModal: React.FC<StoryEditorModalProps> = ({
  isOpen,
  onClose,
  onPublishStory,
}) => {
  // Media State
  const [capturedMediaUrl, setCapturedMediaUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // Instagram Story Tools State
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [showFiltersPicker, setShowFiltersPicker] = useState<boolean>(false);

  // Direct In-Canvas Text Editing State (No popup modal)
  const [overlayText, setOverlayText] = useState<string>('');
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textStyle, setTextStyle] = useState<'badge' | 'plain' | 'neon'>('badge');

  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState<boolean>(false);
  const [customAudioUrl, setCustomAudioUrl] = useState<string>('');

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleCameraTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    }
    lastTapRef.current = now;
  };

  // Initialize Live WebRTC Camera Stream
  useEffect(() => {
    if (isOpen && !capturedMediaUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, [isOpen, facingMode, capturedMediaUrl]);

  // Auto focus text input when text tool is activated
  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextInput]);

  const startCamera = async () => {
    stopCamera();
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
      } catch (_err) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
      try { localStorage.setItem('beerdex_camera_permission', 'always'); } catch {}
    } catch (e) {
      console.warn("Camera fallback to file upload:", e);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const captureLivePhoto = () => {
    playPopSound();
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 720;
    canvas.height = v.videoHeight || 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    stopCamera();
    setCapturedMediaUrl(dataUrl);
    setIsVideo(false);
  };

  const startVideoRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : MediaRecorder.isTypeSupported('video/mp4')
          ? 'video/mp4'
          : 'video/webm',
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);
        stopCamera();
        setCapturedMediaUrl(videoUrl);
        setIsVideo(true);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      setRecordingSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            stopVideoRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      console.error("Recording error:", e);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
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
        stopCamera();
        setCapturedMediaUrl(ev.target.result as string);
        playPopSound();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectMusic = (track: MusicTrack) => {
    setSelectedMusic(track);
    setShowMusicPicker(false);

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    if (track && track.audioUrl) {
      audioPreviewRef.current = new Audio(track.audioUrl);
      audioPreviewRef.current.volume = 0.8;
      audioPreviewRef.current.play().catch(() => {});
    }
  };

  const handleCustomAudioUrlAdd = () => {
    if (!customAudioUrl.trim()) return;
    const newTrack: MusicTrack = {
      id: `custom_${Date.now()}`,
      title: 'Traccia SoundCloud / Audio 🎵',
      artist: 'Custom Soundtrack',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
      audioUrl: customAudioUrl.trim(),
    };
    handleSelectMusic(newTrack);
  };

  const currentFilterCss = INSTA_FILTERS.find((f) => f.id === selectedFilter)?.cssFilter || 'none';

  const resetEditorState = () => {
    setCapturedMediaUrl(null);
    setIsVideo(false);
    setSelectedFilter('normal');
    setShowFiltersPicker(false);
    setOverlayText('');
    setShowTextInput(false);
    setSelectedMusic(null);
    setShowMusicPicker(false);
  };

  const handlePublish = () => {
    if (!capturedMediaUrl) return;
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    onPublishStory({
      mediaUrl: capturedMediaUrl,
      isVideo,
      filterId: selectedFilter,
      overlayText: overlayText.trim(),
      textColor,
      textStyle,
      musicTrackId: selectedMusic ? selectedMusic.id : '',
      musicTitle: selectedMusic ? selectedMusic.title : '',
      musicAudioUrl: selectedMusic ? selectedMusic.audioUrl : '',
    });
    resetEditorState();
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
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
        touchAction: 'none',
      }}
    >
      {/* 1. TOP INSTAGRAM OVERLAY TOOLBAR */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 'calc(env(safe-area-inset-top, 16px) + 8px) 18px 12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 300,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        {/* Top Left Close X */}
        <button
          onClick={() => {
            stopCamera();
            if (audioPreviewRef.current) audioPreviewRef.current.pause();
            resetEditorState();
            onClose();
          }}
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
        </button>

        {/* Studio Tools Bar */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {capturedMediaUrl && (
            /* AFTER PHOTO CAPTURE: SHOW EDITING TOOLS (Riscatta, Aa, Filtri, Musica) */
            <>
              {/* Tasto Riprova Foto/Video */}
              <button
                onClick={() => {
                  setCapturedMediaUrl(null);
                  setIsVideo(false);
                  startCamera();
                }}
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                }}
                title="Riprova foto/video"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>refresh</span>
              </button>

              {/* Text Overlay Tool (Aa) */}
              <button
                onClick={() => {
                  setShowTextInput(!showTextInput);
                  setShowFiltersPicker(false);
                  setShowMusicPicker(false);
                }}
                style={{
                  background: showTextInput ? '#F59E0B' : 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  fontWeight: 900,
                  fontSize: '16px',
                }}
              >
                Aa
              </button>

              {/* Instagram Filters Tool (✨) */}
              <button
                onClick={() => {
                  setShowFiltersPicker(!showFiltersPicker);
                  setShowTextInput(false);
                  setShowMusicPicker(false);
                }}
                style={{
                  background: showFiltersPicker ? '#F59E0B' : 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>auto_awesome</span>
              </button>

              {/* SoundCloud & Music Track Finder (🎵) */}
              <button
                onClick={() => {
                  setShowMusicPicker(!showMusicPicker);
                  setShowTextInput(false);
                  setShowFiltersPicker(false);
                }}
                style={{
                  background: selectedMusic ? '#FDE047' : 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: selectedMusic ? '#0F172A' : '#FFFFFF',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>music_note</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. MAIN VIEWFINDER & MEDIA CANVAS (Assicura 100% di copertura dello schermo senza lasciare spazi in alto) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {/* LIVE CAMERA VIEW (Sempre presente per scattare istantaneamente la foto) */}
        {!capturedMediaUrl && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onClick={handleCameraTap}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              filter: currentFilterCss,
              transition: 'filter 0.3s ease',
              cursor: 'pointer',
            }}
          />
        )}

        {/* CAPTURED PHOTO / VIDEO PREVIEW (Copre al 100% lo schermo da bordo a bordo) */}
        {capturedMediaUrl && (
          <>
            {isVideo ? (
              <video
                src={capturedMediaUrl}
                autoPlay
                loop
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: currentFilterCss,
                  transition: 'filter 0.3s ease',
                }}
              />
            ) : (
              <img
                src={capturedMediaUrl}
                alt="Anteprima storia"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: currentFilterCss,
                  transition: 'filter 0.3s ease',
                }}
              />
            )}
          </>
        )}

        {/* DIRECT IN-CANVAS TEXT EDITING (Nessun pop-up, scrivi direttamente sulla storia!) */}
        {showTextInput && (
          <>
            {/* Backdrop to dismiss text editing when tapping anywhere outside */}
            <div
              onClick={() => setShowTextInput(false)}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 130,
                background: 'rgba(0, 0, 0, 0.45)',
              }}
            />
            <textarea
              ref={textInputRef}
              placeholder="Scrivi sulla storia..."
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              rows={2}
              style={{
                position: 'absolute',
                top: '42%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '88%',
                textAlign: 'center',
                padding: textStyle === 'badge' ? '12px 20px' : '8px 12px',
                borderRadius: textStyle === 'badge' ? '16px' : '0',
                background: textStyle === 'badge' ? 'rgba(0, 0, 0, 0.75)' : 'transparent',
                backdropFilter: textStyle === 'badge' ? 'blur(10px)' : 'none',
                color: textColor,
                fontSize: '26px',
                fontWeight: 900,
                textShadow: textStyle === 'neon' ? `0 0 16px ${textColor}, 0 0 28px ${textColor}` : '0 2px 10px rgba(0,0,0,0.9)',
                zIndex: 140,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.2,
              }}
            />
          </>
        )}

        {!showTextInput && overlayText && (
          /* DISPLAY READONLY TEXT OVERLAY WHEN NOT EDITING */
          <div
            onClick={() => setShowTextInput(true)}
            style={{
              position: 'absolute',
              top: '42%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '88%',
              textAlign: 'center',
              padding: textStyle === 'badge' ? '10px 20px' : '6px 12px',
              borderRadius: textStyle === 'badge' ? '16px' : '0',
              background: textStyle === 'badge' ? 'rgba(0, 0, 0, 0.75)' : 'transparent',
              backdropFilter: textStyle === 'badge' ? 'blur(10px)' : 'none',
              color: textColor,
              fontSize: '26px',
              fontWeight: 900,
              textShadow: textStyle === 'neon' ? `0 0 16px ${textColor}, 0 0 28px ${textColor}` : '0 2px 10px rgba(0,0,0,0.9)',
              zIndex: 80,
              wordBreak: 'break-word',
              cursor: 'pointer',
            }}
          >
            {overlayText}
          </div>
        )}

        {/* FLOATING MUSIC BADGE OVERLAY */}
        {selectedMusic && (
          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '20px',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(12px)',
              color: '#FDE047',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(253, 224, 71, 0.4)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              zIndex: 80,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>music_note</span>
            <span>{selectedMusic.title} • {selectedMusic.artist}</span>
            <button
              onClick={() => {
                setSelectedMusic(null);
                if (audioPreviewRef.current) audioPreviewRef.current.pause();
              }}
              style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. INSTAGRAM OVERLAY TOOLS MODALS */}

      {/* DIRECT TEXT EDITING TOOLBAR IN BASSO TRASPARENTE */}
      {showTextInput && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '16px',
            right: '16px',
            zIndex: 150,
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '24px',
            padding: '14px 18px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Color Palette Row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
            {['#FFFFFF', '#FDE047', '#000000', '#EC4899', '#EF4444', '#10B981', '#3B82F6'].map((color) => (
              <div
                key={color}
                onClick={() => setTextColor(color)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: color,
                  border: textColor === color ? '3px solid #FFFFFF' : '1px solid rgba(255,255,255,0.4)',
                  boxShadow: textColor === color ? '0 0 10px rgba(255,255,255,0.8)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
          </div>

          {/* Style Pills & Done Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setTextStyle('badge')}
                style={{
                  background: textStyle === 'badge' ? '#F59E0B' : 'rgba(255,255,255,0.15)',
                  color: '#FFF',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Badge
              </button>
              <button
                onClick={() => setTextStyle('neon')}
                style={{
                  background: textStyle === 'neon' ? '#EC4899' : 'rgba(255,255,255,0.15)',
                  color: '#FFF',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Neon
              </button>
              <button
                onClick={() => setTextStyle('plain')}
                style={{
                  background: textStyle === 'plain' ? '#3B82F6' : 'rgba(255,255,255,0.15)',
                  color: '#FFF',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Semplice
              </button>
            </div>

            <button
              onClick={() => setShowTextInput(false)}
              style={{
                background: '#10B981',
                color: '#FFF',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Fatto</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
            </button>
          </div>
        </div>
      )}

      {/* FILTER CAROUSEL OVERLAY (Appare solo dopo aver scattato la foto/video e posizionato più in alto) */}
      {showFiltersPicker && capturedMediaUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '16px',
            right: '16px',
            zIndex: 250,
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            padding: '12px 16px',
            touchAction: 'pan-x',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            WebkitOverflowScrolling: 'touch',
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
                  borderRadius: '18px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 900 : 700,
                  boxShadow: isSelected ? '0 4px 16px rgba(245, 158, 11, 0.5)' : 'none',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{f.icon}</span>
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* SOUNDCLOUD & MUSIC SEARCH MODAL */}
      {showMusicPicker && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '65vh',
            zIndex: 160,
            background: 'rgba(15, 23, 42, 0.96)',
            backdropFilter: 'blur(20px)',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            padding: '20px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            overflowY: 'auto',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: '#FDE047' }}>music_note</span>
              Musica & SoundCloud Vibe
            </div>
            <button onClick={() => setShowMusicPicker(false)} style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
            </button>
          </div>

          {/* Popular Tracks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            {POPULAR_MUSIC_TRACKS.map((track) => (
              <div
                key={track.id}
                onClick={() => handleSelectMusic(track)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  background: selectedMusic?.id === track.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  border: selectedMusic?.id === track.id ? '1.5px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                }}
              >
                <img src={track.coverUrl} alt={track.title} style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 800 }}>{track.title}</div>
                  <div style={{ color: '#94A3B8', fontSize: '12px' }}>{track.artist}</div>
                </div>
                {selectedMusic?.id === track.id && (
                  <span className="material-symbols-outlined" style={{ color: '#F59E0B' }}>check_circle</span>
                )}
              </div>
            ))}
          </div>

          {/* Custom Audio URL Input */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
            <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              Oppure incolla il link audio (.mp3):
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="https://.../music.mp3"
                value={customAudioUrl}
                onChange={(e) => setCustomAudioUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#FFF',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleCustomAudioUrlAdd}
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  border: 'none',
                  color: '#FFF',
                  padding: '0 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. BOTTOM CAPTURE TOOLBAR (quando non c'è ancora una foto/video) */}
      {!capturedMediaUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom, 24px) + 28px)',
            left: 0,
            right: 0,
            padding: '24px 20px 36px 20px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 100,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          {/* Gallery Picker Thumbnail */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
            title="Galleria Foto/Video"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>photo_library</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* INSTAGRAM LIVE CAPTURE BUTTON (Tap Photo / Hold Video) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (!isRecordingVideo) {
                  captureLivePhoto();
                } else {
                  stopVideoRecording();
                }
              }}
              onMouseDown={() => {
                const timer = setTimeout(() => {
                  startVideoRecording();
                }, 400);
                (window as any)._holdTimer = timer;
              }}
              onMouseUp={() => {
                if ((window as any)._holdTimer) clearTimeout((window as any)._holdTimer);
                if (isRecordingVideo) {
                  stopVideoRecording();
                }
              }}
              onTouchStart={() => {
                const timer = setTimeout(() => {
                  startVideoRecording();
                }, 400);
                (window as any)._holdTimer = timer;
              }}
              onTouchEnd={() => {
                if ((window as any)._holdTimer) clearTimeout((window as any)._holdTimer);
                if (isRecordingVideo) {
                  stopVideoRecording();
                }
              }}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: isRecordingVideo
                  ? 'radial-gradient(circle, #EF4444 60%, #DC2626 100%)'
                  : 'radial-gradient(circle, #FFFFFF 65%, #E2E8F0 100%)',
                border: '6px solid rgba(255, 255, 255, 0.45)',
                boxShadow: isRecordingVideo
                  ? '0 0 24px rgba(239, 68, 68, 0.8)'
                  : '0 8px 24px rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            />
            {isRecordingVideo && (
              <div
                style={{
                  position: 'absolute',
                  top: '-32px',
                  background: '#EF4444',
                  color: '#FFF',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 900,
                  animation: 'pulse 1s infinite',
                }}
              >
                REC {recordingSeconds}s
              </div>
            )}
          </div>

          {/* Camera Flip Button in bottom-right */}
          <button
            onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
            }}
            title="Gira Fotocamera"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              flip_camera_ios
            </span>
          </button>
        </div>
      )}

      {/* 5. TASTO PUBBLICA ICONA IN BASSO A DESTRA (Posizionato più in alto per essere ergonomico) */}
      {capturedMediaUrl && !showTextInput && (
        <button
          onClick={handlePublish}
          style={{
            position: 'absolute',
            bottom: showFiltersPicker ? 'calc(env(safe-area-inset-bottom, 20px) + 95px)' : 'calc(env(safe-area-inset-bottom, 24px) + 85px)',
            right: '20px',
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.65)',
            cursor: 'pointer',
            zIndex: 200,
            transition: 'all 0.2s ease',
          }}
          title="Pubblica Storia"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px', fontWeight: 900 }}>
            send
          </span>
        </button>
      )}
    </div>
  );
};
