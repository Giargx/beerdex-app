import React, { useState, useRef } from 'react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  currentUserAvatar?: string;
  initialImage?: string;
  initialCaption?: string;
  onPublishStory: (imageUrl: string, caption?: string) => Promise<void>;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  currentUser: _currentUser,
  currentUserAvatar: _currentUserAvatar,
  initialImage = '',
  initialCaption = '',
  onPublishStory,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(initialImage);
  const [caption, setCaption] = useState<string>(initialCaption);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image to max 900px width/height for fast Firebase story loading
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setSelectedImage(compressedBase64);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async () => {
    if (!selectedImage) return;
    setIsSubmitting(true);
    try {
      await onPublishStory(selectedImage, caption.trim());
      setSelectedImage('');
      setCaption('');
      onClose();
    } catch (err) {
      console.error('Errore pubblicazione storia:', err);
      alert('Impossibile pubblicare la storia. Riprova!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      {/* Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
        </button>

        <div style={{ color: 'white', fontWeight: 900, fontSize: '18px' }}>
          Nuova Storia
        </div>

        <div style={{ width: '40px' }} />
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Main Content Area */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {selectedImage ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '520px',
              borderRadius: '24px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={selectedImage}
              alt="Anteprima storia"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Change Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0, 0, 0, 0.65)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>photo_camera</span>
              Cambia foto
            </button>
          </div>
        ) : (
          /* Empty State - Photo Trigger */
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              height: '380px',
              borderRadius: '28px',
              border: '2px dashed rgba(245, 158, 11, 0.6)',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '24px',
              boxSizing: 'border-box',
              textAlign: 'center',
              gap: '16px',
              transition: 'transform 0.2s ease',
            }}
          >
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '38px' }}>photo_camera</span>
            </div>

            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: '18px', marginBottom: '6px' }}>
                Scatta o scegli una foto
              </div>
              <div style={{ color: '#94A3B8', fontSize: '13px', lineHeight: 1.4 }}>
                Fotografa qualsiasi cosa (amici, pub, serate) e condividila nelle tue Storie per 24h!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls & Publish */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {selectedImage && (
          <input
            type="text"
            placeholder="Aggiungi una didascalia (opzionale)..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={140}
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none',
              backdropFilter: 'blur(10px)',
            }}
          />
        )}

        {selectedImage ? (
          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 900,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
            <span>{isSubmitting ? 'Pubblicazione in corso...' : 'Pubblica Storia'}</span>
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>photo_library</span>
            <span>Apri Fotocamera o Galleria</span>
          </button>
        )}
      </div>
    </div>
  );
};
