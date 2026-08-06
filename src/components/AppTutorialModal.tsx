import React, { useState, useEffect } from 'react';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (pageName: string) => void;
}

interface GuidedStep {
  pageName: string;
  targetId?: string;
  badge: string;
  badgeBg: string;
  title: string;
  mascotSpeech: string;
  targetPosition?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    width?: string;
    height?: string;
    borderRadius?: string;
  };
}

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const steps: GuidedStep[] = [
    // ----------------------------------------------------
    // PASSO 1: HOME - PULSANTI AZIONE IN ALTO
    // ----------------------------------------------------
    {
      pageName: 'page-home',
      targetId: 'homeTopActionTiles',
      badge: 'FASE 1 DI 5 • HOME',
      badgeBg: '#F59E0B',
      title: 'Benvenuto su PopIt! 🍺🕶️',
      mascotSpeech: 'Ciao! Sono POP 🍺🕶️, la tua guida personale. Ti mostro le icone principali: la Fotocamera per immortalare le tue birre, il tasto Amici, la Mappa dei pub ed il Regolamento!',
      targetPosition: { top: '340px', left: '50%', width: '92%', height: '90px', borderRadius: '24px' },
    },
    // ----------------------------------------------------
    // PASSO 1B: HOME - EVENTO SPECIALE & SPINA DEL GIORNO
    // ----------------------------------------------------
    {
      pageName: 'page-home',
      targetId: 'dashEventBox',
      badge: 'FASE 1 DI 5 • HOME',
      badgeBg: '#D97706',
      title: 'Eventi Speciali & Spina 🍺',
      mascotSpeech: 'Sempre nella Home trovi il banner dell\'Evento Stagionale attivo (es. Oktoberfest o San Patrizio) e la Spina del Giorno con le birre consigliate!',
      targetPosition: { top: '440px', left: '50%', width: '92%', height: '140px', borderRadius: '24px' },
    },
    // ----------------------------------------------------
    // PASSO 2A: ESPLORA - RICERCA E FILTRI
    // ----------------------------------------------------
    {
      pageName: 'page-explore',
      targetId: 'exploreSearchHeader',
      badge: 'FASE 2 DI 5 • ESPLORA',
      badgeBg: '#3B82F6',
      title: 'Cerca & Filtra le Birre 🔍',
      mascotSpeech: 'Siamo in Esplora! In alto puoi digitare la marca della birra che cerchi e filtrarla per Rarità (Comuni, Medie, Rare) o per Nazione!',
      targetPosition: { top: '70px', left: '50%', width: '94%', height: '180px', borderRadius: '20px' },
    },
    // ----------------------------------------------------
    // PASSO 2B: ESPLORA - BANNER RARITÀ & PROCEDURA SBLOCCO
    // ----------------------------------------------------
    {
      pageName: 'page-explore',
      targetId: 'beerList',
      badge: 'FASE 2 DI 5 • ESPLORA',
      badgeBg: '#2563EB',
      title: 'Banner Rarità & Scansione 📸',
      mascotSpeech: 'Toccando un banner di rarità apri la scheda della birra. Premi "Sblocca": scatta una foto alla tua birra per immortalare la bevuta!',
      targetPosition: { top: '270px', left: '50%', width: '94%', height: '180px', borderRadius: '20px' },
    },
    // ----------------------------------------------------
    // PASSO 3A: CLASSIFICHE - AMICI E GLOBALE (TOP 50)
    // ----------------------------------------------------
    {
      pageName: 'page-leaderboard',
      targetId: 'leaderboardTabs',
      badge: 'FASE 3 DI 5 • CLASSIFICHE',
      badgeBg: '#8B5CF6',
      title: 'Classifica Amici & Globale 🏆',
      mascotSpeech: 'Nelle Classifiche puoi confrontare i tuoi punti XP con i tuoi amici. Nella scheda Globale trovi i Top 50 Bevitori migliori dell\'intera applicazione!',
      targetPosition: { top: '75px', left: '50%', width: '92%', height: '55px', borderRadius: '20px' },
    },
    // ----------------------------------------------------
    // PASSO 3B: CLASSIFICHE - RICERCA UTENTI PER NICKNAME
    // ----------------------------------------------------
    {
      pageName: 'page-leaderboard',
      targetId: 'leaderboardSearchBox',
      badge: 'FASE 3 DI 5 • CLASSIFICHE',
      badgeBg: '#7C3AED',
      title: 'Cerca Utenti per Nickname 🔎',
      mascotSpeech: 'Vuoi cercare un altro bevitore? Usa la barra di ricerca in alto per digitare il nickname univoco di qualsiasi utente e trovarlo al volo!',
      targetPosition: { top: '140px', left: '50%', width: '92%', height: '50px', borderRadius: '18px' },
    },
    // ----------------------------------------------------
    // PASSO 4A: PUB - STORIE 24H AL BANCONE
    // ----------------------------------------------------
    {
      pageName: 'page-social',
      targetId: 'pubStoriesSection',
      badge: 'FASE 4 DI 5 • IL PUB',
      badgeBg: '#EC4899',
      title: 'Le Storie 24h al Bancone 🍻',
      mascotSpeech: 'Siamo al Pub Social! In alto trovi le Storie 24h dei bevitori. Tocca il cerchio profilo di un amico per guardare la sua storia o scattarne una tua!',
      targetPosition: { top: '75px', left: '50%', width: '94%', height: '110px', borderRadius: '20px' },
    },
    // ----------------------------------------------------
    // PASSO 4B: PUB - FEED POST, SALVATAGGIO & SEGNALAZIONE
    // ----------------------------------------------------
    {
      pageName: 'page-social',
      targetId: 'pubPostsFeed',
      badge: 'FASE 4 DI 5 • IL PUB',
      badgeBg: '#DB2777',
      title: 'Post degli Amici & Salvataggio 📌',
      mascotSpeech: 'Nel feed del Pub vedi i post pubblicati dai tuoi amici. Usa l\'icona del Segnalibro per salvarli tra i tuoi preferiti o l\'icona della Bandierina per segnalarli.',
      targetPosition: { top: '200px', left: '50%', width: '94%', height: '220px', borderRadius: '20px' },
    },
    // ----------------------------------------------------
    // PASSO 5A: PROFILO - IMPOSTAZIONI & FOTO PROFILO
    // ----------------------------------------------------
    {
      pageName: 'page-profile',
      targetId: 'profileSettingsBtn',
      badge: 'FASE 5 DI 5 • PROFILO',
      badgeBg: '#EF4444',
      title: 'Impostazioni & Foto Profilo ⚙️',
      mascotSpeech: 'Siamo nel tuo Profilo! In alto a destra c\'è l\'ingranaggio per modificare il tuo nickname (ogni 3 mesi), cambiare la password e riaprire questo tutorial!',
      targetPosition: { top: '20px', right: '20px', width: '44px', height: '44px', borderRadius: '12px' },
    },
    // ----------------------------------------------------
    // PASSO 5B: PROFILO - LE SCHEDE IN BASSO
    // ----------------------------------------------------
    {
      pageName: 'page-profile',
      targetId: 'profileTabButtons',
      badge: 'FASE 5 DI 5 • PROFILO',
      badgeBg: '#DC2626',
      title: 'Le tue Schede Personali 📊',
      mascotSpeech: 'In basso nel profilo trovi 5 schede: "I Miei Post", "Post Salvati", "Medaglie & Trofei", "Statistiche Stili" e "Valutazioni". Esplorale tutte!',
      targetPosition: { top: '350px', left: '50%', width: '94%', height: '48px', borderRadius: '12px' },
    },
  ];

  const current = steps[currentStep];

  // ALWAYS reset tutorial step to 0 when opening or restarting
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Navigate app tab automatically when step changes
  useEffect(() => {
    if (isOpen && current && onNavigate) {
      onNavigate(current.pageName);
    }
  }, [currentStep, isOpen]);

  // Scroll target element into view and update bounding box position continuously
  useEffect(() => {
    if (!isOpen || !current || !current.targetId) {
      setTargetRect(null);
      return;
    }

    let frameId: number;
    let startTime = Date.now();
    let hasScrolled = false;

    const measureAndScroll = () => {
      const el = document.getElementById(current.targetId!);
      if (el) {
        // Auto-scroll target element into center view on step change
        if (!hasScrolled) {
          hasScrolled = true;
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          } catch (e) {}
        }

        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const padding = 6;
          setTargetRect({
            top: Math.max(8, rect.top - padding),
            left: Math.max(8, rect.left - padding),
            width: Math.min(window.innerWidth - 16, rect.width + padding * 2),
            height: rect.height + padding * 2,
          });
        }
      }

      // Continuously measure while tab slide transitions or scroll animations settle (up to 1000ms)
      if (Date.now() - startTime < 1000) {
        frameId = requestAnimationFrame(measureAndScroll);
      }
    };

    measureAndScroll();

    // Re-measure on user scroll or window resize
    const handleScrollOrResize = () => {
      const el = document.getElementById(current.targetId!);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const padding = 6;
          setTargetRect({
            top: Math.max(8, rect.top - padding),
            left: Math.max(8, rect.left - padding),
            width: Math.min(window.innerWidth - 16, rect.width + padding * 2),
            height: rect.height + padding * 2,
          });
        }
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div
      onClick={handleNext}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        pointerEvents: 'auto',
        cursor: 'pointer',
        boxSizing: 'border-box',
      }}
    >
      {/* SOFT BACKDROP */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.28)',
          pointerEvents: 'auto',
        }}
      />

      {/* DYNAMIC OR FALLBACK RED TARGETING HIGHLIGHTER */}
      {targetRect ? (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top + 'px',
            left: targetRect.left + 'px',
            width: targetRect.width + 'px',
            height: targetRect.height + 'px',
            borderRadius: current.targetPosition?.borderRadius || '20px',
            border: '3.5px solid #EF4444',
            boxShadow: '0 0 20px #EF4444, 0 0 30px rgba(239, 68, 68, 0.4) inset',
            animation: 'pulse 1.2s infinite ease-in-out',
            pointerEvents: 'auto',
            zIndex: 100000,
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: targetRect.top < 60 ? 'auto' : '-28px',
              bottom: targetRect.top < 60 ? '-28px' : 'auto',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#EF4444',
              animation: 'bounce 1s infinite',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px', fontWeight: 900 }}>
              {targetRect.top < 60 ? 'arrow_upward' : 'arrow_downward'}
            </span>
          </div>
        </div>
      ) : current.targetPosition ? (
        <div
          style={{
            position: 'fixed',
            top: current.targetPosition.top || 'auto',
            bottom: current.targetPosition.bottom || 'auto',
            left: current.targetPosition.left || 'auto',
            right: current.targetPosition.right || 'auto',
            transform: current.targetPosition.left === '50%' ? 'translateX(-50%)' : 'none',
            width: current.targetPosition.width || '80px',
            height: current.targetPosition.height || '80px',
            borderRadius: current.targetPosition.borderRadius || '20px',
            border: '3.5px solid #EF4444',
            boxShadow: '0 0 20px #EF4444, 0 0 30px rgba(239, 68, 68, 0.4) inset',
            animation: 'pulse 1.2s infinite ease-in-out',
            pointerEvents: 'auto',
            zIndex: 100000,
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#EF4444',
              animation: 'bounce 1s infinite',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px', fontWeight: 900 }}>
              arrow_downward
            </span>
          </div>
        </div>
      ) : null}

      {/* MASCOT & SPEECH BUBBLE CARD WITH FIXED UNIFORM DIMENSIONS */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 24px)',
          maxWidth: '480px',
          zIndex: 100005,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxSizing: 'border-box',
        }}
      >
        {/* MASCOT AVATAR "POP" 🍺🕶️ */}
        <div
          style={{
            position: 'relative',
            width: '74px',
            height: '74px',
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '3px solid #F59E0B',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.45)',
            animation: 'bounce 2.2s infinite ease-in-out',
            flexShrink: 0,
          }}
        >
          {/* SVG COOL BEER MUG WITH SUNGLASSES ("POP") */}
          <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M72 40 C 88 40, 88 70, 72 70" stroke="#D97706" strokeWidth="8" strokeLinecap="round" fill="none" />
            <rect x="25" y="32" width="48" height="48" rx="10" fill="url(#beerGradPopMain)" stroke="#D97706" strokeWidth="3" />
            <path d="M 20 34 C 20 22, 32 20, 40 24 C 48 18, 60 18, 66 24 C 74 20, 80 26, 78 34 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <path d="M 30 46 L 47 46 L 47 55 L 34 55 Z" fill="#0F172A" />
            <path d="M 53 46 L 70 46 L 66 55 L 53 55 Z" fill="#0F172A" />
            <line x1="46" y1="48" x2="54" y2="48" stroke="#0F172A" strokeWidth="3" />
            <line x1="33" y1="48" x2="42" y2="52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <line x1="56" y1="48" x2="63" y2="52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <path d="M 38 64 Q 50 74 62 64" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="32" cy="62" r="3" fill="#F43F5E" opacity="0.6" />
            <circle cx="68" cy="62" r="3" fill="#F43F5E" opacity="0.6" />
            <defs>
              <linearGradient id="beerGradPopMain" x1="25" y1="32" x2="25" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* THOUGHT SPEECH BUBBLE WITH UNIFORM COMPACT DIMENSIONS */}
        <div
          style={{
            flex: 1,
            height: '175px',
            background: '#FFFFFF',
            borderRadius: '20px',
            borderBottomLeftRadius: '4px',
            padding: '12px 14px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3), 0 0 0 2px #F59E0B inset',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* Speech Bubble Tail */}
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              left: '-10px',
              width: 0,
              height: 0,
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '12px solid #FFFFFF',
              filter: 'drop-shadow(-2px 0 1px #F59E0B)',
            }}
          />

          {/* BADGE & SKIP BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span
              style={{
                background: current.badgeBg,
                color: '#FFF',
                fontSize: '10px',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '10px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '85%',
              }}
            >
              {current.badge}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
              title="Chiudi Tutorial"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>

          {/* INNER TEXT AREA (NO INTERNAL SCROLLING) */}
          <div style={{ flex: 1, margin: '6px 0', overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', lineHeight: '1.25', marginBottom: '4px' }}>
              {current.title}
            </div>

            <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4', fontWeight: 600 }}>
              {current.mascotSpeech}
            </div>
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, marginTop: '2px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B' }}>
              {currentStep + 1} di {steps.length} • Touch ovunque per proseguire
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {currentStep > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '5px 12px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Indietro
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
