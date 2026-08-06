import React, { useState } from 'react';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  icon: string;
  badge: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  points: { icon: string; title: string; desc: string }[];
}

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: TutorialStep[] = [
    {
      icon: 'home',
      badge: 'PASSO 1 DI 6 • FEED & HOME',
      badgeBg: '#F59E0B',
      title: 'La tua Taverna Digitale 🍺',
      subtitle: 'Condividi brindisi, scopri nuove birre e partecipa alla community.',
      points: [
        { icon: 'photo_camera', title: 'Feed Social & Storie', desc: 'Guarda i check-in in tempo reale dei tuoi amici e le loro storie nelle ultime 24 ore.' },
        { icon: 'celebration', title: 'Brindisi & Reazioni', desc: 'Lascia un commento o manda un brindisi sonoro per festeggiare le birre sbloccate.' },
        { icon: 'local_fire_department', title: 'Streak Giornaliera', desc: 'Fai check-in ogni giorno per mantenere attiva la tua fiammella di sblocchi consecutivi!' },
        { icon: 'sports_bar', title: 'Consigli Stagionali', desc: 'Scopri la birra consigliata in base al periodo dell\'anno in corso.' },
      ]
    },
    {
      icon: 'explore',
      badge: 'PASSO 2 DI 6 • CATALOGO & RICERCA',
      badgeBg: '#3B82F6',
      title: 'Esplora & Cerca Birre 🔍',
      subtitle: 'Sfoglia centinaia di marche e varianti con filtri per stile, rarità e nazione.',
      points: [
        { icon: 'info', title: 'Scheda Dettagliata', desc: 'Consulta gradazione alcolica, stile, paese d\'origine e note di degustazione.' },
        { icon: 'auto_awesome', title: 'Varianti Shiny (Luccicanti)', desc: 'Trova le rare varianti Shiny per raddoppiare i punti ottenuti!' },
        { icon: 'add_circle', title: 'Proponi Nuove Birre', desc: 'Se una birra manca, invia una proposta agli Admin per sbloccarla e ricevere +2 Punti Bonus!' },
      ]
    },
    {
      icon: 'map',
      badge: 'PASSO 3 DI 6 • MAPPA & PUB',
      badgeBg: '#10B981',
      title: 'Trova i Pub nei Dintorni 📍',
      subtitle: 'Trova i migliori locali, fai check-in sul posto e scala la classifica del pub!',
      points: [
        { icon: 'near_me', title: 'Mappa Interattiva', desc: 'Esplora la mappa dei locali registrati attorno a te con indicazioni stradali.' },
        { icon: 'military_tech', title: 'Mastro Bevitore del Pub', desc: 'Fai check-in nel locale per guadagnare punti e diventare il numero #1 del pub!' },
        { icon: 'history_toggle_off', title: 'Storie del Pub (24h)', desc: 'Condividi momenti speciali ed eventi direttamente all\'interno della pagina del pub.' },
      ]
    },
    {
      icon: 'person',
      badge: 'PASSO 4 DI 6 • PROFILO & POKEDEX',
      badgeBg: '#8B5CF6',
      title: 'Il tuo Pokedex & Trofei 🏆',
      subtitle: 'Colleziona varianti, accumula punti esperienza e sblocca trofei esclusivi!',
      points: [
        { icon: 'pie_chart', title: 'Progresso & Rarità', desc: 'Monitora la tua collezione divisa tra birre Comuni, Medie e Rare.' },
        { icon: 'workspace_premium', title: 'Medaglie Brand', desc: 'Completa tutte le varianti di una marca per ottenere il bonus +3 pt a variante.' },
        { icon: 'event_note', title: 'Medaglie Evento', desc: 'Partecipa alle sfide stagionali (Oktoberfest, San Patrizio, Pasquetta, ecc.).' },
        { icon: 'star', title: 'Valutazioni & Stile Preferito', desc: 'Vota le tue birre (1-5 stelle) per scoprire il tuo stile brassicolo preferito.' },
      ]
    },
    {
      icon: 'group',
      badge: 'PASSO 5 DI 6 • AMICI & COMMUNITY',
      badgeBg: '#EC4899',
      title: 'Bevi in Compagnia & Tagga 🤝',
      subtitle: 'Aggiungi amici, condividi la passione per la birra e mantieni il controllo della privacy.',
      points: [
        { icon: 'loyalty', title: 'Tag nei Check-in', desc: 'Sei al pub con un amico? Taggali nel tuo check-in per sbloccare la birra anche a loro.' },
        { icon: 'mark_email_unread', title: 'Gestione Richieste Tag', desc: 'Ricevi notifiche quando qualcuno ti tagga ed accetta lo sblocco con un click.' },
        { icon: 'lock', title: 'Profilo Privato', desc: 'Attiva il profilo privato se vuoi mostrare i tuoi sblocchi solo agli amici che accetti.' },
      ]
    },
    {
      icon: 'qr_code_scanner',
      badge: 'PASSO 6 DI 6 • SCANNER & TIPS',
      badgeBg: '#6366F1',
      title: 'Scanner Barcode & Consigli 📷',
      subtitle: 'Usa la fotocamera per scansionare le bottiglie e sbloccare tutto alla velocità della luce!',
      points: [
        { icon: 'crop_free', title: 'Scansione Barcode', desc: 'Premi l\'icona scanner in basso ed inquadra il codice a barre sul retro della bottiglia.' },
        { icon: 'bolt', title: 'Sblocco Istantaneo', desc: 'Se la birra viene riconosciuta, la scheda si apre automaticamente in un attimo!' },
        { icon: 'school', title: 'Rivedi il Tutorial', desc: 'Puoi riaprire questa guida quando vuoi andando nelle Impostazioni (icona ingranaggio nel profilo).' },
      ]
    }
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
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        style={{
          background: 'var(--white)',
          borderRadius: '28px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {/* Header Header Bar */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            background: `linear-gradient(135deg, ${current.badgeBg}15, ${current.badgeBg}05)`,
            borderBottom: '1px solid var(--gray)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              background: current.badgeBg,
              color: 'white',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '20px',
              letterSpacing: '0.5px',
            }}
          >
            {current.badge}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Salta <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Slide Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: current.badgeBg,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 16px ${current.badgeBg}40`,
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                {current.icon}
              </span>
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--dark)', fontSize: '20px', fontWeight: 900 }}>
                {current.title}
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.4 }}>
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Points list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {current.points.map((pt, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: current.badgeBg, fontSize: '22px', marginTop: '1px', flexShrink: 0 }}
                >
                  {pt.icon}
                </span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--dark)', marginBottom: '2px' }}>
                    {pt.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                    {pt.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div
          style={{
            padding: '16px 24px',
            background: '#FAFAFC',
            borderTop: '1px solid var(--gray)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Progress Dots */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {steps.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentStep(index)}
                style={{
                  width: index === currentStep ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: index === currentStep ? current.badgeBg : '#CBD5E1',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--gray)',
                  background: 'white',
                  color: 'var(--dark)',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Indietro
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn-main"
              style={{
                background: current.badgeBg,
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 'bold',
                marginTop: 0,
                boxShadow: `0 4px 12px ${current.badgeBg}50`,
              }}
            >
              {currentStep === steps.length - 1 ? 'Inizia ad Esplorare! 🍺' : 'Avanti ➜'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
