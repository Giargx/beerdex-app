import React, { useState, useEffect, useRef } from 'react';

interface PullToRefreshHandlerProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

export const PullToRefreshHandler: React.FC<PullToRefreshHandlerProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const startYRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);

  const PULL_THRESHOLD = 70; // Pixel per attivare il refresh

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Attiva solo se la scrollbar è in cima alla pagina
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollTop <= 2 && e.touches.length === 1) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      } else {
        isPullingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return;
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollTop > 5) {
        isPullingRef.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      if (deltaY > 0) {
        // Aggiungi una resistenza fisica (effetto elastico iOS)
        const distance = Math.min(deltaY * 0.45, 110);
        setPullDistance(distance);

        // Previene lo scroll sgradevole di Safari se stiamo trascinando in giù
        if (distance > 10 && e.cancelable) {
          // Si può eventualmente prevenire l'azione di default se necessario
        }
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(60); // Mantieni la rotellina visibile in alto durante il refresh

        try {
          await onRefresh();
        } catch (err) {
          console.error("Errore durante il pull-to-refresh:", err);
        } finally {
          // Attendi un istante per far vedere l'animazione completata
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 600);
        }
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  const rotation = Math.min(pullDistance * 3.5, 360);
  const opacity = Math.min(pullDistance / 40, 1);

  return (
    <>
      {/* Indicatore Visivo della Rotellina di Refresh (Styling iOS & Android) */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          style={{
            position: 'fixed',
            top: `${Math.min(pullDistance + 10, 75)}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: opacity,
            transition: isPullingRef.current ? 'none' : 'top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              border: '1.5px solid #F59E0B',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4), 0 0 12px rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FDE047',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '22px',
                transform: `rotate(${isRefreshing ? 0 : rotation}deg)`,
                animation: isRefreshing ? 'spin 0.75s linear infinite' : 'none',
              }}
            >
              refresh
            </span>
          </div>
        </div>
      )}

      {children}
    </>
  );
};
