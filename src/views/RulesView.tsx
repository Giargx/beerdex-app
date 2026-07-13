import React from 'react';

export const RulesView: React.FC = () => {
  return (
    <div className="page-container-view">
      <header className="hero">
        <h1>Le Regole del Pub</h1>
        <p>Come funziona la sfida (senza fare i furbi!).</p>
      </header>

      <div className="page-container">
        <div className="rules-section">
          <h3>🍻 Cos'è sta roba?</h3>
          <p>
            BeerDex è fondamentalmente l'album Panini delle birre. Invece dei calciatori, collezioni le birre che bevi. L'obiettivo è semplice: provi una birra nuova, la scansioni, sblocchi la figurina e accumuli punti per salire in classifica e bullarti con gli amici al bancone.
          </p>
        </div>

        <div className="rules-section">
          <h3>🏆 Gradi al Bancone</h3>
          <p>Più punti accumuli, più sali di livello. Ecco i gradi che puoi sbloccare:</p>
          <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              🍺 <strong>Novizio del Pub</strong> (&lt; 10 punti): Hai appena iniziato a bagnarti le labbra.
            </li>
            <li>
              🍺 <strong>Apprendista Bevitore</strong> (10-49 punti): Inizi a distinguere una bionda da una rossa.
            </li>
            <li>
              🍺 <strong>Esploratore di Luppoli</strong> (50-99 punti): La birra del discount non ti basta più.
            </li>
            <li>
              🍺 <strong>Sommelier del Bancone</strong> (100-199 punti): Ormai sei quello che dà i consigli a tutti.
            </li>
            <li>
              👑 <strong>Maestro Birraio</strong> (200+ punti): Il bancone è letteralmente casa tua. Leggenda.
            </li>
          </ul>
        </div>

        <div className="rules-section">
          <h3>⭐ Punti e Rarità</h3>
          <p>Ogni birra sbloccata ti dà dei punti in base a quanto è rara:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Comune (1 punto):</strong> Birre commerciali diffuse (es. Heineken, Moretti, Peroni, Corona, Best Brau).
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Media (2 punti):</strong> Birre speciali o artigianali molto note (es. Ceres, Leffe, Ichnusa, Tennent's).
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Rara (5 punti):</strong> Birre trappiste o artigianali di nicchia (es. Baladin, Tripel Karmeliet, Chimay, Crak).
            </li>
          </ul>
          <p>
            🎁 <strong>Bonus Completa Marchio</strong>: Se sblocchi <strong>tutte</strong> le varianti di un singolo brand (ad esempio tutte le varianti di Menabrea), ottieni subito un bonus extra di <strong>+10 Punti</strong>!
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
          <h3>🏅 Medaglie Stagionali</h3>
          <p>Ci sono delle medaglie speciali che puoi sbloccare solo in determinati periodi dell'anno:</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>San Patrizio (Marzo):</strong> Sblocca almeno 2 varianti di Guinness o Stout scure durante il mese di marzo.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Solstizio d'Estate (Giugno-Agosto):</strong> Trova e registra almeno 3 birre chiare fresche o IPA sotto il sole estivo.
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Oktoberfest (Settembre-Oktober):</strong> Registra almeno 3 birre tedesche (es. Paulaner, Franziskaner, HB) tra il 1° settembre e il 31 ottobre.
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
