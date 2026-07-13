# 🍺 BeerDex

**BeerDex** è una Progressive Web App (PWA) gamificata, interamente riscritta in **React 18 + TypeScript + Vite**, progettata per tracciare e collezionare le birre che bevi in giro per il mondo o in compagnia dei tuoi amici.

L'applicazione si interfaccia in tempo reale con **Firebase Realtime Database** per la gestione degli utenti, della classifica globale, delle amicizie e di una bacheca social ("Al Pub").

---

## 🚀 Caratteristiche Principali

### 📷 Sistema di Sblocco & Anti-Cheat Avanzato
* **Validazione tramite Codice a Barre**: L'app si collega alle API globali di **Open Food Facts** per analizzare il codice a barre delle bottiglie fotografate.
* **Controllo "È una birra?"**: Algoritmo multi-fattore che analizza tag di categoria, ingredienti (orzo, luppolo, malto), presenza di alcol escludendo superalcolici/vino, e brand conosciuti.
* **Verifica di Corrispondenza Brand**: Selezionando una marca specifica, lo scanner si assicura che il codice a barre appartenga a quel marchio o a una sua controllante (es: *Carlsberg* per *Tuborg*, *Heineken* per *Ichnusa/Moretti*), prevenendo i tentativi di sblocco fraudolenti.
* **Blocco Rigido**: Se viene inquadrato un prodotto non valido (es: una bottiglia d'acqua) o una birra di un brand differente, lo sblocco viene annullato all'istante. Il bypass per i prodotti non catalogati è riservato solo a birre locali e artigianali non presenti nel database globale.

### 🔊 Effetti Sonori Fisici (Audio Synthesizer)
L'applicazione integra un sintetizzatore audio nativo basato su **Web Audio API** che non richiede il download di file multimediali esterni ed è attivo al 100% offline:
* **Suono del Brindisi (Clink)**: Due frequenze sinusoidali ad alta definizione con decadimento esponenziale che riproducono fedelmente l'impatto di due bicchieri.
* **Suono dello Stappo (Pop & Fizz)**: Una simulazione a spettro misto (sweep sinusoidale per la pressione + burst di rumore bianco filtrato passa-alto per l'effervescenza) che riproduce l'apertura di una bottiglia.

### 📊 Statistiche e Infografiche
Una sezione del profilo interamente dedicata alle statistiche personali con:
* Percentuale di completamento totale del catalogo delle birre.
* Grafico a barre colorate per la distribuzione delle rarità (Comune, Media, Rara).
* Elenco ordinato con barre di completamento per ciascuna Nazione.

### 🏆 Traguardi e Medaglie Speciali (Achievements)
Sistema di obiettivi sbloccabili in tempo reale in base alla tua collezione:
* 🌍 **Giro del Mondo**: Sblocca birre provenienti da almeno 5 nazioni diverse.
* ✨ **Collezionista Shiny**: Trova la tua prima variante Shiny all'avventura.
* 🥇 **Monarca delle Bionde**: Colleziona almeno 15 varianti comuni.
* 💎 **Leggenda dei Pub**: Colleziona almeno 5 varianti rare.
* 🤝 **Socio Onorario**: Tagga un amico in uno sblocco di gruppo.
* 🎓 **Sommelier Esperto**: Sblocca almeno 3 varianti diverse di uno stesso brand.

### 🎨 Temi Cromatici Dinamici (Brewery Themes)
L'utente può personalizzare i colori di accento dell'interfaccia direttamente dal profilo scegliendo un tema ispirato alle tipologie di birra:
* 🍺 **Pilsner (Classic)**: Il classico colore giallo dorato.
* 🍁 **Amber Ale**: Rosso ambrato caldo.
* ☕ **Stout (Dark)**: Marrone intenso per gli amanti della birra scura.
* 🌿 **Pale IPA**: Verde brillante ispirato al luppolo.

### 🗺️ Mappa Interattiva (Beer Radar)
Una mappa basata su **Leaflet** che rileva la posizione GPS dell'utente per tracciare geograficamente tutti i luoghi in cui ha sbloccato le sue birre, mostrando foto e dettagli per ogni marker.

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
