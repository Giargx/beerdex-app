# 🍺 BeerDex

**BeerDex** è una PWA (Progressive Web App) gamificata, scritta in **React 19 + TypeScript + Vite**, progettata per tracciare e collezionare le birre che consumi in giro per il mondo o in compagnia degli amici.

L'applicazione si interfaccia in tempo reale con **Firebase Realtime Database** per la gestione degli utenti, della classifica globale, delle amicizie e di una bacheca social ("Al Pub").

---

## 🚀 Caratteristiche Principali

### 🏠 Home View "Pub Luxury" & Hub Missioni
* **Design Luxury Glassmorphism**: Interfaccia ridisegnata con stile pub di lusso, saluto dinamico in base all'orario (*"Buongiorno ☕"*, *"Buon pomeriggio 🍺"*, *"Buona serata al pub! 🌙"*), e barra di avanzamento Livello/XP.
* **Hub Missioni del Pub**: 3 sfide giornaliere con badge di completamento e premi in XP.
* **La Spina del Giorno**: Schede di raccomandazione birre con filtri per stile (*Top*, *Rara*, *Estera*).
* **Attività al Bancone**: Carosello interattivo delle bevute degli amici con pulsante *"Brinda 🍻"* e animazione toast in tempo reale.
* **Dock Azioni Rapide**: Barra galleggiante per sblocco, esplorazione, classifica e mappa.

### 📱 Esperienza Mobile e Navigazione Nativa-style
* **Slider a Scorrimento Fluido (Touch-Drag)**: Navigazione orizzontale fluida tra le 5 tab principali (*Home*, *Esplora*, *Classifica*, *Pub* e *Profilo*) trascinando le pagine con il dito. Uno snapping intelligente allinea la vista al rilascio del tocco. Le sotto-pagine mantengono la transizione slide-in classica.
* **Scroll Reset & Gesture Exceptions**: La posizione dello scorrimento verticale viene ripristinata in cima alla pagina ad ogni cambio tab. I caroselli orizzontali prevengono l'intercettazione dello swipe delle tab.
* **Interazioni Social**: Visualizzazione a griglia dei post dei profili con vista dettaglio a schermo intero. Doppio tocco sull'immagine per mettere like istantaneo con animazione SVG di calici incrociati.

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
* **Medaglie completamento Brand**: Completare tutte le varianti di un singolo brand sblocca la medaglia *"Mastro [Brand]"* con un bonus proporzionale di **+3 Punti per ogni variante** del brand.
* **Medaglie Evento Temporali (2026+)**: Eventi stagionali (Primavera, Estate, Autunno, Inverno) e festività dell'anno in corso mostrati gradualmente nel mese di riferimento.

### 🎨 Grafica Premium e Audio Fisico
* **Interfaccia Pulita & Temi Dinamici**: Temi cromatici personalizzabili basati sullo stile di fermentazione (Pilsner, Amber Ale, Stout, Pale IPA).
* **Audio Clink & Pop**: Emulatore di suoni sintetizzati tramite Web Audio API nativa per il brindisi e lo stappo del tappo a corona.

---

## 🛠️ Stack Tecnologico
* **Core**: React 19 + TypeScript + Vite
* **Database & Auth**: Firebase Realtime Database + Firebase Authentication
* **Mappe**: Leaflet (Beer Radar per posizionare le bevute)
* **Scanner**: Html5-Qrcode + Open Food Facts REST API
* **Audio**: Web Audio API nativa
* **CI/CD**: GitHub Actions (deploy su GitHub Pages) + Vercel integration

---

## 📦 Sviluppo Locale & Configurazione Firebase

### Prerequisiti
* Node.js (v18 o superiore)
* npm

### Installazione ed Avvio Locale
1. Installa le dipendenze:
   ```bash
   npm install
   ```
2. Avvia il server di sviluppo locale (Vite):
   ```bash
   npm run dev
   ```
   > ⚠️ **Nota**: Non aprire direttamente il file `index.html` via `file:///` per evitare blocchi CORS sui moduli JS. Apri l'indirizzo `http://localhost:5173/`.

3. Compila per la produzione:
   ```bash
   npm run build
   ```

### Configurazione Domini & Chiavi API Firebase / Google Cloud
Se riscontri l'errore `auth/requests-from-referer-...-are-blocked`:
1. In **Firebase Console ➔ Authentication ➔ Impostazioni ➔ Domini Autorizzati**, aggiungi:
   - `localhost`
   - `giargx.github.io`
2. In **Google Cloud Console ➔ APIs & Services ➔ Credentials ➔ Chiave API Web**, aggiungi ai **Referrer HTTP**:
   - `http://localhost:*`
   - `https://giargx.github.io/*`
   - `https://giargx.github.io/beerdex-app/*`

---

## 🚀 Deploy Automatico (CI/CD)
1. **Vercel** (`beerdex-app.vercel.app`): Rileva i push sul branch `main` e distribuisce l'applicazione in tempo reale sulla radice (`/`).
2. **GitHub Pages** (`giargx.github.io/beerdex-app`): Tramite una GitHub Action configurata in `.github/workflows/deploy.yml`, compila il progetto con il base-path corretto e ne fa il deploy sul branch `gh-pages`./workflows/deploy.yml`, compila il progetto con il base-path corretto e ne fa il deploy sul branch `gh-pages`.
