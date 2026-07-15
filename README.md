# 🍺 BeerDex

**BeerDex** è una PWA (Progressive Web App) gamificata, scritta in **React 19 + TypeScript + Vite**, progettata per tracciare e collezionare le birre che consumi in giro per il mondo o in compagnia degli amici.

L'applicazione si interfaccia in tempo reale con **Firebase Realtime Database** per la gestione degli utenti, della classifica globale, delle amicizie e di una bacheca social ("Al Pub").

---

## 🚀 Caratteristiche Principali

### 📱 Esperienza Mobile e Navigazione Nativa-style
* **Slider a Scorrimento Fluido (Touch-Drag)**: Navigazione orizzontale fluida tra le 5 tab principali (*Home*, *Esplora*, *Classifica*, *Pub* e *Profilo*) trascinando le pagine con il dito. Uno snapping intelligente allinea la vista al rilascio del tocco. Le sotto-pagine mantengono la transizione slide-in classica.
* **Scroll Reset**: La posizione dello scorrimento verticale viene ripristinata in cima alla pagina ogni volta che si cambia tab o si naviga verso una nuova sezione.
* **Interazioni Social**: Visualizzazione a griglia dei post dei profili (personale/pubblico) con visualizzazione a schermo intero dei singoli post tramite scroll verticale continuo. Doppio tocco sull'immagine per mettere like istantaneo con animazione SVG di calici incrociati.

### 📷 Scanner & Sistema Anti-Cheat Avanzato
* **Validazione tramite Barcode**: Integrazione con la libreria `Html5-Qrcode` e le API di **Open Food Facts** per analizzare il codice a barre e convalidare il prodotto inquadrato.
* **Algoritmo di Controllo Oculato**: Verifica multi-livello su ingredienti (orzo, malto, luppolo), categoria di appartenenza e gradazione alcolica, escludendo vini, soft drinks o superalcolici.
* **Controllo di Corrispondenza del Marchio**: Lo scanner si assicura che il codice appartenga al brand selezionato o alla sua controllante (es: *Carlsberg* per *Tuborg*, *Heineken* per *Moretti*), evitando sblocchi ingannevoli.

### 🏆 Gamification, Livelli e Medaglie
* **Gradi di Rango al Bancone**:
  * 🟢 *Novizio del Pub* (< 50 pt)
  * 🟡 *Apprendista Bevitore* (50-199 pt)
  * 🟠 *Esploratore di Luppoli* (200-499 pt)
  * 🔴 *Sommelier del Bancone* (500-1199 pt)
  * 👑 *Mastro Birraio* (1200+ pt)
  * ⚡ **Dio della Birra** (Sblocco del 100% del catalogo dell'app)
* **Medaglie completamento Brand**: Completare tutte le varianti di un singolo brand sblocca la medaglia *"Mastro [Brand]"* con un bonus proporzionale di **+3 Punti per ogni variante** del brand (es. +9pt per 3 varianti, +15pt per 5).
* **Medaglie Evento Temporali (2026+)**:
  * **Gradualità e Calendario**: Vengono generati gli anni dal 2026 fino all'anno corrente. Gli eventi futuri non vengono mostrati e le sfide dell'anno in corso vengono visualizzate gradualmente man mano che si entra nel mese di riferimento.
  * **Eventi Stagionali (+10 Punti, 10 Birre Richieste)**:
    * 🌸 *Primavera* (Mar-Mag): Sblocca 10 birre Bianche (Blanche, Weizen, Saison).
    * ☀️ *Estate* (Giu-Ago): Sblocca 10 birre Bionde o IPA.
    * 🍁 *Autunno* (Set-Nov): Sblocca 10 birre Rosse, IPA o Tedesche.
    * ❄ *Inverno* (Dic-Feb): Sblocca 10 birre Scure o Rosse.
  * **Eventi Festività (+5 Punti, 1 Birra Richiesta - Sblocchi Contemporanei)**:
    * 🎉 *Capodanno* (Gennaio)
    * 💖 *San Valentino* (Febbraio - 1 Rossa o Scura)
    * 🍀 *San Patrizio* (Marzo - 1 Irlandese/Scozzese)
    * 👨 *Festa del Papà* (Marzo - 1 Rara o Media)
    * 🥚 *Pasqua* (Aprile - 1 Belga)
    * 🛠 *Festa del Lavoro* (Maggio - 1 Bionda)
    * 🇮🇹 *Festa della Repubblica* (Giugno - 1 Italiana)
    * 🔥 *Grigliata di Luglio* (Luglio - 1 IPA o Bionda)
    * 🍉 *Ferragosto* (Agosto - 1 qualsiasi)
    * 🍻 *Oktoberfest Start* (Settembre - 1 Tedesca)
    * 🍻 *Oktoberfest End* (Ottobre - 1 Tedesca)
    * 🎃 *Halloween* (Ottobre - 1 Scura o Rossa)
    * 🍁 *Castagnata* (Novembre - 1 Scura o Rossa)
    * 🎄 *Natale* (Dicembre - 1 Rara o Media)
    * 🎆 *Vigilia di Capodanno* (Dicembre - 1 qualsiasi)

### 🎨 Grafica Premium e Audio Fisico
* **Interfaccia Pulita**: Sezioni eleganti con elementi minimali (come il feed "Pub" semplificato con boccale e logo premium).
* **Temi Brewery Dinamici**: Temi cromatici personalizzabili basati sullo stile di fermentazione (Pilsner, Amber Ale, Stout, Pale IPA).
* **Audio Clink & Pop**: Emulatore di suoni sintetizzati tramite Web Audio API nativa per il brindisi e lo stappo del tappo a corona.

---

## 🛠️ Stack Tecnologico
* **Core**: React 19 + TypeScript + Vite
* **Database & Auth**: Firebase Realtime Database + Firebase Authentication
* **Mappe**: Leaflet (Beer Radar per posizionare le bevute)
* **Scanner**: Html5-Qrcode + Open Food Facts REST API
* **Audio**: Web Audio API nativa
* **CI/CD**: GitHub Actions (per deploy automatico su GitHub Pages) + Vercel integration

---

## 📦 Sviluppo Locale

### Prerequisiti
* Node.js (v18 o superiore)
* npm

### Installazione ed Avvio
1. Installa le dipendenze:
   ```bash
   npm install
   ```
2. Avvia il server di sviluppo locale:
   ```bash
   npm run dev
   ```
3. Compila per la produzione:
   ```bash
   npm run build
   ```

---

## 🚀 Deploy Automatico (CI/CD)
1. **Vercel** (`beerdex-app.vercel.app`): Rileva i push sul branch `main` e distribuisce l'applicazione in tempo reale sulla radice (`/`).
2. **GitHub Pages** (`giargx.github.io/beerdex-app`): Tramite una GitHub Action configurata in `.github/workflows/deploy.yml`, compila il progetto con il base-path corretto e ne fa il deploy sul branch `gh-pages`.
