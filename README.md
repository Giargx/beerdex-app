# 🍺 BeerDex

**BeerDex** è una Progressive Web App (PWA) gamificata, interamente riscritta in **React 18 + TypeScript + Vite**, progettata per tracciare e collezionare le birre che bevi in giro per il mondo o in compagnia dei tuoi amici.

L'applicazione si interfaccia in tempo reale con **Firebase Realtime Database** per la gestione degli utenti, della classifica globale, delle amicizie e di una bacheca social ("Al Pub").

---

## 🚀 Caratteristiche Principali

### 📷 Sistema di Sblocco & Anti-Cheat Avanzato
* **Validazione tramite Codice a Barre**: L'app si collega alle API globali di **Open Food Facts** per analizzare il codice a barre delle bottiglie fotografate.
* **Controllo "È una birra?"**: Algoritmo multi-fattore che analizza tag di categoria, ingredienti (orzo, luppolo, malto), presenza di alcol escludendo superalcolici/vino, e brand conosciuti.
* **Verifica di Corrispondenza Brand**: Selezionando una marca specifica, lo scanner si assicura che il codice a barre appartenga a quel marchio o a una sua controllante (es: *Carlsberg* per *Tuborg*, *Heineken* per *Ichnusa/Moretti*), prevenendo i tentativi di sblocco fraudolenti.
* **Blocco Rigido**: Se viene inquadrato un prodotto non valido o una birra di un brand differente, lo sblocco viene annullato. Il bypass per i prodotti non catalogati è riservato solo a birre locali e artigianali non presenti nel database globale.

### 📱 Esperienza Social & Feed Verticale "Instagram-Style"
* **Navigazione Profilo**: Griglia dei post nel profilo personale e pubblico con la possibilità di cliccare su qualsiasi foto per aprirla in una nuova vista verticale a scorrimento (con scroll automatico al post selezionato).
* **Interazioni Rapide**: Like immediato tramite doppio tocco sull'immagine con animazione nativa SVG di brindisi a calici incrociati.
* **Profili Navigabili da Ovunque**: Cliccando sull'avatar o sul nome di un utente all'interno del feed social, della classifica o delle liste di amici, verrai reindirizzato direttamente sul suo profilo pubblico.

### 💡 Dashboard Collezionista & Suggerimento Settimanale
* **Statistiche Rapide**: Visualizzazione immediata di tre metriche cardine sulla Home: Birre Sbloccate, Varianti Shiny collezionate e Paesi d'origine scoperti.
* **Consigliata della Settimana**: Algoritmo deterministico settimanale che seleziona e propone una birra dal catalogo non ancora sbloccata dall'utente, invogliandolo a completare la collezione.

### 🗺️ Mappa GPS & Filtri Regionali
* **Beer Radar (Leaflet)**: Rilevamento della posizione GPS per mappare geograficamente gli sblocchi in tempo reale con pop-up fotografici personalizzati.
* **Filtro Regioni Italiane**: Sotto-filtro dinamico nella pagina di ricerca: selezionando "Italia", compare un menu secondario che permette di filtrare le birre locali per regione di produzione (es. Campania, Lombardia, Sicilia, Toscana, ecc.).

### 🏆 Traguardi, Livelli & Medaglie Temporali
* **Fasce di Rango Collezionista**:
  * 🟢 *Novizio del Pub* (< 50 pt)
  * 🟡 *Apprendista Bevitore* (50-199 pt)
  * 🟠 *Esploratore di Luppoli* (200-499 pt)
  * 🔴 *Sommelier del Bancone* (500-1199 pt)
  * 👑 *Maestro Birraio* (1200+ pt)
* **Medaglie Brand**: Sbloccabili collezionando determinati stili, rarità o brand specifici.
* **Medaglie Evento (Sblocco per Anno)**:
  * 🍀 **San Patrizio**: 2 birre irlandesi o scozzesi sbloccate a Marzo.
  * ☀️ **Solstizio d'Estate**: 3 birre bionde o IPA sbloccate tra Giugno e Agosto.
  * 🍺 **Oktoberfest**: 3 birre tedesche sbloccate tra Settembre e Ottobre.

### 🎨 Grafica & Personalizzazione Brewery
* **Brewery Lettering SVG**: Titolo "Pub" animato nel feed con lettere che ricordano calici, boccali e botti con bollicine dinamiche.
* **Temi Cromatici Dinamici**: Scegli il tuo stile cromatico in base al tipo di fermentazione: Pilsner (Giallo Dorato), Amber Ale (Rosso Ambrato), Stout (Marrone Intenso) o Pale IPA (Verde Luppolo).
* **Effetti Sonori Fisici**: Synth audio tramite Web Audio API che emula in modo fedele il brindisi ("clink") e lo stappo ("pop & fizz").

---

## 🛠️ Stack Tecnologico
* **Core**: React 18 + TypeScript + Vite
* **Database & Auth**: Firebase Realtime Database + Firebase Authentication
* **Libreria Mappe**: Leaflet
* **Lettura Codici a Barre**: Html5-Qrcode (con validazione su Open Food Facts API)
* **Audio**: Web Audio API nativa
* **Deployment**: GitHub Actions (per deploy automatico su GitHub Pages) + Vercel integration

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
Il progetto è configurato per il deploy automatico su due canali:
1. **Vercel** (`beerdex-app.vercel.app`): Rileva i push sul branch `main` e distribuisce l'applicazione in tempo reale sulla radice (`/`).
2. **GitHub Pages** (`giargx.github.io/beerdex-app`): Tramite una GitHub Action configurata in `.github/workflows/deploy.yml`, compila il progetto con il base-path corretto e ne fa il deploy sul branch `gh-pages`.
