import React, { useState, useRef, useEffect } from 'react';

interface CropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedBase64: string) => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  imageSrc,
  onCancel,
  onConfirm,
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [baseSize, setBaseSize] = useState({ width: 250, height: 250 });
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef(false);
  const startDragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        let bw = 250;
        let bh = 250;
        if (w > h) {
          bh = 250;
          bw = 250 * (w / h);
        } else {
          bw = 250;
          bh = 250 * (h / w);
        }
        setBaseSize({ width: bw, height: bh });
        setPosition({
          x: (250 - bw) / 2,
          y: (250 - bh) / 2,
        });
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  const clampPosition = (x: number, y: number, currentZoom: number) => {
    const w = baseSize.width * currentZoom;
    const h = baseSize.height * currentZoom;
    
    let clampedX = x;
    let clampedY = y;
    
    if (clampedX > 0) clampedX = 0;
    if (clampedX < 250 - w) clampedX = 250 - w;
    if (clampedY > 0) clampedY = 0;
    if (clampedY < 250 - h) clampedY = 250 - h;
    
    return { x: clampedX, y: clampedY };
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    const oldZoom = zoom;
    setZoom(newZoom);

    // Zoom from center
    const centerX = 125;
    const centerY = 125;
    const relX = centerX - position.x;
    const relY = centerY - position.y;

    const nextX = centerX - relX * (newZoom / oldZoom);
    const nextY = centerY - relY * (newZoom / oldZoom);
    
    setPosition(clampPosition(nextX, nextY, newZoom));
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    startDragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
    
    if (e.cancelable && e.type === 'touchstart') {
      e.preventDefault();
    }
  };

  const moveDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const targetX = clientX - startDragOffset.current.x;
    const targetY = clientY - startDragOffset.current.y;
    
    setPosition(clampPosition(targetX, targetY, zoom));
    
    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  // Add global drag listeners during dragging
  useEffect(() => {
    if (isOpen) {
      const handleGlobalMouseMove = (e: MouseEvent) => moveDrag(e);
      const handleGlobalTouchMove = (e: TouchEvent) => moveDrag(e);
      const handleGlobalMouseUp = () => stopDrag();
      const handleGlobalTouchEnd = () => stopDrag();

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchend', handleGlobalTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('touchmove', handleGlobalTouchMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isOpen, position, zoom, baseSize]);

  if (!isOpen) return null;

  const handleConfirmCrop = () => {
    const imgEl = imageRef.current;
    if (!imgEl) return;
    
    const naturalWidth = imgEl.naturalWidth || baseSize.width || 250;
    const w = (baseSize.width || 250) * zoom;
    const scaleR = naturalWidth / (w || 1);
    
    const cropX = -position.x * scaleR;
    const cropY = -position.y * scaleR;
    const cropSize = 250 * scaleR;
    
    const canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(
        imgEl,
        cropX,
        cropY,
        cropSize,
        cropSize,
        0,
        0,
        250,
        250
      );
      try {
        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.70);
        onConfirm(croppedBase64);
      } catch (err) {
        console.error("Error cropping image:", err);
      }
    }
  };

  return (
    <div className="auth-modal" style={{ zIndex: 21000 }}>
      <div className="auth-container" style={{ maxWidth: '350px', padding: '20px', textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, color: 'var(--dark)', marginBottom: '10px' }}>Regola Foto Profilo</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
          Trascina la foto per posizionarla e usa la barra per zoomare.
        </p>

        <div
          ref={viewportRef}
          className="crop-viewport-container"
          style={{
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '0 auto 20px auto',
            position: 'relative',
            background: '#f0f0f0',
            border: '2px solid var(--primary-dark)',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
            cursor: 'move',
          }}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          <img
            ref={imageRef}
            id="cropImage"
            src={imageSrc}
            alt="To crop"
            style={{
              position: 'absolute',
              userSelect: 'none',
              pointerEvents: 'none',
              maxWidth: 'none',
              width: `${baseSize.width * zoom}px`,
              height: `${baseSize.height * zoom}px`,
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '0 10px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', fontSize: '20px' }}>
            zoom_out
          </span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            style={{ flexGrow: 1, cursor: 'pointer' }}
          />
          <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', fontSize: '20px' }}>
            zoom_in
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-main" onClick={handleConfirmCrop} style={{ flex: 1, justifyContent: 'center' }}>
            Salva
          </button>
          <button className="btn-secondary" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};
