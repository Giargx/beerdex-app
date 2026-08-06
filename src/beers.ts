export interface Beer {
  brand: string;
  country: string;
  flag: string;
  rarity: "comune" | "media" | "rara";
  desc: string;
  variants: string[];
  barcodes?: string[];
  regione?: string;
}

export const beers: Beer[] = [
  { brand: "Affligem", country: "Belgio", flag: "BE", rarity: "media", desc: "Storica birra d'abbazia belga ad alta fermentazione.", variants: ["Blonde", "Double", "Triple"], barcodes: [] },
  { brand: "Asahi", country: "Giappone", flag: "JP", rarity: "comune", desc: "La lager super dry giapponese più famosa al mondo.", variants: ["Super Dry"], barcodes: [] },
  { brand: "Augustiner", country: "Germania", flag: "DE", rarity: "media", desc: "Storico birrificio di Monaco di Baviera.", variants: ["Lagerbier Hell", "Edelstoff", "Maximator"], barcodes: [] },
  { brand: "Baladin", country: "Italia", regione: "Piemonte", flag: "IT", rarity: "rara", desc: "Pioniere della birra artigianale italiana.", variants: ["Isaac (Blanche)", "Wayan (Saison)", "Nora (Speziata)", "Super Bitter", "Leon", "Nazionale", "L'IPPA", "Rock'n'Roll"], barcodes: [] },
  { brand: "Bavaria", country: "Paesi Bassi", flag: "NL", rarity: "comune", desc: "Marchio olandese noto per la linea 8.6.", variants: ["Premium Pilsner", "8.6 Original", "8.6 Red", "8.6 Gold", "8.6 Extreme"], barcodes: [] },
  { brand: "Beck's", country: "Germania", flag: "DE", rarity: "comune", desc: "Classica pilsner tedesca (Brema).", variants: ["Pilsner", "Blue (Analcolica)", "Lemon", "Green Lemon", "Unfiltered"], barcodes: [] },
  { brand: "Best Brau", country: "Germania", flag: "DE", rarity: "comune", desc: "Birra commerciale diffusa nei supermercati.", variants: ["Premium Pils", "Doppio Malto", "Rossa", "Weiss"], barcodes: [] },
  { brand: "Birrificio Italiano", country: "Italia", regione: "Lombardia", flag: "IT", rarity: "rara", desc: "Storico birrificio artigianale lombardo.", variants: ["Tipopils", "Bibock", "Nigredo", "Vudù", "Amber Shock"], barcodes: [] },
  { brand: "Birrificio Lambrate", country: "Italia", regione: "Lombardia", flag: "IT", rarity: "rara", desc: "Il birrificio simbolo di Milano e del fermento artigianale.", variants: ["Montestella", "Sant'Ambroeus", "Ghisa", "Porpora", "Quarantot"], barcodes: [] },
  { brand: "Birrificio Messina", country: "Italia", regione: "Sicilia", flag: "IT", rarity: "comune", desc: "Birrificio cooperativo siciliano che produce la celebre Birra dello Stretto.", variants: ["Doc 15", "Birra dello Stretto"], barcodes: [] },
  { brand: "BrewDog", country: "Scozia", flag: "GB-SCT", rarity: "media", desc: "Birrificio artigianale scozzese famoso in tutto il mondo.", variants: ["Punk IPA", "Elvis Juice", "Hazy Jane"], barcodes: [] },
  { brand: "Budweiser (USA)", country: "Stati Uniti", flag: "US", rarity: "comune", desc: "La famosissima lager americana, 'The King of Beers'.", variants: ["Lager"], barcodes: [] },
  { brand: "Budweiser Budvar", country: "Repubblica Ceca", flag: "CZ", rarity: "media", desc: "L'autentica lager ceca protetta.", variants: ["Original Lager", "Dark Lager", "Nealko"], barcodes: [] },
  { brand: "Carlsberg", country: "Danimarca", flag: "DK", rarity: "comune", desc: "Colosso industriale danese.", variants: ["Pilsner", "Elephant", "Special Brew"], barcodes: [] },
  { brand: "Castello", country: "Italia", regione: "Friuli-Venezia Giulia", flag: "IT", rarity: "comune", desc: "Erede dello storico stabilimento di Udine.", variants: ["La Decisa", "L'Intensa", "La Forte", "Radler"], barcodes: [] },
  { brand: "Ceres", country: "Danimarca", flag: "DK", rarity: "comune", desc: "Marchio danese diventato un cult in Italia per le strong ale.", variants: ["Strong Ale", "Red Erik", "Extreme Ten"], barcodes: [] },
  { brand: "Chimay", country: "Belgio", flag: "BE", rarity: "rara", desc: "Autentica birra trappista belga prodotta dai monaci.", variants: ["Première (Rossa)", "Cinq Cents (Tripel)", "Grande Réserve (Blu)"], barcodes: [] },
  { brand: "Chouffe", country: "Belgio", flag: "BE", rarity: "rara", desc: "La celebre birra artigianale belga dello gnomo.", variants: ["La Chouffe (Blonde)", "Mc Chouffe (Brune)", "Cherry Chouffe"], barcodes: [] },
  { brand: "Corona", country: "Messico", flag: "MX", rarity: "comune", desc: "La lager messicana famosa in tutto il mondo.", variants: ["Extra", "Cero"], barcodes: [] },
  { brand: "Crak Brewery", country: "Italia", regione: "Veneto", flag: "IT", rarity: "rara", desc: "Rivoluzionario birrificio veneto, re indiscusso delle IPA.", variants: ["Guerrilla (IPA)", "Mundaka", "Mansueto", "After Summer"], barcodes: [] },
  { brand: "Del Borgo", country: "Italia", regione: "Lazio", flag: "IT", rarity: "rara", desc: "Famoso birrificio laziale, noto per le sue ricette creative.", variants: ["ReAle", "Duchessa", "My Antonia", "Lisa", "Cortigiana"], barcodes: [] },
  { brand: "Delirium", country: "Belgio", flag: "BE", rarity: "rara", desc: "Famosissima Strong Ale belga.", variants: ["Tremens", "Nocturnum", "Red"], barcodes: [] },
  { brand: "Desperados", country: "Francia", flag: "FR", rarity: "comune", desc: "Birra bionda aromatizzata alla tequila.", variants: ["Original", "Lime", "Mojito"], barcodes: [] },
  { brand: "Dreher", country: "Italia", regione: "Friuli-Venezia Giulia", flag: "IT", rarity: "comune", desc: "Uno dei marchi storici più antichi, fondato a Trieste.", variants: ["Classica", "Radler Limone"], barcodes: [] },
  { brand: "Duvel", country: "Belgio", flag: "BE", rarity: "rara", desc: "La leggendaria Strong Gold Ale belga.", variants: ["Original Blond", "Triple Hop", "6.66"], barcodes: [] },
  { brand: "Erdinger", country: "Germania", flag: "DE", rarity: "comune", desc: "Il birrificio di frumento più grande del mondo.", variants: ["Weißbier", "Dunkel", "Pikantus"], barcodes: [] },
  { brand: "Estrella Damm", country: "Spagna", flag: "ES", rarity: "comune", desc: "La bionda di Barcellona.", variants: ["Estrella Damm", "Inedit", "Daura"], barcodes: [] },
  { brand: "Finkbräu", country: "Germania", flag: "DE", rarity: "comune", desc: "Birra bionda commerciale molto popolare nei discount.", variants: ["Pilsner", "Analcolica"], barcodes: [] },
  { brand: "Fischer", country: "Francia", flag: "FR", rarity: "media", desc: "Birra alsaziana dal caratteristico tappo meccanico.", variants: ["Tradition", "Blonde"], barcodes: [] },
  { brand: "Flea", country: "Italia", regione: "Umbria", flag: "IT", rarity: "rara", desc: "Birre artigianali umbre brassate con acqua di sorgente.", variants: ["Costanza", "Bianca Lancia", "Federico II", "Bastola", "Violante"], barcodes: [] },
  { brand: "Forst", country: "Italia", regione: "Trentino-Alto Adige", flag: "IT", rarity: "comune", desc: "Birrificio indipendente del Trentino-Alto Adige.", variants: ["Kronen", "V.I.P. Pils", "1857", "Felsenkeller", "Sixtus (Doppelbock)", "0.0%"], barcodes: [] },
  { brand: "Franziskaner", country: "Germania", flag: "DE", rarity: "comune", desc: "Eccellenza tedesca di birre di frumento.", variants: ["Weissbier Naturtrüb", "Weissbier Dunkel"], barcodes: [] },
  { brand: "Grimbergen", country: "Belgio", flag: "BE", rarity: "media", desc: "Famosa birra d'abbazia belga con il simbolo della fenice.", variants: ["Blonde", "Double (Ambrée)", "Blanche", "Triple"], barcodes: [] },
  { brand: "Grolsch", country: "Paesi Bassi", flag: "NL", rarity: "comune", desc: "Iconica lager olandese.", variants: ["Premium Pilsner", "Radler"], barcodes: [] },
  { brand: "Guinness", country: "Irlanda", flag: "IE", rarity: "comune", desc: "La regina delle Stout irlandesi.", variants: ["Draught", "Extra Stout", "Hop House 13", "0.0"], barcodes: [] },
  { brand: "Hacker-Pschorr", country: "Germania", flag: "DE", rarity: "media", desc: "Storico marchio monacense dell'Oktoberfest.", variants: ["Münchner Hell", "Weisse", "Oktoberfest Märzen"], barcodes: [] },
  { brand: "Heineken", country: "Paesi Bassi", flag: "NL", rarity: "comune", desc: "Il colosso olandese di Amsterdam.", variants: ["Original", "Silver", "0.0"], barcodes: [] },
  { brand: "Hoegaarden", country: "Belgio", flag: "BE", rarity: "media", desc: "La regina delle birre bianche belghe.", variants: ["Witbier", "Rosée"], barcodes: [] },
  { brand: "Hofbräu", country: "Germania", flag: "DE", rarity: "media", desc: "Il leggendario birrificio della HB di Monaco.", variants: ["Original", "Münchner Weisse", "Schwarze Weisse", "Dunkel"], barcodes: [] },
  { brand: "Ichnusa", country: "Italia", regione: "Sardegna", flag: "IT", rarity: "comune", desc: "L'iconica birra sarda, amatissima in tutta Italia.", variants: ["Classica", "Non Filtrata", "Cruda", "Ambra Limpidissima", "Radler", "Metodo Lento"], barcodes: [] },
  { brand: "Kozel", country: "Repubblica Ceca", flag: "CZ", rarity: "comune", desc: "Famosissima birra ceca.", variants: ["Premium Lager", "Dark (Cerna)"], barcodes: [] },
  { brand: "Krombacher", country: "Germania", flag: "DE", rarity: "comune", desc: "Una delle pilsner tedesche più vendute e apprezzate.", variants: ["Pils", "Weizen", "Dunkel"], barcodes: [] },
  { brand: "Kronenbourg 1664", country: "Francia", flag: "FR", rarity: "comune", desc: "Il marchio francese più venduto al mondo.", variants: ["Blanc", "Lager"], barcodes: [] },
  { brand: "Kwak", country: "Belgio", flag: "BE", rarity: "rara", desc: "Famosa per il suo iconico bicchiere a clessidra e l'alto grado alcolico.", variants: ["Pauwel Kwak", "Rouge"], barcodes: [] },
  { brand: "La Trappe", country: "Paesi Bassi", flag: "NL", rarity: "rara", desc: "La celebre birra trappista olandese prodotta all'abbazia di Koningshoeven.", variants: ["Blond", "Dubbel", "Tripel", "Quadrupel", "Witte Trappist"], barcodes: [] },
  { brand: "Leffe", country: "Belgio", flag: "BE", rarity: "comune", desc: "La storica birra d'abbazia belga.", variants: ["Blonde", "Brune", "Rituel 9°", "Rouge", "Triple"], barcodes: [] },
  { brand: "Löwenbräu", country: "Germania", flag: "DE", rarity: "comune", desc: "Storica birra monacense del leone.", variants: ["Original", "Oktoberfestbier", "Triumphator"], barcodes: [] },
  { brand: "Mastri Birrai Umbri", country: "Italia", regione: "Umbria", flag: "IT", rarity: "rara", desc: "Realtà umbra che esalta i cereali del territorio.", variants: ["Cotta 21 (Bionda)", "Cotta 37 (Rossa)", "Cotta 74 (Nera)", "Cotta 68 (IPA)", "Cotta 50 (Weiss)"], barcodes: [] },
  { brand: "Menabrea", country: "Italia", regione: "Piemonte", flag: "IT", rarity: "comune", desc: "Pluripremiato birrificio di Biella (Piemonte).", variants: ["Bionda 150°", "Ambrata", "Non Filtrata", "Strong", "Weiss", "Rossa"], barcodes: [] },
  { brand: "Messina", country: "Italia", regione: "Sicilia", flag: "IT", rarity: "comune", desc: "Storico marchio siciliano dai sapori del Mediterraneo.", variants: ["Ricetta Classica", "Cristalli di Sale", "Vivace"], barcodes: [] },
  { brand: "Moretti", country: "Italia", regione: "Friuli-Venezia Giulia", flag: "IT", rarity: "comune", desc: "Storico marchio nato in Friuli-Venezia Giulia.", variants: ["Ricetta Originale", "Baffo d'Oro", "La Rossa", "Filtrata a Freddo", "IPA", "Bianca", "Zero", "Lunga Maturazione"], barcodes: [] },
  { brand: "Orval", country: "Belgio", flag: "BE", rarity: "rara", desc: "Una delle birre trappiste più singolari e complesse, rifermentata con lieviti selvaggi Brettanomyces.", variants: ["Trappist Ale"], barcodes: [] },
  { brand: "Paulaner", country: "Germania", flag: "DE", rarity: "comune", desc: "Grande protagonista dell'Oktoberfest.", variants: ["Hefe-Weißbier Naturtrüb", "Oktoberfest Bier", "Münchner Hell", "Salvator"], barcodes: [] },
  { brand: "Pedavena", country: "Italia", regione: "Veneto", flag: "IT", rarity: "comune", desc: "Antica tradizione bellunese (Veneto).", variants: ["Pils", "Lager", "Speciale", "Bock", "8 Gradi"], barcodes: [] },
  { brand: "Peroni", country: "Italia", regione: "Lazio", flag: "IT", rarity: "comune", desc: "Il colosso romano, celebre a livello internazionale.", variants: ["Classica", "Nastro Azzurro", "Nastro Azzurro 0.0", "Non Filtrata", "Cruda", "Gran Riserva Puro Malto", "Gran Riserva Doppio Malto", "Gran Riserva Rossa", "Gran Riserva Bianca", "Chill Lemon", "Capri"], barcodes: [] },
  { brand: "Pilsner Urquell", country: "Repubblica Ceca", flag: "CZ", rarity: "comune", desc: "La madre di tutte le birre bionde.", variants: ["Original Lager"], barcodes: [] },
  { brand: "Poretti", country: "Italia", regione: "Lombardia", flag: "IT", rarity: "comune", desc: "Realtà lombarda che classifica le birre coi luppoli.", variants: ["3 Luppoli", "4 Luppoli Originale", "4 Luppoli Non Filtrata", "5 Luppoli Bock", "6 Luppoli Rossa", "7 Luppoli", "8 Luppoli", "Le 9 Luppoli (IPA)"], barcodes: [] },
  { brand: "Raffo", country: "Italia", regione: "Puglia", flag: "IT", rarity: "comune", desc: "La 'birra dei due mari', simbolo della città di Taranto.", variants: ["Classica", "Lavorazione Grezza"], barcodes: [] },
  { brand: "Rochefort", country: "Belgio", flag: "BE", rarity: "rara", desc: "Birra trappista belga di straordinaria complessità aromatica.", variants: ["6 (Red Cap)", "8 (Green Cap)", "10 (Blue Cap)", "Triple Extra"], barcodes: [] },
  { brand: "Salento", country: "Italia", regione: "Puglia", flag: "IT", rarity: "rara", desc: "Eccellenza artigianale pugliese, nata a Leverano (Lecce).", variants: ["Agricola (Lager)", "Nuda e Cruda", "Beggia", "Taranta (IPA)"], barcodes: [] },
  { brand: "San Miguel", country: "Spagna", flag: "ES", rarity: "comune", desc: "Marchio spagnolo popolarissimo.", variants: ["Especial", "Selecta", "0,0"], barcodes: [] },
  { brand: "Schneider Weisse", country: "Germania", flag: "DE", rarity: "rara", desc: "Birrificio bavarese specializzato in eccezionali birre di frumento.", variants: ["TAP7 Original", "TAP6 Aventinus", "TAP1 Helle Weisse", "TAP5 Meine Hopfenweisse"], barcodes: [] },
  { brand: "Semedorato", country: "Italia", regione: "Sicilia", flag: "IT", rarity: "rara", desc: "Birra artigianale premium siciliana.", variants: ["Bionda Premium", "Rossa Doppio Malto", "Non Filtrata"], barcodes: [] },
  { brand: "Slalom", country: "Scozia", flag: "GB-SCT", rarity: "media", desc: "Strong Lager scozzese, popolarissima nei pub italiani.", variants: ["Strong"], barcodes: [] },
  { brand: "Spaten", country: "Germania", flag: "DE", rarity: "comune", desc: "Storico birrificio di Monaco di Baviera, creatore dello stile Münchner Hell.", variants: ["Münchner Hell", "Premium Lager", "Oktoberfestbier"], barcodes: [] },
  { brand: "Stella Artois", country: "Belgio", flag: "BE", rarity: "comune", desc: "Premium lager belga.", variants: ["Premium Lager", "Unfiltered", "0.0"], barcodes: [] },
  { brand: "Super Bock", country: "Portogallo", flag: "PT", rarity: "comune", desc: "La birra più famosa del Portogallo.", variants: ["Original", "Abadia", "Stout"], barcodes: [] },
  { brand: "Tennent's", country: "Scozia", flag: "GB-SCT", rarity: "comune", desc: "Storico marchio scozzese.", variants: ["Super", "Extra", "1885 Lager", "Scotch Ale"], barcodes: [] },
  { brand: "Theresianer", country: "Italia", regione: "Veneto", flag: "IT", rarity: "comune", desc: "Storico marchio triestino rinato come eccellenza artigianale in Veneto.", variants: ["Premium Pilsner", "Strong Ale", "Bock", "Witbier", "IPPA"], barcodes: [] },
  { brand: "Tripel Karmeliet", country: "Belgio", flag: "BE", rarity: "rara", desc: "Straordinaria birra belga ai tre cereali.", variants: ["Tripel"], barcodes: [] },
  { brand: "Tuborg", country: "Danimarca", flag: "DK", rarity: "comune", desc: "Lager danese leggera.", variants: ["Green", "Strong", "Red"], barcodes: [] },
  { brand: "Voll-Damm", country: "Spagna", flag: "ES", rarity: "media", desc: "La famosa Märzen a doppio malto prodotta a Barcellona.", variants: ["Märzen"], barcodes: [] },
  { brand: "Warsteiner", country: "Germania", flag: "DE", rarity: "comune", desc: "Popolarissima pilsner tedesca premium.", variants: ["Premium Verum", "Double Hops", "Analcolica"], barcodes: [] },
  { brand: "Weihenstephaner", country: "Germania", flag: "DE", rarity: "rara", desc: "Il più antico marchio di birra al mondo (1040).", variants: ["Hefe Weissbier", "Vitus", "Original Hell"], barcodes: [] },
  { brand: "Westmalle", country: "Belgio", flag: "BE", rarity: "rara", desc: "La madre di tutte le Tripel trappiste belghe.", variants: ["Dubbel", "Tripel", "Extra"], barcodes: [] },
  { brand: "Wuhrer", country: "Italia", regione: "Lombardia", flag: "IT", rarity: "comune", desc: "Il più antico marchio di birra italiano (Brescia, 1829).", variants: ["La Classica"], barcodes: [] },
  { brand: "Amarcord", country: "Italia", regione: "Emilia-Romagna", flag: "IT", rarity: "media", desc: "Birrificio indipendente di Rimini ispirato ai film di Federico Fellini.", variants: ["Gradisca (Lager)", "Midona (Bionda)", "Volpina (Rossa)", "Tabachera (Doppio Malto)"], barcodes: [] },
  { brand: "KBirr", country: "Italia", regione: "Campania", flag: "IT", rarity: "rara", desc: "La birra napoletana artigianale prodotta nel cuore della Campania.", variants: ["Nata Vota (Lager)", "Jattura (Scotch Ale)", "Pulicenella (Witbier)"], barcodes: [] },
  { brand: "Maltus Faber", country: "Italia", regione: "Liguria", flag: "IT", rarity: "rara", desc: "Birrificio artigianale genovese pluripremiato.", variants: ["Blonde", "Amber Ale", "Triple"], barcodes: [] },
  { brand: "L'Olmaia", country: "Italia", regione: "Toscana", flag: "IT", rarity: "rara", desc: "Birrificio artigianale della Val d'Orcia in Toscana.", variants: ["La 5", "La 9", "Starship"], barcodes: [] }
];

export const countryCoordinates: Record<string, { latMin: number; latMax: number; lngMin: number; lngMax: number }> = {
  "Italia": { latMin: 35.4, latMax: 47.1, lngMin: 6.6, lngMax: 18.5 },
  "Germania": { latMin: 47.2, latMax: 55.1, lngMin: 5.8, lngMax: 15.1 },
  "Belgio": { latMin: 49.4, latMax: 51.6, lngMin: 2.5, lngMax: 6.4 },
  "Paesi Bassi": { latMin: 50.7, latMax: 53.6, lngMin: 3.3, lngMax: 7.2 },
  "Repubblica Ceca": { latMin: 48.5, latMax: 51.1, lngMin: 12.0, lngMax: 18.9 },
  "Danimarca": { latMin: 54.5, latMax: 57.9, lngMin: 8.0, lngMax: 15.2 },
  "Spagna": { latMin: 35.9, latMax: 43.8, lngMin: -9.3, lngMax: 4.4 },
  "Francia": { latMin: 42.3, latMax: 51.1, lngMin: -4.8, lngMax: 8.3 },
  "Irlanda": { latMin: 51.4, latMax: 55.5, lngMin: -10.5, lngMax: -5.9 },
  "Scozia": { latMin: 54.6, latMax: 60.9, lngMin: -8.7, lngMax: -0.7 },
  "Portogallo": { latMin: 36.9, latMax: 42.2, lngMin: -9.5, lngMax: -6.1 },
  "Messico": { latMin: 14.3, latMax: 32.8, lngMin: -118.4, lngMax: -86.7 },
  "Stati Uniti": { latMin: 24.3, latMax: 49.3, lngMin: -125.0, lngMax: -66.9 }
};

export function normalizeStr(str?: string | null): string {
  if (!str || typeof str !== 'string') return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function getBeerType(_brandName: string, variantName: string): "rossa" | "scura" | "bianca" | "ipa" | "bionda" {
  if (!variantName || typeof variantName !== 'string') return "bionda";
  const vLower = variantName.toLowerCase();
  if (vLower.includes("rossa") || vLower.includes("rouge") || vLower.includes("red") || vLower.includes("cherry") || vLower.includes("porpora") || vLower.includes("amber") || vLower.includes("ambrata") || vLower.includes("rituel")) {
    return "rossa";
  }
  if (vLower.includes("scura") || vLower.includes("stout") || vLower.includes("dark") || vLower.includes("dunkel") || vLower.includes("nera") || vLower.includes("cerna") || vLower.includes("blue") || vLower.includes("blu") || vLower.includes("maximator") || vLower.includes("sixtus") || vLower.includes("salvator") || vLower.includes("ghisa") || vLower.includes("leon")) {
    return "scura";
  }
  if (vLower.includes("bianca") || vLower.includes("weiss") || vLower.includes("weiß") || vLower.includes("witbier") || vLower.includes("blanche") || vLower.includes("isaac") || vLower.includes("wayan") || vLower.includes("nora") || vLower.includes("hazy")) {
    return "bianca";
  }
  if (vLower.includes("ipa") || vLower.includes("ippa") || vLower.includes("guerrilla") || vLower.includes("taranta") || vLower.includes("elvis")) {
    return "ipa";
  }
  return "bionda"; 
}

export function getCountryFlag(country?: string): string {
  if (!country || typeof country !== 'string') return "🍺";
  const flags: Record<string, string> = {
    "Italia": "IT",
    "Germania": "DE",
    "Belgio": "BE",
    "Paesi Bassi": "NL",
    "Repubblica Ceca": "CZ",
    "Danimarca": "DK",
    "Spagna": "ES",
    "Francia": "FR",
    "Irlanda": "IE",
    "Scozia": "GB-SCT",
    "Portogallo": "PT",
    "Messico": "MX",
    "Stati Uniti": "US"
  };
  return flags[country] || "🍺";
}

export function formatBeerTitle(str: string): string {
  if (!str || typeof str !== 'string') return (str as any) || '';
  const trimmed = str.trim();
  if (trimmed.length === 0) return trimmed;

  const acronyms = new Set(["IPA", "APA", "NEIPA", "DIPA", "TIPA", "RIS", "ESB", "ABV", "IBU", "IIPA"]);

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      const upper = word.toUpperCase();
      if (acronyms.has(upper)) {
        return upper;
      }
      if (word === upper && word.length >= 2 && word.length <= 4) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function mergeBeers(staticBeers: Beer[] = beers, customBeers?: any): Beer[] {
  const safeStatic = Array.isArray(staticBeers) ? staticBeers : beers;
  if (!customBeers) return safeStatic;

  let customList: any[] = [];
  if (Array.isArray(customBeers)) {
    customList = customBeers;
  } else if (typeof customBeers === 'object') {
    customList = Object.values(customBeers);
  }

  if (!customList || customList.length === 0) return safeStatic;

  const mergedMap = new Map<string, Beer>();

  safeStatic.forEach((b) => {
    if (b && b.brand) {
      const safeVars = Array.isArray(b.variants) ? b.variants : ['Classica'];
      mergedMap.set(b.brand, { ...b, variants: [...safeVars] });
    }
  });

  customList.forEach((cb) => {
    if (cb && cb.brand) {
      const cbBrand = formatBeerTitle(cb.brand);
      const rawVars = Array.isArray(cb.variants)
        ? cb.variants
        : ((cb as any).variant ? [(cb as any).variant] : ['Classica']);
      const cbVariants = rawVars.map((v: string) => formatBeerTitle(v || 'Classica'));

      if (mergedMap.has(cbBrand)) {
        const existing = mergedMap.get(cbBrand)!;
        if (!Array.isArray(existing.variants)) existing.variants = ['Classica'];
        cbVariants.forEach((v: string) => {
          if (v && !existing.variants.includes(v)) {
            existing.variants.push(v);
          }
        });
      } else {
        mergedMap.set(cbBrand, {
          brand: cbBrand,
          country: cb.country || "Italia",
          flag: cb.flag || getCountryFlag(cb.country || "Italia"),
          rarity: cb.rarity || "comune",
          desc: cb.desc || `Birra ${cbBrand}`,
          variants: cbVariants.length > 0 ? [...cbVariants] : ["Classica"],
          regione: cb.regione || undefined,
          barcodes: Array.isArray(cb.barcodes) ? [...cb.barcodes] : [],
        });
      }
    }
  });

  return Array.from(mergedMap.values());
}

export function getBasePoints(brandName: string, variantName: string, allBeersCatalog: Beer[] = beers): number {
  let base = 1;
  const safeCatalog = Array.isArray(allBeersCatalog) ? allBeersCatalog : beers;
  const beer = safeCatalog.find(b => b && b.brand === brandName);
  if (beer) {
    if (beer.rarity === "media") base = 2;
    if (beer.rarity === "rara") base = 5;
  }
  if (brandName === "Ichnusa") { if (variantName === "Non Filtrata" || variantName === "Ambra Limpidissima" || variantName === "Metodo Lento") return 3; }
  if (brandName === "Moretti") { if (variantName === "La Rossa" || variantName === "IPA" || variantName === "Bianca" || variantName === "Lunga Maturazione") return 2; }
  if (brandName === "Peroni") { if (variantName.includes("Gran Riserva")) return 3; if (variantName === "Non Filtrata" || variantName === "Cruda") return 2; }
  if (brandName === "Poretti") { if (variantName === "7 Luppoli" || variantName === "8 Luppoli" || variantName === "Le 9 Luppoli (IPA)") return 3; if (variantName === "5 Luppoli Bock" || variantName === "6 Luppoli Rossa") return 2; }
  if (brandName === "Raffo") { if (variantName === "Lavorazione Grezza") return 3; return 2; }

  return base;
}

export function getBeerPoints(brandName: string, variantName: string, isShiny: boolean, _isShared?: boolean, allBeersCatalog: Beer[] = beers): number {
  let base = getBasePoints(brandName, variantName, allBeersCatalog);
  if (isShiny) base *= 2;
  return base;
}

export function isUserParticipantInPost(post: any, username: string): boolean {
  if (!post || !username) return false;
  const userLower = username.toLowerCase();

  // Author check
  if (post.user && post.user.toLowerCase() === userLower) {
    return true;
  }

  // taggedFriends array check
  if (Array.isArray(post.taggedFriends) && post.taggedFriends.some((f: any) => typeof f === 'string' && f.toLowerCase() === userLower)) {
    return true;
  }

  // taggedFriend string check (could be single name or comma-separated names)
  if (post.taggedFriend && typeof post.taggedFriend === 'string') {
    const friends = post.taggedFriend.split(',').map((s: string) => s.trim().toLowerCase());
    if (friends.includes(userLower)) {
      return true;
    }
  }

  return false;
}

export interface ResolvedPokedexBeer {
  beer: Beer | undefined;
  brand: string;
  variant: string;
  rarity: 'comune' | 'media' | 'rara';
  country: string;
}

export function resolvePokedexEntryBeer(
  key: string,
  entry?: any,
  catalog: Beer[] = beers
): ResolvedPokedexBeer {
  const safeCatalog = Array.isArray(catalog) && catalog.length > 0 ? catalog : beers;
  const entryBrand = entry && typeof entry === 'object' && entry.brand ? entry.brand : undefined;
  const entryVariant = entry && typeof entry === 'object' && entry.variant ? entry.variant : undefined;

  let foundBeer: Beer | undefined = undefined;

  // 1. Match by entry.brand if present
  if (entryBrand) {
    foundBeer = safeCatalog.find(
      (b) => b && (b.brand === entryBrand || normalizeStr(b.brand) === normalizeStr(entryBrand))
    );
  }

  // 2. Match exact key with `${b.brand}-${v}` or formatted titles
  if (!foundBeer && key) {
    foundBeer = safeCatalog.find((b) => {
      if (!b || !b.brand) return false;
      const vars = Array.isArray(b.variants) && b.variants.length > 0 ? b.variants : ['Classica'];
      return vars.some(
        (v) =>
          `${b.brand}-${v}` === key ||
          `${formatBeerTitle(b.brand)}-${formatBeerTitle(v)}` === key ||
          `${normalizeStr(b.brand)}-${normalizeStr(v)}` === normalizeStr(key)
      );
    });
  }

  // 3. Match longest brand prefix in key
  if (!foundBeer && key) {
    let longestMatch: Beer | undefined = undefined;
    safeCatalog.forEach((b) => {
      if (!b || !b.brand) return;
      const formattedB = formatBeerTitle(b.brand);
      if (
        key.startsWith(`${b.brand}-`) ||
        key.startsWith(`${formattedB}-`) ||
        normalizeStr(key).startsWith(`${normalizeStr(b.brand)}-`)
      ) {
        if (!longestMatch || b.brand.length > longestMatch.brand.length) {
          longestMatch = b;
        }
      }
    });
    foundBeer = longestMatch;
  }

  const brand = foundBeer?.brand || entryBrand || (key && key.includes('-') ? key.split('-')[0] : key || 'Sconosciuta');

  let variant = entryVariant;
  if (!variant && key) {
    if (foundBeer && key.startsWith(`${foundBeer.brand}-`)) {
      variant = key.slice(foundBeer.brand.length + 1);
    } else if (foundBeer && key.startsWith(`${formatBeerTitle(foundBeer.brand)}-`)) {
      variant = key.slice(formatBeerTitle(foundBeer.brand).length + 1);
    } else if (key.includes('-')) {
      variant = key.split('-').slice(1).join('-');
    } else {
      variant = 'Classica';
    }
  }
  if (!variant) variant = 'Classica';

  const rarity = (foundBeer?.rarity || entry?.rarity || 'comune') as 'comune' | 'media' | 'rara';
  const country = foundBeer?.country || entry?.country || 'Italia';

  return { beer: foundBeer, brand, variant, rarity, country };
}

