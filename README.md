# 🍺 POP IT — Manuale Tecnico e Guida al Progetto

**POP IT** è una Progressive Web App (PWA) gamificata sviluppata in **React 19 + TypeScript + Vite**, pensata per tracciare, collezionare e condividere la propria passione per le birre in giro per il mondo o in compagnia degli amici.

L'applicazione si sincronizza in tempo reale con **Firebase Realtime Database** per la gestione di utenti, autenticazione, bacheca social ("Al Pub"), sistema di amicizie, sblocco Pokédex e calcolo della classifica globale.

---

## 📋 Indice
1. [Funzionalità Principali](#-funzionalit%C3%A0-principali)
2. [Sistema dei Punti e Formula di Rarità](#-sistema-dei-punti-e-formula-di-rarit%C3%A0)
3. [Algoritmo di Unificazione Card & Deduplicazione](#-algoritmo-di-unificazione-card--deduplicazione)
4. [Catalogo Birre Globale](#-catalogo-birre-globale)
5. [Scanner Anti-Cheat & Codici a Barre](#-scanner-anti-cheat--codici-a-barre)
6. [Bevuta e Proposta in Compagnia](#-bevuta-e-proposta-in-compagnia)
7. [Architettura e Struttura del Codice](#-architettura-e-struttura-del-codice)
8. [Setup e Sviluppo Locale](#-setup-e-sviluppo-locale)
9. [Linee Guida per i Collaboratori](#-linee-guida-per-i-collaboratori)

---

## 🚀 Funzionalità Principali

### 🏠 Home View "Pub Luxury" & Hub Missioni
* **Design Luxury Glassmorphism**: Interfaccia moderna con effetti di vetro smerigliato, temi cromatici dinamici basati sugli stili di fermentazione (Pilsner, Amber Ale, Stout, Pale IPA) e salutatore orario (*"Buongiorno ☕"*, *"Buon pomeriggio 🍺"*, *"Buona serata al pub! 🌙"*).
* **Hub Missioni del Pub**: 3 sfide giornaliere con avanzamento e badge di completamento che conferiscono punti XP.
* **La Spina del Giorno**: Suggerimenti dinamici di birre consigliate con filtri per stile (*Top*, *Rara*, *Estera*).
* **Attività al Bancone**: Carosello interattivo dei post recenti degli amici con pulsante *"Brinda 🍻"* e animazione audio/toast in tempo reale (audio sintetizzato Web Audio API per stappo e brindisi).

### 📱 Navigazione Nativa & Gesture Swipe
* **Slider a Scorrimento Fluido (Touch-Drag)**: Navigazione orizzontale fluida tra le 5 tab principali (*Home*, *Esplora*, *Classifica*, *Pub* e *Profilo*) tramite scorrimento del dito con snapping automatico.
* **Scroll Reset & Safe Touch**: Il movimento verticale si resetta in cima alla pagina ad ogni cambio scheda. I caroselli orizzontali e le modali usano `stopPropagation` per prevenire lo swipe accidentale delle tab.
* **Pulsante "Indietro" Nativo**: Pulsante di navigazione unificato nell'intestazione per tornare alla vista precedente in modo intuitivo.

### 🖼️ Ingrandimento Foto Profilo (Long Press Zoom)
* **Avatar Zooming**: Mantenendo premuto per più di 350ms su qualsiasi foto profilo (nel proprio profilo o in quelli pubblici/classifica), si apre un overlay modale in alta risoluzione dell'avatar.
* **Compatibilità Universale**: Supporta URI `data:`, URL web `http/https` e immagini di sistema. Include una protezione a tempo per evitare la chiusura accidentale al rilascio del dito.

---

## 🧮 Sistema dei Punti e Formula di Rarità

Il punteggio dell'utente è **rigorosamente deterministico** e viene calcolato combinando la rarità delle birre uniche sbloccate nel Pokédex, i bonus di prima marca, le medaglie brand e le medaglie evento.

### 📊 Indice di Rarità Composto ($S = V + P + T$)
Ogni birra viene valutata assegnando da 1 a 3 punti a ciascuno dei seguenti **3 parametri**:

1. **Volume di Produzione Annuale ($V$)**
   * **1 punto**: $> 100.000$ ettolitri/anno *(Industriale/Massa)*
   * **2 punti**: $1.000 - 100.000$ ettolitri/anno *(Medio-grande / Artigianale strutturata)*
   * **3 punti**: $< 1.000$ ettolitri/anno o Batch limitati *(Microbirrifici)*

2. **Diffusione e Distribuzione ($P$)**
   * **1 punto**: Reperibile in qualsiasi supermercato o pub comune
   * **2 punti**: Reperibile in pub specializzati, beershop o locali dedicati
   * **3 punti**: Produzione locale/esclusiva, importazione rara o fuori produzione

3. **Tipologia e Processo di Fermentazione ($T$)**
   * **1 punto**: Lager, Pils, Bionde commerciali standard
   * **2 punti**: IPA, Strong Ale, Weiss, Bock, Birre rosse/ambrate tradizionali
   * **3 punti**: Sour/Lambic a fermentazione spontanea, Imperial Stout, Trappiste, Rifermentate in botte

#### Classificazione di Rarità & Punti Assegnati:
| Punteggio Composto ($S$) | Categoria Rarità | Punti Assegnati per Variante |
| :--- | :--- | :--- |
| **3 - 4 punti** | 🟢 **Comune** | **1 Punto** |
| **5 - 7 punti** | 🟡 **Media** | **2 Punti** |
| **8 - 9 punti** | 🔴 **Rara** | **5 Punti** |

### 🎁 Regole di Assegnazione Punti
* **Prima Birra della Marca (Bonus Nuova Marca)**: Sbloccare la prima birra di un birrificio conferisce un **Bonus di +2 Punti** in aggiunta al valore della rarità.
* **Nuova Variante dello stesso Brand**: Conferisce i punti corrispondenti alla rarità della variante sbloccata.
* **Medaglia Completamento Brand ("Mastro [Brand]")**: Completare tutte le varianti di un brand nel catalogo assegna un **bonus di +3 Punti per ogni variante** del brand.
* **Medaglie Evento (es. Festival / Eventi Stagionali)**: Sbloccate **esclusivamente** al raggiungimento del 100% dell'obiettivo (es. 10/10 birre richieste presenti nel Pokédex). Conferiscono **+10 Punti Bonus**. Se l'utente scende sotto il 100%, la medaglia e i 10 punti vengono automaticamente revocati.
* **Deduplicazione Pokédex**: Registrare più bevute della stessa variante aggiunge i post alla timeline social, ma il Pokédex conteggia la variante una sola volta ai fini del punteggio.

---

## 🔗 Algoritmo di Unificazione Card & Deduplicazione

Per evitare la creazione di card duplicate quando gli utenti propongono nuove birre o registrano marche con grafie leggermente diverse, l'app utilizza una logica avanzata di unificazione in `src/beers.ts`:

1. **Normalizzazione stringhe (`normalizeStr`)**:
   - Rimuove accenti, spazi extra, maiuscole e caratteri speciali.
   - Es. `Abbaye De Forest`, `Abbaye de forest` e `Baia Deforest` vengono riconosciuti come lo stesso birrificio.
2. **Matching Canonico & Alias in `mergeBeers`**:
   - Le birre custom inviate dagli utenti o presenti nel database Firebase vengono automaticamente accorpate alla card ufficiale nel catalogo statico.
   - Le varianti inviate dagli utenti (es. `Brune`, `Blonde`) vengono inserite nell'elenco varianti della card unificata.
3. **Migrazione Automatica al Login**:
   - Al caricamento dell'app, una funzione automatica (`cleanupAndMigrateCustomBeers`) scansiona il Pokédex e la timeline dell'utente, riconverte eventuali vecchie chiavi duplicate nella card unificata canonica e ricalcola il punteggio aggiornato senza che l'utente debba fare nulla o perda foto/punti.
4. **Campo Marca Modificabile nelle Proposte**:
   - Nella finestra *Proponi Nuova Birra*, il campo *"Marca / Birrificio"* pre-compila la ricerca dell'utente ma rimane **sempre modificabile** per birre non ancora presenti a catalogo, consentendo di correggere refusi o maiuscole. Se la marca esiste già, il campo si blocca per proporre una nuova variante.

---

## 🌐 Catalogo Birre Globale

Il catalogo dell'app conta oltre **110 brand internazionali ed artigianali** con più di **350 varianti ufficiali**, organizzati per Nazione e Regione.

### Principali Nazioni e Birrifici inclusi:
* 🇮🇹 **Italia**: Peroni, Moretti, Ichnusa, Menabrea, Birra Messina, Forst, Baladin, Birrificio Italiano, Birrificio Lambrate, Crak Brewery, Del Borgo, Flea, KBirr, Salento, Semedorato, Theresianer, Wuhrer, Mastri Birrai Umbri, Amarcord, Castello, Dreher, Pedavena, Raffo.
* 🇧🇪 **Belgio**: Abbaye de Forest, Chouffe (La Chouffe, Mc Chouffe, Houblon, N'Ice, Soleil, Cherry), Chimay, Duvel, Leffe, Delirium, Grimbergen, Hoegaarden, Kwak, Orval, Rochefort, Rodenbach, Steenbrugge, Stella Artois, Timmermans, Tripel Karmeliet, Tête de Mort, Waterloo, Cornet, Boucanier, Bourgogne des Flandres, Martin's.
* 🇩🇪 **Germania**: Augustiner, Beck's, Erdinger, Franziskaner, Hacker-Pschorr, Hofbräu, Keiler, Krombacher, Löwenbräu, Paulaner, Schneider Weisse, Spaten, Warsteiner, Weihenstephaner, Best Brau, Finkbräu.
* 🇬🇧 / 🏴󠁧󠁢󠁳󠁣󠁴󠁿 **Regno Unito / Scozia**: BrewDog, Bulldog, Loch Lomond, Wold Top, Sheppy's, Slalom, Tennent's.
* 🇺🇸 **Stati Uniti**: Sierra Nevada, Brooklyn Brewery, Founders, Goose Island, Samuel Adams, Blue Moon, Anchor, Lagunitas, Miller, Coors, Pabst Blue Ribbon, Budweiser (USA).
* 🇹🇭 **Thailandia**: Singha, Chang, Leo, Phuket Beer.
* 🇨🇿 **Repubblica Ceca**: Pilsner Urquell, Kozel, Budweiser Budvar, Malastrana.
* 🇲🇽 **Messico**: Corona.
* 🇪🇸 **Spagna**: Estrella Damm, San Miguel, Voll-Damm.
* 🇫🇷 **Francia**: Fischer, Kronenbourg 1664, Pietra (Corsica).
* 🇳🇱 **Paesi Bassi**: Heineken, Bavaria, Grolsch, La Trappe.
* 🇮🇪 **Irlanda**: Guinness.
* 🇩🇰 **Danimarca**: Carlsberg, Ceres, Tuborg.
* 🇵🇹 **Portogallo**: Super Bock.
* 🇯🇵 **Giappone**: Asahi.

---

## 📷 Scanner Anti-Cheat & Codici a Barre

1. **Lettura Fotocamera & API Open Food Facts**:
   - Scansione in tempo reale di codici EAN-13 / UPC tramite `Html5-Qrcode`.
   - Interrogazione dell'API di Open Food Facts per analizzare il prodotto.
2. **Validazione Anti-Cheat su Ingredienti e Categoria**:
   - Analisi automatica su malto, orzo, luppolo e gradazione alcolica.
   - Esclusione immediata di vino, bevande analcoliche, Energy drink e superalcolici.
   - Verifica di corrispondenza tra marca selezionata e produttore/controllante (es. *Moretti* con *Heineken*, *Tuborg* con *Carlsberg*).
3. **Inserimento Manuale del Codice a Barre**:
   - Per gli utenti con fotocamera rotta o non funzionante, nello scanner è disponibile l'opzione di digitazione manuale del codice a barre con la medesima validazione di sicurezza.

---

## 👥 Bevuta e Proposta in Compagnia

* **Proposta in Compagnia ("Tagga Amici")**:
  - Quando si ordina una birra non ancora presente nell'app al pub insieme ad altri utenti, chi invia la proposta può taggare gli amici presenti (`taggedFriends`).
  - **Notifica Unificata Admin**: Gli amministratori ricevono un unico avviso di proposta per evitare duplicati.
  - **Assegnazione Automatica dei Punti**: Alla conferma degli admin, la birra entra nel catalogo e **tutti gli amici taggati sbloccano automaticamente la birra nel Pokédex** ricevendo i relativi punti bonus!

---

## 🏗️ Architettura e Struttura del Codice

```
Progetto biraa/
├── src/
│   ├── main.tsx                   # Entry point React
│   ├── App.tsx                    # Componente principale, stato globale e sincronizzazione Firebase
│   ├── beers.ts                   # Catalogo statico, formule di rarità, mergeBeers e helper
│   ├── firebase.ts                # Configurazione ed inizializzazione Firebase App & Realtime DB
│   ├── components/
│   │   ├── ProposeBeerModal.tsx   # Modale per la proposta di nuove birre e varianti
│   │   ├── AdminProposalsModal.tsx# Dashboard di approvazione/rifiuto proposte per Admin
│   │   ├── TrophyGrid.tsx         # Griglia medaglie e calcolo deterministico trofei evento
│   │   ├── BeerScannerModal.tsx   # Modal scanner codici a barre + inserimento manuale
│   │   ├── Toast.tsx              # Notifiche e brindisi in tempo reale
│   │   └── Navbar.tsx             # Navigation Bar inferiore e gestione tab
│   ├── views/
│   │   ├── HomeView.tsx           # Dashboard "Pub Luxury" & Hub Missioni
│   │   ├── PokedexView.tsx        # Esplora catalogo, filtri e collezioni
│   │   ├── LeaderboardView.tsx    # Classifica globale utenti e gradi al bancone
│   │   ├── PubView.tsx            # Bacheca social "Al Pub" (Timeline, post, brindisi, stories)
│   │   ├── ProfileView.tsx        # Profilo utente personale, Pokédex sbloccato e statistiche
│   │   ├── PublicProfileView.tsx  # Profilo pubblico degli altri utenti e confronto
│   │   └── FriendsView.tsx        # Gestione amici, richieste inviate/ricevute
│   └── utils/
│       ├── textFilter.ts          # Moderazione parole ed espressioni non appropriate
│       └── imageModeration.ts     # Analisi di sicurezza sulle immagini caricate
├── public/                        # Asset statici, icona PWA e manifesto
├── package.json                   # Dipendenze del progetto (React 19, Vite, Firebase, Leaflet)
├── vite.config.ts                 # Configurazione build Vite
└── README.md                      # Questo documento di contesto
```

---

## 📦 Setup e Sviluppo Locale

### Prerequisiti
- **Node.js** (v18.0.0 o superiore)
- **npm** (v9.0.0 o superiore)

### Comandi per lo Sviluppo Locale
1. Clona il repository ed entra nella cartella di progetto:
   ```bash
   git clone https://github.com/Giargx/popit-app.git
   cd popit-app
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo locale:
   ```bash
   npm run dev
   ```
   L'applicazione sarà disponibile su `http://localhost:5173/`.

4. Verifica e Compilazione di Produzione (TypeScript + Vite):
   ```bash
   npm run build
   ```

---

## 🤝 Linee Guida per i Collaboratori (Sviluppo a 3 PC)

Quando lavori al progetto da un altro computer o prima di inviare nuove modifiche su GitHub:

1. **Esegui sempre `git pull` prima di iniziare**:
   ```bash
   git pull origin main
   ```
2. **Verifica il Build prima di ogni commit**:
   Esegui sempre `npm run build` per assicurarti che non ci siano errori di sintassi TypeScript o librerie mancanti.
3. **Preserva l'Immutabilità dei Punteggi e delle Rarità**:
   Quando aggiungi nuove birre in `src/beers.ts`, mantieni sempre la struttura ordinata alfabeticamente per `brand` ed applica il **criterio di rarità composto ($S = V + P + T$)**.
4. **Gestione Nuovi Elementi Interattivi & Touch Swipe**:
   Se aggiungi nuovi pulsanti, schede o card scorrevoli che l'utente può toccare o trascinare, assicurati di aggiungere la relativa classe o selettore al controllo `.closest(...)` in `App.tsx` per evitare che lo swipe orizzontale delle tab intercetti il tocco.
