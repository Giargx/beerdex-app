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
  // Position of red pulsing target ring on screen
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
      badge: 'PASSO 1 DI 6 • HOME & FEED',
      badgeBg: '#F59E0B',
      title: 'La tua Taverna Digitale 🍺',
      mascotSpeech: 'Ehi Mastro Bevitore! Sono Birretta Boss 🕶️. Guarda il cerchio rosso in alto: quello è il feed dove vedi i brindisi degli amici!',
      highlightText: 'Brinda ed interagisci con la community',
      targetPosition: { top: '140px', left: '50%', width: '90%', height: '140px', borderRadius: '24px' },
    },
    {
      pageName: 'page-pokedex',
      badge: 'PASSO 2 DI 6 • POKÉDEX',
      badgeBg: '#3B82F6',
      title: 'Il tuo Album delle Birre 📚',
      mascotSpeech: 'Siamo in Collezione! Qui vedi tutte le birre da sbloccare. Quelle con l\'anello dorato Shiny valgono il doppio dei punti!',
      highlightText: 'Filtra per rarità, nazione e scopri le Shiny',
      targetPosition: { top: '180px', left: '50%', width: '92%', height: '180px', borderRadius: '20px' },
    },
    {
      pageName: 'page-home',
      badge: 'PASSO 3 DI 6 • TASTO STAPPO',
      badgeBg: '#10B981',
      title: 'Scanner Barcode & Stappo 📸',
      mascotSpeech: 'Guarda in basso al centro! Quel cerchio rosso pulsante è il tasto Stappo: inquadra il codice a barre di una bottiglia e sbloccala!',
      highlightText: 'Tasto centrale per scansionare le bottiglie',
      targetPosition: { bottom: '15px', left: '50%', width: '76px', height: '76px', borderRadius: '50%' },
    },
    {
      pageName: 'page-pub',
      badge: 'PASSO 4 DI 6 • IL PUB & STORIE',
      badgeBg: '#EC4899',
      title: 'Il Bancone del Pub & Storie 24h 🍻',
      mascotSpeech: 'Siamo al Pub! Guarda la barra in alto: clicca sugli avatar per guardare le Storie 24h dei bevitori o pubblicane una tua!',
      highlightText: 'Storie dal vivo con filtri e musica',
      targetPosition: { top: '130px', left: '50%', width: '92%', height: '95px', borderRadius: '20px' },
    },
    {
      pageName: 'page-explore',
      badge: 'PASSO 5 DI 6 • ESPLORA & MAPPA',
      badgeBg: '#8B5CF6',
      title: 'Mappa dei Pub & Tendenze 🗺️',
      mascotSpeech: 'In Esplora trovi i locali vicino a te con la mappa interattiva. Fai check-in nel locale per diventare Mastro del Pub!',
      highlightText: 'Trova i migliori locali e la mappa dei pub',
      targetPosition: { top: '160px', left: '50%', width: '90%', height: '150px', borderRadius: '24px' },
    },
    {
      pageName: 'page-profile',
      badge: 'PASSO 6 DI 6 • PROFILO & CLASSIFICHE',
      badgeBg: '#EF4444',
      title: 'Classifiche & Bacheca Trofei 🏆',
      mascotSpeech: 'Eccoci nel tuo Profilo! Monitora i tuoi XP, scala la classifica amicale e sblocca i trofei. Ora sei pronto a stappare!',
      highlightText: 'Bacheca trofei, medaglie e impostazioni',
      targetPosition: { top: '140px', left: '50%', width: '90%', height: '160px', borderRadius: '24px' },
    },
  ];

  const current = steps[currentStep];

  // Auto navigate app page when step changes
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
        pointerEvents: 'none', // Allows clicking through except on tutorial elements
        boxSizing: 'border-box',
      }}
    >
      {/* OVERLAY BACKDROP SHADOW */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          pointerEvents: 'auto',
        }}
      />

      {/* CLASH OF CLANS STYLE PULSING RED TARGET CIRCLE (CERCHIO ROSSO EVIDENZIATORE) */}
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
            borderRadius: current.targetPosition.borderRadius || '50%',
            border: '4px solid #EF4444',
            boxShadow: '0 0 25px #EF4444, 0 0 45px rgba(239, 68, 68, 0.6) inset',
            animation: 'pulse 1.2s infinite ease-in-out',
            pointerEvents: 'auto',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleNext}
        >
          {/* Pulsing Target Arrow Indicator */}
          <div
            style={{
              position: 'absolute',
              top: '-32px',
              color: '#EF4444',
              fontSize: '28px',
              fontWeight: 900,
              animation: 'bounce 1s infinite',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              arrow_downward
            </span>
          </div>
        </div>
      )}

      {/* CLASH OF CLANS MASCOT (BIRRETTA BOSS 🍺🕶️ IN BASSO A SINISTRA) */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '16px',
          zIndex: 100005,
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
        }}
      >
        {/* MASCOT AVATAR 🍺🕶️ */}
        <div
          style={{
            position: 'relative',
            width: '95px',
            height: '95px',
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '3.5px solid #F59E0B',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(245, 158, 11, 0.45)',
            animation: 'bounce 2.2s infinite ease-in-out',
            flexShrink: 0,
          }}
        >
          {/* SVG COOL BEER MUG WITH SUNGLASSES */}
          <svg width="74" height="74" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M72 40 C 88 40, 88 70, 72 70" stroke="#D97706" strokeWidth="8" strokeLinecap="round" fill="none" />
            <rect x="25" y="32" width="48" height="48" rx="10" fill="url(#beerGradLive)" stroke="#D97706" strokeWidth="3" />
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
              <linearGradient id="beerGradLive" x1="25" y1="32" x2="25" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* THOUGHT SPEECH BUBBLE (NUVOLETTA DI PENSIERO AFFIANCO) */}
        <div
          style={{
            maxWidth: 'calc(100vw - 145px)',
            width: '320px',
            background: '#FFFFFF',
            borderRadius: '24px',
            borderBottomLeftRadius: '4px',
            padding: '16px 18px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.35), 0 0 0 2px #F59E0B inset',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Speech Bubble Pointer Tail */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '-12px',
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '14px solid #FFFFFF',
              filter: 'drop-shadow(-2px 0 1px #F59E0B)',
            }}
          />

          {/* BADGE & SKIP BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                background: current.badgeBg,
                color: '#FFF',
                fontSize: '10px',
                fontWeight: 900,
                padding: '3px 10px',
                borderRadius: '12px',
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
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', lineHeight: '1.2' }}>
            {current.title}
          </div>

          {/* MASCOT GUIDED EXPLANATION */}
          <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: '1.4', fontWeight: 600 }}>
            {current.mascotSpeech}
          </div>

          {/* HIGHLIGHT SUMMARY */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: '12px',
              padding: '6px 10px',
              fontSize: '11.5px',
              color: '#B45309',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lightbulb</span>
            <span>{current.highlightText}</span>
          </div>

          {/* NAVIGATION ACTION BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>
              {currentStep + 1} / {steps.length}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
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
                  padding: '6px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{currentStep === steps.length - 1 ? 'Ho capito! 🍺' : 'Avanti'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
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
