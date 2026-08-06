import React, { useState, useEffect } from 'react';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (pageName: string) => void;
}

interface GuidedStep {
  pageName: string;
  badge: string;
  badgeBg: string;
  title: string;
  mascotSpeech: string;
  highlightText: string;
  targetPosition: {
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

  const steps: GuidedStep[] = [
    {
      pageName: 'page-home',
      badge: 'PASSO 1 DI 8 • HOME & PROFILO RAPIDO',
      badgeBg: '#F59E0B',
      title: 'Ciao! Sono POP 🍺🕶️',
      mascotSpeech: 'Benvenuto in POP IT! Sono POP, la tua guida personale. In alto a sinistra trovi il tuo avatar con il tuo livello e la fiammella streak!',
      highlightText: 'Livello bevitore & streak giornaliera',
      targetPosition: { top: '15px', left: '15px', width: '190px', height: '60px', borderRadius: '20px' },
    },
    {
      pageName: 'page-home',
      badge: 'PASSO 2 DI 8 • FEED SOCIAL & CIN CIN',
      badgeBg: '#E67E22',
      title: 'Feed & Brindisi "Cin Cin" 🍻',
      mascotSpeech: 'Scorrendo la Home vedi i sblocchi dei tuoi amici in tempo reale. Tocca il tasto "Cin Cin" per inviare un brindisi sonoro!',
      highlightText: 'Tasto Cin Cin per festeggiare le bevute',
      targetPosition: { top: '380px', left: '50%', width: '92%', height: '110px', borderRadius: '20px' },
    },
    {
      pageName: 'page-explore',
      badge: 'PASSO 3 DI 8 • COLLEZIONE & POKÉDEX',
      badgeBg: '#3B82F6',
      title: 'La Collezione Birre 📚',
      mascotSpeech: 'Siamo nella sezione Esplora/Collezione! Qui vedi tutte le birre Comuni, Medie e Rare. Le varianti Shiny luccicanti valgono doppio!',
      highlightText: 'Filtra per rarità e colleziona le Shiny',
      targetPosition: { top: '70px', left: '50%', width: '94%', height: '160px', borderRadius: '20px' },
    },
    {
      pageName: 'page-home',
      badge: 'PASSO 4 DI 8 • SCANNER BARCODE',
      badgeBg: '#10B981',
      title: 'Scansiona & Stappa 📸',
      mascotSpeech: 'Quando hai una bottiglia in mano, usa la fotocamera per inquadrare il codice a barre sul retro e sbloccare la birra al volo!',
      highlightText: 'Scansione codice a barre istantanea',
      targetPosition: { top: '15px', right: '15px', width: '48px', height: '48px', borderRadius: '50%' },
    },
    {
      pageName: 'page-leaderboard',
      badge: 'PASSO 5 DI 8 • CLASSIFICA GLOBAL',
      badgeBg: '#8B5CF6',
      title: 'Classifica & Medaglie 🏆',
      mascotSpeech: 'Qui vedi chi ha collezionato più birre! Confronta i tuoi XP con gli amici e scala la vetta della classifica globale!',
      highlightText: 'Classifica XP amici e bevitori globali',
      targetPosition: { top: '80px', left: '50%', width: '92%', height: '140px', borderRadius: '20px' },
    },
    {
      pageName: 'page-social',
      badge: 'PASSO 6 DI 8 • IL PUB & STORIE 24H',
      badgeBg: '#EC4899',
      title: 'Il Bancone del Pub & Storie 🍻',
      mascotSpeech: 'Siamo al Pub! Guarda gli avatar in alto: cliccaci sopra per guardare le Storie 24h dei bevitori al bancone o scattarne una tua!',
      highlightText: 'Storie dal vivo 24h con filtri e musica',
      targetPosition: { top: '80px', left: '50%', width: '94%', height: '115px', borderRadius: '20px' },
    },
    {
      pageName: 'page-explore',
      badge: 'PASSO 7 DI 8 • TENDENZE & STAGIONE',
      badgeBg: '#14B8A6',
      title: 'Consigli Stagionali & Tendenze 💡',
      mascotSpeech: 'In Esplora trovi i consigli sulle birre di stagione e le marche più popolari secondo la community!',
      highlightText: 'Suggerimenti stagionali e stili popolari',
      targetPosition: { top: '240px', left: '50%', width: '92%', height: '150px', borderRadius: '20px' },
    },
    {
      pageName: 'page-profile',
      badge: 'PASSO 8 DI 8 • PROFILO & BACHECA',
      badgeBg: '#EF4444',
      title: 'Il tuo Profilo & Impostazioni ⚙️',
      mascotSpeech: 'Finito! Nel tuo Profilo vedi tutti i tuoi post, trofei sbloccati e le Impostazioni dove puoi riaprire questo tutorial. Inizia a stappare!',
      highlightText: 'Bacheca post, trofei e riapertura tutorial',
      targetPosition: { top: '70px', left: '50%', width: '92%', height: '160px', borderRadius: '20px' },
    },
  ];

  const current = steps[currentStep];

  // Lock body scrolling when tutorial is open
  useEffect(() => {
    if (isOpen) {
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* SOFT BACKDROP (NO HEAVY BLUR - LIVE APP IS CLEARLY VISIBLE BEHIND) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.25)',
          pointerEvents: 'auto',
        }}
      />

      {/* CLASH OF CLANS TARGETING CIRCLE (CERCHIO ROSSO EVIDENZIATORE SUL DETTAGLIO) */}
      {current.targetPosition && (
        <div
          style={{
            position: 'absolute',
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
          }}
          onClick={handleNext}
        >
          {/* Target Arrow Indicator */}
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
      )}

      {/* CLASH OF CLANS MASCOT POP IN BASSO A SINISTRA CON NUVOLETTA COMPATTA */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '12px',
          right: '12px',
          zIndex: 100005,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          boxSizing: 'border-box',
        }}
      >
        {/* MASCOT AVATAR "POP" 🍺🕶️ */}
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
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
          <svg width="62" height="62" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M72 40 C 88 40, 88 70, 72 70" stroke="#D97706" strokeWidth="8" strokeLinecap="round" fill="none" />
            <rect x="25" y="32" width="48" height="48" rx="10" fill="url(#beerGradPop)" stroke="#D97706" strokeWidth="3" />
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
              <linearGradient id="beerGradPop" x1="25" y1="32" x2="25" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* THOUGHT SPEECH BUBBLE COMPATTA (NON ESCE DALLO SCHERMO) */}
        <div
          style={{
            flex: 1,
            background: '#FFFFFF',
            borderRadius: '20px',
            borderBottomLeftRadius: '4px',
            padding: '12px 14px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3), 0 0 0 2px #F59E0B inset',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '220px',
            boxSizing: 'border-box',
          }}
        >
          {/* Speech Bubble Tail */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                background: current.badgeBg,
                color: '#FFF',
                fontSize: '9.5px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              {current.badge}
            </span>

            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
              title="Chiudi Tutorial"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          </div>

          {/* TITLE */}
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', lineHeight: '1.2' }}>
            {current.title}
          </div>

          {/* MASCOT SPEECH */}
          <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.35', fontWeight: 600 }}>
            {current.mascotSpeech}
          </div>

          {/* HIGHLIGHT */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: '10px',
              padding: '4px 8px',
              fontSize: '11px',
              color: '#B45309',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lightbulb</span>
            <span>{current.highlightText}</span>
          </div>

          {/* CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B' }}>
              {currentStep + 1} di {steps.length}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '5px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Indietro
                </button>
              )}

              <button
                onClick={handleNext}
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <span>{currentStep === steps.length - 1 ? 'Inizia a Stappare! 🍺' : 'Avanti'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  {currentStep === steps.length - 1 ? 'check' : 'arrow_forward'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
