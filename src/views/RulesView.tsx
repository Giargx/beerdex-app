import React from 'react';
import { FoamBubbles } from '../components/FoamBubbles';

export const RulesView: React.FC = () => {
  return (
    <div className="page-container-view">
      <header className="hero">
        <FoamBubbles />
        <h1 style={{ position: 'relative', zIndex: 2 }}>Le Regole del Pub</h1>
        <p style={{ position: 'relative', zIndex: 2 }}>Come funziona la sfida (senza fare i furbi!).</p>
      </header>

      <div className="page-container">
        <div className="rules-section">
          <h3>🍻 Cos'è POP IT?</h3>
          <p>
            POP IT è la tua collezione digitale personale di birre. Invece dei soliti album di figurine, qui collezioni le birre che degusti. L'obiettivo è semplice: provi una birra nuova, la scansioni o ne scatti una foto, sblocchi la scheda virtuale nella tua collezione e accumuli punti per salire in classifica ed esplorare nuovi stili insieme agli amici.
          </p>
        </div>

        <div className="rules-section">
          <h3>🏆 Gradi al Bancone</h3>
          <p>Più punti accumuli, più sali di livello. Ecco i gradi che puoi sbloccare:</p>
          <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              🍺 <strong>Novizio del Pub</strong> (&lt; 50 punti): Hai appena iniziato a bagnarti le labbra.
            </li>
            <li>
              🍺 <strong>Apprendista Bevitore</strong> (50-199 punti): Inizi a distinguere una bionda da una rossa.
            </li>
            <li>
              🍺 <strong>Esploratore di Luppoli</strong> (200-499 punti): La birra del discount non ti basta più.
            </li>
            <li>
              🍺 <strong>Sommelier del Bancone</strong> (500-1199 punti): Ormai sei quello che dà i consigli a tutti.
            </li>
            <li>
              👑 <strong>Mastro Birraio</strong> (1200+ punti): Il bancone è letteralmente casa tua. Leggenda.
            </li>
            <li>
              ⚡ <strong>Ægir (Divinità Norrena della Birra)</strong> (100% sblocchi): Hai sbloccato ogni singola variante di birra dell'applicazione. Divinità assoluta.
            </li>
          </ul>
        </div>

        <div className="rules-section">
          <h3>⭐ Punti e Rarità</h3>
          <p>Ogni birra sbloccata ti dà dei punti in base a quanto è rara:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Comune (1 punto):</strong> Birre commerciali diffuse (es. Heineken, Moretti, Peroni, Corona, Ceres, Ichnusa, Leffe, Menabrea, Forst, Guinness).
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Media (2 punti):</strong> Birre speciali o artigianali molto note (es. Affligem, BrewDog, Augustiner).
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Rara (5 punti):</strong> Birre trappiste o artigianali di nicchia (es. Baladin, Tripel Karmeliet, Chimay, Crak, Birrificio Italiano).
            </li>
          </ul>
          <p>
            🎁 <strong>Bonus Completa Marchio</strong>: Se sblocchi <strong>tutte</strong> le varianti di un singolo brand (ad esempio tutte le varianti di Menabrea), ottieni subito un bonus extra proporzionale di <strong>+3 Punti per ogni variante</strong> presente in quel brand (es. +9 Punti per un brand da 3 varianti, +15 Punti per uno da 5)!
          </p>
        </div>

        <div className="rules-section">
          <h3>✨ Birre Shiny (Punti Doppi)</h3>
          <p>
            Se bevi una birra all'estero, nella sua nazione d'origine (rilevata col GPS), lo sblocco diventa <strong>Shiny</strong> e vale il doppio dei punti!
          </p>
          <p>
            🇮🇹 <strong>E per l'Italia?</strong> Visto che siamo già a casa nostra, le birre italiane diventano Shiny solo se le scansioni nella loro specifica <strong>Regione d'origine</strong> (es. la Ichnusa vale doppio solo in Sardegna, la Menabrea solo in Piemonte, e così via).
          </p>
        </div>

        <div className="rules-section">
          <h3>🏅 Medaglie Stagionali ed Eventi a Tempo</h3>
          <p>Ci sono medaglie speciali che puoi sbloccare in determinati periodi dell'anno:</p>

          <h4 style={{ margin: '12px 0 6px 0', color: 'var(--primary-dark)' }}>🌸 4 Sfide Stagionali (+10 Punti ciascuna, 10 birre richieste):</h4>
          <ul style={{ paddingLeft: '20px', marginBottom: '14px' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong>Primavera (21 Mar – 20 Giu):</strong> Sblocca 10 birre Bianche (Blanche, Weizen, Saison).
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>Estate (21 Giu – 22 Set):</strong> Sblocca 10 birre Bionde o IPA.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>Autunno (23 Set – 20 Dic):</strong> Sblocca 10 birre Rosse, IPA o Tedesche.
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>Inverno (21 Dic – 20 Mar):</strong> Sblocca 10 birre Scure o Rosse (l'inverno viene associato all'anno solare in cui ricade la maggior parte dei mesi).
            </li>
          </ul>

          <h4 style={{ margin: '12px 0 6px 0', color: 'var(--primary-dark)' }}>🍻 4 Festività della Birra (3 o 5 Punti):</h4>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '6px' }}>
              <strong>🍀 San Patrizio (15 – 21 Mar):</strong> Sblocca 1 birra d'Irlanda/Scozia o Scura (+3 Punti).
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>🧺 Pasquetta (Weekend di Pasquetta):</strong> Sblocca 1 birra Belga o Bionda (+3 Punti).
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>☀️ Ferragosto (14 – 16 Ago):</strong> Sblocca 1 birra per il brindisi estivo (+3 Punti).
            </li>
            <li style={{ marginBottom: '6px' }}>
              <strong>🍺 Oktoberfest (16 Set – 4 Ott):</strong> Sblocca 3 birre tedesche durante le 3 settimane dell'evento (+5 Punti).
            </li>
          </ul>
        </div>

        <div
          className="rules-section"
          style={{
            background: '#FFFDF5',
            padding: '18px',
            borderRadius: '18px',
            border: '1px solid rgba(255, 179, 0, 0.2)',
            marginBottom: '20px',
          }}
        >
          <h3>📷 Codici a Barre e Spille (Gioca Pulito!)</h3>
          <p style={{ margin: 0, lineHeight: 1.5, fontSize: '14px', color: 'var(--dark)' }}>
            Se hai la bottiglia o la lattina sotto mano, usa lo scanner per inquadrare il codice a barre sul retro per convalidarla automaticamente.
            <br />
            <br />
            Se prendi una <strong>birra alla spina</strong>, salta lo scanner e scatta direttamente la foto del bicchiere. Qui andiamo a fiducia! Però occhio: se provi a fare il furbo caricando foto non pertinenti, gli altri utenti del pub ti segnaleranno. Se una foto viene giudicata falsa, il post viene cancellato e perdi tutti i punti.
          </p>
        </div>

        <div
          className="rules-section"
          style={{
            background: '#FFF5F5',
            padding: '18px',
            borderRadius: '18px',
            border: '1px solid rgba(239, 68, 68, 0.15)',
          }}
        >
          <h3>❤️ Regola Fondamentale</h3>
          <p style={{ margin: 0, lineHeight: 1.5, fontSize: '14px', color: 'var(--dark)' }}>
            Questa app serve per divertirsi, viaggiare e scoprire sapori nuovi in compagnia.{' '}
            <strong>Non diamo punti in base a quanto alcol bevi</strong>, ma a quante tipologie diverse provi. Degusta con calma, impara ad apprezzare la qualità e bevi responsabilmente senza esagerare.
          </p>
        </div>
      </div>
    </div>
  );
};
