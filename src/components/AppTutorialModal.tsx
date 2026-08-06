import React, { useState } from 'react';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuidedStep {
  target: 'home' | 'pokedex' | 'scanner' | 'pub' | 'explore' | 'profile';
  badge: string;
  badgeBg: string;
  title: string;
  mascotQuote: string;
  explanation: string;
  highlights: { icon: string; text: string }[];
  pointerPosition: 'bottom' | 'center' | 'top';
}

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: GuidedStep[] = [
    {
      target: 'home',
      badge: 'PASSO 1 DI 6 • FEED & HOME',
      badgeBg: '#F59E0B',
      title: 'Benvenuto in Beerdex! 🍺',
      mascotQuote: 'Ciao Mastro Bevitore! Sono Birretta Boss 🕶️ la tua guida del Pub. Ti mostro subito come conquistare l\'app!',
      explanation: 'Qui in Home trovi la tua Taverna Digitale: vedi i check-in dei tuoi amici in tempo reale, fai un bel "Cin Cin" con audio e tieni d\'occhio la tua streak di sblocchi!',
      highlights: [
        { icon: 'photo_camera', text: 'Feed Social con foto ed attività al bancone' },
        { icon: 'celebration', text: 'Fai "Cin Cin" per mandare un suono di brindisi' },
        { icon: 'local_fire_department', text: 'Streak giornaliera sblocchi consecutivi' },
      ],
      pointerPosition: 'bottom',
    },
    {
      target: 'pokedex',
      badge: 'PASSO 2 DI 6 • POKEDEX & COLLEZIONE',
      badgeBg: '#3B82F6',
      title: 'Il tuo Pokédex delle Birre 📚',
      mascotQuote: 'Collezionale tutte! Ci sono centinaia di varianti da scoprire in giro per il mondo!',
      explanation: 'Nella Collezione vedi il tuo album delle birre sbloccate. Filtra per Comuni, Medie e Rare. Se trovi una variante Shiny luccicante raddoppi i tuoi punti!',
      highlights: [
        { icon: 'pie_chart', text: 'Stato collezione divisa per rarità e nazione' },
        { icon: 'auto_awesome', text: 'Birre Shiny (Luccicanti) valgono il doppio dei punti' },
        { icon: 'add_circle', text: 'Proponi nuove birre mancanti per ricevere punti bonus' },
      ],
      pointerPosition: 'bottom',
    },
    {
      target: 'scanner',
      badge: 'PASSO 3 DI 6 • SCANNER STAPPO',
      badgeBg: '#10B981',
      title: 'Tasto Stappo & Scanner Barcode 📸',
      mascotQuote: 'Inquadra il codice a barre e... STAPPO! La birra viene riconosciuta al volo!',
      explanation: 'Premi il tasto centrale "Stappo" quando hai in mano una bottiglia. Inquadra il codice a barre sul retro per sbloccarla, accumulare XP e condividere la foto col tuo amico!',
      highlights: [
        { icon: 'crop_free', text: 'Scansione barcode istantanea con fotocamera' },
        { icon: 'loyalty', text: 'Sblocco in compagnia: tagga un amico al pub con te' },
        { icon: 'workspace_premium', text: 'Guadagna Punti Esperienza (XP) per la classifica' },
      ],
      pointerPosition: 'center',
    },
    {
      target: 'pub',
      badge: 'PASSO 4 DI 6 • IL PUB & STORIE 24H',
      badgeBg: '#EC4899',
      title: 'Il Bancone del Pub & Storie 24h 🍻',
      mascotQuote: 'Qui la festa non finisce mai! Guarda i bevitori al bancone e pubblica Storie dal vivo!',
      explanation: 'Nel Pub trovi i bevitori presenti al bancone. Clicca sui loro avatar per guardare le loro Storie 24h, oppure usa lo Studio fotocamera con filtri Instagram, musica e testi!',
      highlights: [
        { icon: 'auto_awesome', text: 'Guarda le Storie 24h dei bevitori al pub' },
        { icon: 'photo_camera', text: 'Studio Storie: foto/video dal vivo con filtri e musica' },
        { icon: 'groups', text: 'Brinda ed interagisci con gli amici al bancone' },
      ],
      pointerPosition: 'bottom',
    },
    {
      target: 'explore',
      badge: 'PASSO 5 DI 6 • ESPLORA & MAPPA PUB',
      badgeBg: '#8B5CF6',
      title: 'Esplora & Mappa dei Locali 🗺️',
      mascotQuote: 'In cerca del locale perfetto stasera? Trova i pub registrati sulla mappa!',
      explanation: 'In Esplora puoi scoprire le birre più gettonate dalla community, la mappa dei pub e locali nei dintorni per fare check-in sul posto e diventare Mastro del Locale!',
      highlights: [
        { icon: 'near_me', text: 'Mappa dei pub con indicazioni stradali' },
        { icon: 'military_tech', text: 'Fai check-in nel locale e diventa il #1 del Pub' },
        { icon: 'search', text: 'Cerca birre per stile, gradazione e nazione' },
      ],
      pointerPosition: 'bottom',
    },
    {
      target: 'profile',
      badge: 'PASSO 6 DI 6 • CLASSIFICHE & PROFILO',
      badgeBg: '#EF4444',
      title: 'Trofei, Medaglie e Profilo 🏆',
      mascotQuote: 'Tutto pronto! Conquista il 1° posto in Classifica e completa la tua bacheca trofei!',
      explanation: 'Sblocca medaglie di marca ed evento, personalizza il tuo avatar e confronta il tuo punteggio nelle Classifiche globali ed amicali. Puoi riaprire questo tutorial dalle Impostazioni!',
      highlights: [
        { icon: 'leaderboard', text: 'Classifica Mastro Bevitore Globale e Amici' },
        { icon: 'workspace_premium', text: 'Bacheca Medaglie Brand e Trofei Evento' },
        { icon: 'settings', text: 'Riapri il tutorial quando vuoi nelle Impostazioni' },
      ],
      pointerPosition: 'bottom',
    },
  ];

  const current = steps[currentStep];

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
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: current.pointerPosition === 'center' ? 'center' : 'flex-end',
        padding: '20px 16px env(safe-area-inset-bottom, 24px) 16px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      {/* BIRRETTA BOSS MASCOT POP-UP CARD */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
          borderRadius: '32px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
          padding: '24px 22px 20px 22px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          marginBottom: current.pointerPosition === 'bottom' ? '70px' : '0',
          border: '2px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        {/* COOL BEER MASCOT AVATAR WITH SUNGLASSES 🍺🕶️ */}
        <div
          style={{
            position: 'absolute',
            top: '-55px',
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '3px solid #F59E0B',
            borderRadius: '50%',
            width: '90px',
            height: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)',
            animation: 'bounce 2s infinite ease-in-out',
          }}
        >
          {/* SVG COOL BEER MUG WITH SUNGLASSES */}
          <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Beer Mug Handle */}
            <path d="M72 40 C 88 40, 88 70, 72 70" stroke="#D97706" strokeWidth="8" strokeLinecap="round" fill="none" />
            {/* Beer Liquid Body */}
            <rect x="25" y="32" width="48" height="48" rx="10" fill="url(#beerGrad)" stroke="#D97706" strokeWidth="3" />
            {/* Foamy Head Top */}
            <path d="M 20 34 C 20 22, 32 20, 40 24 C 48 18, 60 18, 66 24 C 74 20, 80 26, 78 34 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            {/* Dark Sunglasses 🕶️ */}
            <path d="M 30 46 L 47 46 L 47 55 L 34 55 Z" fill="#0F172A" />
            <path d="M 53 46 L 70 46 L 66 55 L 53 55 Z" fill="#0F172A" />
            <line x1="46" y1="48" x2="54" y2="48" stroke="#0F172A" strokeWidth="3" />
            {/* Sunglasses Specular Glare */}
            <line x1="33" y1="48" x2="42" y2="52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <line x1="56" y1="48" x2="63" y2="52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            {/* Big Smile */}
            <path d="M 38 64 Q 50 74 62 64" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Rosy Cheeks */}
            <circle cx="32" cy="62" r="3" fill="#F43F5E" opacity="0.6" />
            <circle cx="68" cy="62" r="3" fill="#F43F5E" opacity="0.6" />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="beerGrad" x1="25" y1="32" x2="25" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* TOP SKIP BUTTON */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F1F5F9',
            border: 'none',
            color: '#64748B',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontWeight: 800,
          }}
          title="Salta Tutorial"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
        </button>

        {/* STEP BADGE */}
        <div
          style={{
            marginTop: '32px',
            background: current.badgeBg,
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 900,
            padding: '5px 14px',
            borderRadius: '20px',
            letterSpacing: '0.5px',
            boxShadow: `0 4px 12px ${current.badgeBg}50`,
            marginBottom: '10px',
          }}
        >
          {current.badge}
        </div>

        {/* STEP TITLE */}
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 900, color: '#0F172A', textAlign: 'center' }}>
          {current.title}
        </h2>

        {/* MASCOT SPEECH BUBBLE QUOTE */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1.5px solid #FCD34D',
            borderRadius: '18px',
            padding: '12px 16px',
            color: '#78350F',
            fontSize: '13px',
            fontWeight: 700,
            lineHeight: '1.4',
            textAlign: 'center',
            marginBottom: '14px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {current.mascotQuote}
        </div>

        {/* EXPLANATION */}
        <p style={{ margin: '0 0 14px 0', color: '#475569', fontSize: '13px', lineHeight: '1.5', textAlign: 'center' }}>
          {current.explanation}
        </p>

        {/* HIGHLIGHT POINTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginBottom: '18px' }}>
          {current.highlights.map((h, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '12px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: current.badgeBg, fontWeight: 800 }}>
                {h.icon}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', textAlign: 'left' }}>
                {h.text}
              </span>
            </div>
          ))}
        </div>

        {/* STEP PROGRESS DOTS */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
          {steps.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentStep(idx)}
              style={{
                width: idx === currentStep ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentStep ? current.badgeBg : '#CBD5E1',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* NAVIGATION BUTTONS */}
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '16px',
                border: '1.5px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              <span>Indietro</span>
            </button>
          )}

          <button
            onClick={handleNext}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: '16px',
              border: 'none',
              background: `linear-gradient(135deg, ${current.badgeBg} 0%, ${current.badgeBg}DD 100%)`,
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: `0 6px 20px ${current.badgeBg}60`,
            }}
          >
            <span>{currentStep === steps.length - 1 ? 'Inizia a Stappare! 🍺' : 'Avanti'}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {currentStep === steps.length - 1 ? 'check' : 'arrow_forward'}
            </span>
          </button>
        </div>

        {/* POINTER ARROW POINTING TO APP SECTIONS */}
        {current.pointerPosition === 'bottom' && (
          <div
            style={{
              position: 'absolute',
              bottom: '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'bounce 1.5s infinite',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: `14px solid ${current.badgeBg}`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
