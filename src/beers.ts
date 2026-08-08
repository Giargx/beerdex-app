export interface Beer {
  brand: string;
  country: string;
  flag: string;
  rarity: "comune" | "media" | "rara";
  desc: string;
  variants: string[];
  barcodes?: string[];
  regione?: string;
  beerType?: "bionda" | "rossa" | "scura" | "bianca" | "ipa";
  variantTypes?: Record<string, "bionda" | "rossa" | "scura" | "bianca" | "ipa">;
}

export const beers: Beer[] = [
  { brand: "Affligem", country: "Belgio", flag: "BE", rarity: "comune", desc: "Storica birra d'abbazia belga ad alta fermentazione.", variants: ["Blonde", "Double", "Triple"], barcodes: [] },
  { brand: "Abbaye de Forest", country: "Belgio", flag: "BE", rarity: "media", desc: "Birra belga d'abbazia ad alta fermentazione rifermentata in bottiglia.", variants: ["Blonde", "Brune"], barcodes: [] },
  { brand: "Amarcord", country: "Italia", regione: "Emilia-Romagna", flag: "IT", rarity: "media", desc: "Birrificio indipendente di Rimini ispirato ai film di Federico Fellini.", variants: ["Gradisca (Lager)", "Midona (Bionda)", "Volpina (Rossa)", "Tabachera (Doppio Malto)"], barcodes: [] },
  { brand: "Anchor", country: "Stati Uniti", flag: "US", rarity: "media", desc: "Storico birrificio di San Francisco creatore dello stile 'Steam Beer' (California Common).", variants: ["Steam Beer", "Liberty Ale", "Porter", "Christmas Ale"], barcodes: [] },
  { brand: "Asahi", country: "Giappone", flag: "JP", rarity: "comune", desc: "La lager super dry giapponese più famosa al mondo.", variants: ["Super Dry"], barcodes: [] },
  { brand: "Augustiner", country: "Germania", flag: "DE", rarity: "media", desc: "Storico birrificio di Monaco di Baviera.", variants: ["Lagerbier Hell", "Edelstoff", "Maximator"], barcodes: [] },
  { brand: "Baladin", country: "Italia", regione: "Piemonte", flag: "IT", rarity: "rara", desc: "Pioniere della birra artigianale italiana.", variants: ["Isaac (Blanche)", "Wayan (Saison)", "Nora (Speziata)", "Super Bitter", "Leon", "Nazionale", "L'IPPA", "Rock'n'Roll"], barcodes: [] },
  { brand: "Bavaria", country: "Paesi Bassi", flag: "NL", rarity: "comune", desc: "Marchio olandese noto per la linea 8.6.", variants: ["Premium Pilsner", "8.6 Original", "8.6 Red", "8.6 Gold", "8.6 Extreme"], barcodes: [] },
  { brand: "Beck's", country: "Germania", flag: "DE", rarity: "comune", desc: "Classica pilsner tedesca (Brema).", variants: ["Pilsner", "Blue (Analcolica)", "Lemon", "Green Lemon", "Unfiltered"], barcodes: [] },
  { brand: "Best Brau", country: "Germania", flag: "DE", rarity: "comune", desc: "Birra commerciale diffusa nei supermercati.", variants: ["Premium Pils", "Doppio Malto", "Rossa", "Weiss"], barcodes: [] },
  { brand: "Birrificio Italiano", country: "Italia", regione: "Lombardia", flag: "IT", rarity: "rara", desc: "Storico birrificio artigianale lombardo.", variants: ["Tipopils", "Bibock", "Nigredo", "Vudù", "Amber Shock"], barcodes: [] },
  { brand: "Birrificio Lambrate", country: "Italia", regione: "Lombardia", flag: "IT", rarity: "rara", desc: "Il birrificio simbolo di Milano e del fermento artigianale.", variants: ["Montestella", "Sant'Ambroeus", "Ghisa", "Porpora", "Quarantot"], barcodes: [] },
  { brand: "Birrificio Messina", country: "Italia", regione: "Sicilia", flag: "IT", rarity: "comune", desc: "Birrificio cooperativo siciliano che produce la celebre Birra dello Stretto.", variants: ["Doc 15", "Birra dello Stretto"], barcodes: [] },
  { brand: "Blue Moon", country: "Stati Uniti", flag: "US", rarity: "comune", desc: "La famosa birra di frumento in stile belga servita tradizionalmente con una fetta d'arancia.", variants: ["Belgian White", "Mango Wheat", "LightSky"], barcodes: [] },
  { brand: "Boucanier", country: "Belgio", flag: "BE", rarity: "media", desc: "Potente Strong Belgian Ale prodotta nelle Fiandre orientali dalla Brouwerij Van Steenberge.", variants: ["Golden Ale", "Dark Ale", "Red Ale"], barcodes: [] },
  { brand: "Bourgogne des Flandres", country: "Belgio", flag: "BE", rarity: "media", desc: "Tipica birra di Bruges ottenuta dall'assemblaggio di birra scura e Lambic invecchiato in botte.", variants: ["Brune", "Blonden Os"], barcodes: [] },
  { brand: "BrewDog", country: "Scozia", flag: "GB-SCT", rarity: "media", desc: "Birrificio artigianale scozzese famoso in tutto il mondo.", variants: ["Punk IPA", "Elvis Juice", "Hazy Jane", "Wingman", "Clockwork Tangerine", "Lost Lager", "Black Heart (Stout)"], barcodes: [] },
  { brand: "Brooklyn Brewery", country: "Stati Uniti", flag: "US", rarity: "media", desc: "Famosissimo birrificio di New York, creatore della celebre Brooklyn Lager.", variants: ["Brooklyn Lager", "Defender IPA", "East IPA", "Pulp Art Hazy IPA", "Special Effects (0.0%)", "Black Chocolate Stout"], barcodes: [] },
  { brand: "Budweiser (USA)", country: "Stati Uniti", flag: "US", rarity: "comune", desc: "La famosissima lager americana, 'The King of Beers'.", variants: ["Lager"], barcodes: [] },
  { brand: "Budweiser Budvar", country: "Repubblica Ceca", flag: "CZ", rarity: "media", desc: "L'autentica lager ceca protetta.", variants: ["Original Lager", "Dark Lager", "Nealko"], barcodes: [] },
  { brand: "Bulldog", country: "Regno Unito", flag: "GB", rarity: "comune", desc: "Storica Strong Lager inglese diffusa nei pub e locali in tutta Europa.", variants: ["Strong Lager", "Strong Ale", "Super Strong"], barcodes: [] },
  { brand: "Carlsberg", country: "Danimarca", flag: "DK", rarity: "comune", desc: "Colosso industriale danese.", variants: ["Pilsner", "Elephant", "Special Brew"], barcodes: [] },
  { brand: "Castello", country: "Italia", regione: "Friuli-Venezia Giulia", flag: "IT", rarity: "comune", desc: "Erede dello storico stabilimento di Udine.", variants: ["La Decisa", "L'Intensa", "La Forte", "Radler"], barcodes: [] },
  { brand: "Ceres", country: "Danimarca", flag: "DK", rarity: "comune", desc: "Marchio danese diventato un cult in Italia per le strong ale.", variants: ["Strong Ale", "Red Erik", "Extreme Ten"], barcodes: [] },
  { brand: "Chang", country: "Thailandia", flag: "TH", rarity: "media", desc: "La celebre birra dei due elefanti, simbolo indiscusso della tradizione brassicola thailandese.", variants: ["Classic", "Draft", "Cold Brew Lager", "Espresso Lager"], barcodes: [] },
  { brand: "Chimay", country: "Belgio", flag: "BE", rarity: "media", desc: "Autentica birra trappista belga prodotta dai monaci.", variants: ["Première (Rossa)", "Cinq Cents (Tripel)", "Grande Réserve (Blu)"], barcodes: [] },
  { brand: "Chouffe", country: "Belgio", flag: "BE", rarity: "media", desc: "La celebre birra artigianale belga dello gnomo.", variants: ["La Chouffe (Blonde)", "Mc Chouffe (Brune)", "Chouffe Houblon (IPA)", "Chouffe Soleil", "Cherry Chouffe", "Chouffe N'Ice"], barcodes: [] },
  { brand: "Coors", country: "Stati Uniti", flag: "US", rarity: "comune", desc: "La famosa lager rinfrescante delle Montagne Rocciose del Colorado.", variants: ["Light", "Banquet", "Extra Gold"], barcodes: [] },
  { brand: "Cornet", country: "Belgio", flag: "BE", rarity: "media", desc: "Famosa birra belga ad alta fermentazione affinata in botte con trucioli di quercia.", variants: ["Oaked Strong Blonde", "Smoked", "Alcohol Free"], barcodes: [] },
  { brand: "Corona", country: "Messico", flag: "MX", rarity: "comune", desc: "La lager messicana famosa in tutto il mondo.", variants: ["Extra", "Cero"], barcodes: [] },
  { brand: "Crak Brewery", country: "Italia", regione: "Veneto", flag: "IT", rarity: "rara", desc: "Rivoluzionario birrificio veneto, re indiscusso delle IPA.", variants: ["Guerrilla (IPA)", "Mundaka", "Mansueto", "After Summer"], barcodes: [] },
  { brand: "Del Borgo", country: "Italia", regione: "Lazio", flag: "IT", rarity: "media", desc: "Famoso birrificio laziale, noto per le sue ricette creative.", variants: ["ReAle", "Duchessa", "My Antonia", "Lisa", "Cortigiana"], barcodes: [] },
  { brand: "Delirium", country: "Belgio", flag: "BE", rarity: "media", desc: "Famosissima Strong Ale belga.", variants: ["Tremens", "Nocturnum", "Red"], barcodes: [] },
  { brand: "Desperados", country: "Francia", flag: "FR", rarity: "comune", desc: "Birra bionda aromatizzata alla tequila.", variants: ["Original", "Lime", "Mojito"], barcodes: [] },
  { brand: "Dreher", country: "Italia", regione: "Friuli-Venezia Giulia", flag: "IT", rarity: "comune", desc: "Uno dei marchi storici più antichi, fondato a Trieste.", variants: ["Classica", "Radler Limone"], barcodes: [] },
  { brand: "Duvel", country: "Belgio", flag: "BE", rarity: "media", desc: "La leggendaria Strong Gold Ale belga.", variants: ["Original Blond", "Triple Hop", "6.66"], barcodes: [] },
  { brand: "Erdinger", country: "Germania", flag: "DE", rarity: "comune", desc: "Il birrificio di frumento più grande del mondo.", variants: ["Weißbier", "Dunkel", "Pikantus"], barcodes: [] },
  { brand: "Estrella Damm", country: "Spagna", flag: "ES", rarity: "comune", desc: "La bionda di Barcellona.", variants: ["Estrella Damm", "Inedit", "Daura"], barcodes: [] },
  { brand: "Finkbräu", country: "Germania", flag: "DE", rarity: "comune", desc: "Birra bionda commerciale molto popolare nei discount.", variants: ["Pilsner", "Analcolica"], barcodes: [] },
  { brand: "Fischer", country: "Francia", flag: "FR", rarity: "comune", desc: "Birra alsaziana dal caratteristico tappo meccanico.", variants: ["Tradition", "Blonde"], barcodes: [] },
  { brand: "Flea", country: "Italia", regione: "Umbria", flag: "IT", rarity: "rara", desc: "Birre artigianali umbre brassate con acqua di sorgente.", variants: ["Costanza", "Bianca Lancia", "Federico II", "Bastola", "Violante"], barcodes: [] },
  { brand: "Forst", country: "Italia", regione: "Trentino-Alto Adige", flag: "IT", rarity: "comune", desc: "Birrificio indipendente del Trentino-Alto Adige.", variants: ["Kronen", "V.I.P. Pils", "1857", "Felsenkeller", "Sixtus (Doppelbock)", "0.0%"], barcodes: [] },
  { brand: "Founders", country: "Stati Uniti", flag: "US", rarity: "media", desc: "Pluripremiato birrificio del Michigan famoso per le sue Session IPA e imperial stout.", variants: ["All Day IPA", "KBS (Bourbon Stout)", "Centennial IPA", "Dirty Bastard", "Rubaeus"], barcodes: [] },
  { brand: "Franziskaner", country: "Germania", flag: "DE", rarity: "comune", desc: "Eccellenza tedesca di birre di frumento.", variants: ["Weissbier Naturtrüb", "Weissbier Dunkel"], barcodes: [] },
  { brand: "Goose Island", country: "Stati Uniti", flag: "US", rarity: "media", desc: "Iconico birrificio di Chicago noto per le sue IPA e per la leggendaria serie Bourbon County.", variants: ["IPA", "Midway Session IPA", "312 Urban Wheat", "Bourbon County Stout"], barcodes: [] },
  { brand: "Grimbergen", country: "Belgio", flag: "BE", rarity: "comune", desc: "Famosa birra d'abbazia belga con il simbolo della fenice.", variants: ["Blonde", "Double (Ambrée)", "Blanche", "Triple"], barcodes: [] },
  { brand: "Grolsch", country: "Paesi Bassi", flag: "NL", rarity: "comune", desc: "Iconica lager olandese.", variants: ["Premium Pilsner", "Radler"], barcodes: [] },
  { brand: "Guinness", country: "Irlanda", flag: "IE", rarity: "comune", desc: "La regina delle Stout irlandesi.", variants: ["Draught", "Extra Stout", "Hop House 13", "0.0"], barcodes: [] },
  { brand: "Hacker-Pschorr", country: "Germania", flag: "DE", rarity: "media", desc: "Storico marchio monacense dell'Oktoberfest.", variants: ["Münchner Hell", "Weisse", "Oktoberfest Märzen"], barcodes: [] },
  { brand: "Heineken", country: "Paesi Bassi", flag: "NL", rarity: "comune", desc: "Il colosso olandese di Amsterdam.", variants: ["Original", "Silver", "0.0"], barcodes: [] },
  { brand: "Hoegaarden", country: "Belgio", flag: "BE", rarity: "comune", desc: "La regina delle birre bianche belghe.", variants: ["Witbier", "Rosée"], barcodes: [] },
  { brand: "Hofbräu", country: "Germania", flag: "DE", rarity: "media", desc: "Il leggendario birrificio della HB di Monaco.", variants: ["Original", "Münchner Weisse", "Schwarze Weisse", "Dunkel"], barcodes: [] },
  { brand: "Ichnusa", country: "Italia", regione: "Sardegna", flag: "IT", rarity: "comune", desc: "L'iconica birra sarda, amatissima in tutta Italia.", variants: ["Classica", "Non Filtrata", "Cruda", "Ambra Limpidissima", "Radler", "Metodo Lento"], barcodes: [] },
  { brand: "KBirr", country: "Italia", regione: "Campania", flag: "IT", rarity: "rara", desc: "La birra napoletana artigianale prodotta nel cuore della Campania.", variants: ["Nata Vota (Lager)", "Jattura (Scotch Ale)", "Pulicenella (Witbier)"], barcodes: [] },
  { brand: "Keiler", country: "Germania", flag: "DE", rarity: "media", desc: "Tradizionale birra bavarese del cinghiale prodotta a Würzburg secondo la legge di purezza.", variants: ["Kellerbier", "Helles", "Weissbier Hell", "Weissbier Dunkel", "Landbier"], barcodes: [] },
  { brand: "Kozel", country: "Repubblica Ceca", flag: "CZ", rarity: "comune", desc: "Famosissima birra ceca.", variants: ["Premium Lager", "Dark (Cerna)"], barcodes: [] },
  { brand: "Krombacher", country: "Germania", flag: "DE", rarity: "comune", desc: "Una delle pilsner tedesche più vendute e apprezzate.", variants: ["Pils", "Weizen", "Dunkel"], barcodes: [] },
  { brand: "Kronenbourg 1664", country: "Francia", flag: "FR", rarity: "comune", desc: "Il marchio francese più venduto al mondo.", variants: ["Blanc", "Lager"], barcodes: [] },
  { brand: "Kwak", country: "Belgio", flag: "BE", rarity: "media", desc: "Famosa per il suo iconico bicchiere a clessidra e l'alto grado alcolico.", variants: ["Pauwel Kwak", "Rouge"], barcodes: [] },
  { brand: "L'Olmaia", country: "Italia", regione: "Toscana", flag: "IT", rarity: "rara", desc: "Birrificio artigianale della Val d'Orcia in Toscana.", variants: ["La 5", "La 9", "Starship"], barcodes: [] },
  { brand: "La Trappe", country: "Paesi Bassi", flag: "NL", rarity: "media", desc: "La celebre birra trappista olandese prodotta all'abbazia di Koningshoeven.", variants: ["Blond", "Dubbel", "Tripel", "Quadrupel", "Witte Trappist", "Isid'or", "Bockbier"], barcodes: [] },
  { brand: "Lagunitas", country: "Stati Uniti", flag: "US", rarity: "media", desc: "Birrificio californiano di Petaluma celebre in tutto il mondo per le sue IPA iconiche e luppolate.", variants: ["IPA", "Little Sumpin' Sumpin'", "DayTime IPA", "Hazy Wonder", "Maximus Double IPA"], barcodes: [] },
  { brand: "Leffe", country: "Belgio", flag: "BE", rarity: "comune", desc: "La storica birra d'abbazia belga.", variants: ["Blonde", "Brune", "Rituel 9°", "Rouge", "Triple"], barcodes: [] },
  { brand: "Leo", country: "Thailandia", flag: "TH", rarity: "media", desc: "Popolarissima birra lager thailandese con il leopardo, amatissima per la sua freschezza.", variants: ["Lager", "Super"], barcodes: [] },
  { brand: "Loch Lomond", country: "Scozia", flag: "GB-SCT", rarity: "rara", desc: "Pluripremiato birrificio artigianale scozzese situato sulle sponde del lago Loch Lomond.", variants: ["Silkie Stout", "Zoom Time (NEIPA)", "Southern Summit", "Lost in Mosaic"], barcodes: [] },
  { brand: "Löwenbräu", country: "Germania", flag: "DE", rarity: "comune", desc: "Storica birra monacense del leone.", variants: ["Original", "Oktoberfestbier", "Triumphator"], barcodes: [] },
  { brand: "Malastrana", country: "Repubblica Ceca", flag: "CZ", rarity: "media", desc: "Autentica birra ceca di Praga prodotta secondo la tradizionale fermentazione aperta in vasche di legno.", variants: ["Original Pils", "Granat (Rossa)", "Bock", "Unfiltered", "Dark Lager"], barcodes: [] },
  { brand: "Maltus Faber", country: "Italia", regione: "Liguria", flag: "IT", rarity: "rara", desc: "Birrificio artigianale genovese pluripremiato.", variants: ["Blonde", "Amber Ale", "Triple"], barcodes: [] },
  { brand: "Martin's", country: "Belgio", flag: "BE", rarity: "media", desc: "Storica casa birraria belga d'ispirazione britannica fondata da John Martin.", variants: ["Pale Ale", "IPA 55", "Gordon Finest Scotch"], barcodes: [] },
  { brand: "Mastri Birrai Umbri", country: "Italia", regione: "Umbria", flag: "IT", rarity: "media", desc: "Realtà umbra che esalta i cereali del territorio.", variants: ["Cotta 21 (Bionda)", "Cotta 37 (Rossa)", "Cotta 74 (Nera)", "Cotta 68 (IPA)", "Cotta 50 (Weiss)"], barcodes: [] },
  { brand: "Menabrea", country: "Italia", regione: "Piemonte", flag: "IT", rarity: "comune", desc: "Pluripremiato birrificio di Biella (Piemonte).", variants: ["Bionda 150°", "Ambrata", "Non Filtrata", "Strong", "Weiss", "Rossa"], barcodes: [] },
  { brand: "Messina", country: "Italia", regione: "Sicilia", flag: "IT", rarity: "comune", desc: "Storico marchio siciliano dai sapori del Mediterraneo.", variants: ["Ricetta Classica", "Cristalli di Sale", "Vivace"], barcodes: [] },
  { brand: "Miller", country: "Stati Uniti", flag: "US", rarity: "comune", desc: "Storico colosso commerciale americano di Milwaukee.", variants: ["Genuine Draft (MGD)", "High Life", "Lite"], barcodes: [] },
  { brand: "Moretti", country: "Italia", regione: "Friuli-Venezia Giulia", flag: "IT", rarity: "comune", desc: "Storico marchio nato in Friuli-Venezia Giulia.", variants: ["Ricetta Originale", "Baffo d'Oro", "La Rossa", "Filtrata a Freddo", "IPA", "Bianca", "Zero", "Lunga Maturazione"], barcodes: [] },
  { brand: "Orval", country: "Belgio", flag: "BE", rarity: "rara", desc: "Una delle birre trappistes più singolari e complesse, rifermentata con lieviti selvaggi Brettanomyces.", variants: ["Trappist Ale"], barcodes: [] },
  { brand: "Pabst Blue Ribbon", country: "Stati Uniti", flag: "US", rarity: "comune", desc: "L'iconica birra americana dalla fascia blu, diventata un fenomeno di culto della pop-culture.", variants: ["Original Lager", "Easy", "Stronger Lager"], barcodes: [] },
  { brand: "Paulaner", country: "Germania", flag: "DE", rarity: "comune", desc: "Grande protagonista dell'Oktoberfest.", variants: ["Hefe-Weißbier Naturtrüb", "Oktoberfest Bier", "Münchner Hell", "Salvator"], barcodes: [] },
  { brand: "Pedavena", country: "Italia", regione: "Veneto", flag: "IT", rarity: "comune", desc: "Antica tradizione bellunese (Veneto).", variants: ["Pils", "Lager", "Speciale", "Bock", "8 Gradi"], barcodes: [] },
  { brand: "Peroni", country: "Italia", regione: "Lazio", flag: "IT", rarity: "comune", desc: "Il colosso romano, celebre a livello internazionale.", variants: ["Classica", "Nastro Azzurro", "Nastro Azzurro 0.0", "Non Filtrata", "Cruda", "Gran Riserva Puro Malto", "Gran Riserva Doppio Malto", "Gran Riserva Rossa", "Gran Riserva Bianca", "Chill Lemon", "Capri"], barcodes: [] },
  { brand: "Phuket Beer", country: "Thailandia", flag: "TH", rarity: "rara", desc: "Birra artigianale thailandese brassata nell'isola di Phuket con riso Jasmine.", variants: ["Jasmine Rice Lager", "Island IPA"], barcodes: [] },
  { brand: "Pietra", country: "Francia", flag: "FR", rarity: "media", desc: "Iconica birra corsa brassata con la tipica farina di castagne della Corsica.", variants: ["Amber (Castagna)", "Blonde Bio Gluten Free", "Blanche", "Bière de Noël"], barcodes: [] },
  { brand: "Pilsner Urquell", country: "Repubblica Ceca", flag: "CZ", rarity: "comune", desc: "La madre di tutte le birre bionde.", variants: ["Original Lager"], barcodes: [] },
  { brand: "Poretti", country: "Italia", regione: "Lombardia", flag: "IT", rarity: "comune", desc: "Realtà lombarda che classifica le birre coi luppoli.", variants: ["3 Luppoli", "4 Luppoli Originale", "4 Luppoli Non Filtrata", "5 Luppoli Bock", "6 Luppoli Rossa", "7 Luppoli", "8 Luppoli", "Le 9 Luppoli (IPA)"], barcodes: [] },
  { brand: "Raffo", country: "Italia", regione: "Puglia", flag: "IT", rarity: "comune", desc: "La 'birra dei due mari', simbolo della città di Taranto.", variants: ["Classica", "Lavorazione Grezza"], barcodes: [] },
  { brand: "Rochefort", country: "Belgio", flag: "BE", rarity: "rara", desc: "Birra trappista belga di straordinaria complessità aromatica.", variants: ["6 (Red Cap)", "8 (Green Cap)", "10 (Blue Cap)", "Triple Extra"], barcodes: [] },
  { brand: "Rodenbach", country: "Belgio", flag: "BE", rarity: "media", desc: "Iconico birrificio belga celebre per le sue Flemish Red Sour Ale invecchiate in botti di quercia (foeders).", variants: ["Classic", "Grand Cru", "Alexander", "Caractère Rouge", "Fruitage"], barcodes: [] },
  { brand: "Salento", country: "Italia", regione: "Puglia", flag: "IT", rarity: "rara", desc: "Eccellenza artigianale pugliese, nata a Leverano (Lecce).", variants: ["Agricola (Lager)", "Nuda e Cruda", "Beggia", "Taranta (IPA)"], barcodes: [] },
  { brand: "Samuel Adams", country: "Stati Uniti", flag: "US", rarity: "media", desc: "Storico birrificio artigianale di Boston, celebre per la sua Boston Lager.", variants: ["Boston Lager", "Summer Ale", "Wicked Hazy IPA", "Cold Snap", "Octobrefest"], barcodes: [] },
  { brand: "San Miguel", country: "Spagna", flag: "ES", rarity: "comune", desc: "Marchio spagnolo popolarissimo.", variants: ["Especial", "Selecta", "0,0"], barcodes: [] },
  { brand: "Schneider Weisse", country: "Germania", flag: "DE", rarity: "media", desc: "Birrificio bavarese specializzato in eccezionali birre di frumento.", variants: ["TAP7 Original", "TAP6 Aventinus", "TAP1 Helle Weisse", "TAP5 Meine Hopfenweisse"], barcodes: [] },
  { brand: "Semedorato", country: "Italia", regione: "Sicilia", flag: "IT", rarity: "rara", desc: "Birra artigianale premium siciliana.", variants: ["Bionda Premium", "Rossa Doppio Malto", "Non Filtrata"], barcodes: [] },
  { brand: "Sheppy's", country: "Regno Unito", flag: "GB", rarity: "media", desc: "Storico produttore di sidro artigianale inglese nel Somerset dal 1816.", variants: ["Original Cloudy Cider", "Vintage Cider", "Dabinett Cider"], barcodes: [] },
  { brand: "Sierra Nevada", country: "Stati Uniti", flag: "US", rarity: "media", desc: "Il birrificio californiano pioniere della rivoluzione della birra artigianale americana dal 1980.", variants: ["Pale Ale", "Torpedo Extra IPA", "Hazy Little Thing (NEIPA)", "Bigfoot (Barleywine)", "Celebration Ale"], barcodes: [] },
  { brand: "Singha", country: "Thailandia", flag: "TH", rarity: "media", desc: "L'iconica lager reale thailandese col leone d'oro, la birra più famosa della Thailandia.", variants: ["Original Lager", "Draft", "Light"], barcodes: [] },
  { brand: "Slalom", country: "Scozia", flag: "GB-SCT", rarity: "comune", desc: "Strong Lager scozzese, popolarissima nei pub italiani.", variants: ["Strong"], barcodes: [] },
  { brand: "Spaten", country: "Germania", flag: "DE", rarity: "comune", desc: "Storico birrificio di Monaco di Baviera, creatore dello stile Münchner Hell.", variants: ["Münchner Hell", "Premium Lager", "Oktoberfestbier"], barcodes: [] },
  { brand: "Steenbrugge", country: "Belgio", flag: "BE", rarity: "media", desc: "Storica birra d'abbazia belga speziata con la tradizionale miscela segreta di erbe 'Gruut'.", variants: ["Dubbel Brune", "Blond", "Tripel", "Witrik"], barcodes: [] },
  { brand: "Stella Artois", country: "Belgio", flag: "BE", rarity: "comune", desc: "Premium lager belga.", variants: ["Premium Lager", "Unfiltered", "0.0"], barcodes: [] },
  { brand: "Super Bock", country: "Portogallo", flag: "PT", rarity: "comune", desc: "La birra più famosa del Portogallo.", variants: ["Original", "Abadia", "Stout"], barcodes: [] },
  { brand: "Tennent's", country: "Scozia", flag: "GB-SCT", rarity: "comune", desc: "Storico marchio scozzese.", variants: ["Super", "Extra", "1885 Lager", "Scotch Ale"], barcodes: [] },
  { brand: "Theresianer", country: "Italia", regione: "Veneto", flag: "IT", rarity: "comune", desc: "Storico marchio triestino rinato come eccellenza artigianale in Veneto.", variants: ["Premium Pilsner", "Strong Ale", "Bock", "Witbier", "IPPA"], barcodes: [] },
  { brand: "Timmermans", country: "Belgio", flag: "BE", rarity: "media", desc: "Il più antico birrificio di Lambic a fermentazione spontanea del mondo (fondato nel 1702).", variants: ["Lambicus Blanche", "Faro", "Oude Kriek", "Oude Gueuze", "Pêche", "Kriek Black Pepper"], barcodes: [] },
  { brand: "Tripel Karmeliet", country: "Belgio", flag: "BE", rarity: "media", desc: "Straordinaria birra belga ai tre cereali.", variants: ["Tripel"], barcodes: [] },
  { brand: "Tête de Mort", country: "Belgio", flag: "BE", rarity: "media", desc: "Caratteristica gamma di birre belghe ad alta gradazione prodotta dalla Brasserie Du Bocq.", variants: ["Triple", "Amber", "Red", "Green"], barcodes: [] },
  { brand: "Tuborg", country: "Danimarca", flag: "DK", rarity: "comune", desc: "Lager danese leggera.", variants: ["Green", "Strong", "Red"], barcodes: [] },
  { brand: "Voll-Damm", country: "Spagna", flag: "ES", rarity: "comune", desc: "La famosa Märzen a doppio malto prodotta a Barcellona.", variants: ["Märzen"], barcodes: [] },
  { brand: "Warsteiner", country: "Germania", flag: "DE", rarity: "comune", desc: "Popolarissima pilsner tedesca premium.", variants: ["Premium Verum", "Double Hops", "Analcolica"], barcodes: [] },
  { brand: "Waterloo", country: "Belgio", flag: "BE", rarity: "media", desc: "Birra belga ad alta fermentazione prodotta nella storica fattoria di Mont-Saint-Jean a Waterloo.", variants: ["Double Brune", "Triple Blond", "Récolte", "Kriek"], barcodes: [] },
  { brand: "Weihenstephaner", country: "Germania", flag: "DE", rarity: "media", desc: "Il più antico marchio di birra al mondo (1040).", variants: ["Hefe Weissbier", "Vitus", "Original Hell"], barcodes: [] },
  { brand: "Westmalle", country: "Belgio", flag: "BE", rarity: "rara", desc: "La madre di tutte le Tripel trappiste belghe.", variants: ["Dubbel", "Tripel", "Extra"], barcodes: [] },
  { brand: "Wold Top", country: "Regno Unito", flag: "GB", rarity: "rara", desc: "Birrificio artigianale dello Yorkshire specializzato in Pale Ale tradizionali e birre Gluten Free.", variants: ["Marmalade Porter", "Against The Grain (GF)", "Headland Red", "Wold Gold", "Scarborough Fair IPA"], barcodes: [] },
  { brand: "Wuhrer", country: "Italia", regione: "Lombardia", flag: "IT", rarity: "comune", desc: "Il più antico marchio di birra italiano (Brescia, 1829).", variants: ["La Classica"], barcodes: [] }
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
  "Stati Uniti": { latMin: 24.3, latMax: 49.3, lngMin: -125.0, lngMax: -66.9 },
  "Thailandia": { latMin: 5.6, latMax: 20.5, lngMin: 97.3, lngMax: 105.6 }
};

export function normalizeStr(str?: string | null): string {
  if (!str || typeof str !== 'string') return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function stripStr(str?: string | null): string {
  if (!str || typeof str !== 'string') return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getBeerType(brandName: string, variantName: string, allBeersCatalog?: Beer[]): "rossa" | "scura" | "bianca" | "ipa" | "bionda" {
  const safeCatalog = (allBeersCatalog && Array.isArray(allBeersCatalog) && allBeersCatalog.length > 0) ? allBeersCatalog : beers;
  const beer = safeCatalog.find(b => b && b.brand && (b.brand.toLowerCase() === (brandName || '').toLowerCase() || formatBeerTitle(b.brand) === formatBeerTitle(brandName || '')));
  if (beer) {
    if (beer.variantTypes && variantName && beer.variantTypes[variantName]) {
      return beer.variantTypes[variantName];
    }
    if (beer.beerType) {
      return beer.beerType;
    }
  }
  if (!variantName || typeof variantName !== 'string') return "bionda";
  const vLower = variantName.toLowerCase();
  if (vLower.includes("rossa") || vLower.includes("rouge") || vLower.includes("red") || vLower.includes("cherry") || vLower.includes("porpora") || vLower.includes("amber") || vLower.includes("ambrata") || vLower.includes("rituel") || vLower.includes("kriek")) {
    return "rossa";
  }
  if (vLower.includes("scura") || vLower.includes("stout") || vLower.includes("dark") || vLower.includes("dunkel") || vLower.includes("nera") || vLower.includes("cerna") || vLower.includes("blue") || vLower.includes("blu") || vLower.includes("maximator") || vLower.includes("sixtus") || vLower.includes("salvator") || vLower.includes("ghisa") || vLower.includes("leon") || vLower.includes("brune") || vLower.includes("porter") || vLower.includes("dubbel") || vLower.includes("quadrupel")) {
    return "scura";
  }
  if (vLower.includes("bianca") || vLower.includes("weiss") || vLower.includes("weiß") || vLower.includes("witbier") || vLower.includes("blanche") || vLower.includes("isaac") || vLower.includes("wayan") || vLower.includes("nora") || vLower.includes("hazy") || vLower.includes("witrik")) {
    return "bianca";
  }
  if (vLower.includes("ipa") || vLower.includes("ippa") || vLower.includes("guerrilla") || vLower.includes("taranta") || vLower.includes("elvis") || vLower.includes("wingman") || vLower.includes("neipa")) {
    return "ipa";
  }
  return "bionda"; 
}

export function getCountryFlag(country?: string): string {
  if (!country || typeof country !== 'string') return "XX";
  const trimmed = country.trim();
  if (!trimmed) return "XX";

  // If already a 2-3 letter code
  if (/^[A-Z]{2,3}(-[A-Z]{2,3})?$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

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
    "Inghilterra": "GB-ENG",
    "Regno Unito": "GB",
    "Portogallo": "PT",
    "Messico": "MX",
    "Stati Uniti": "US",
    "Giappone": "JP",
    "Austria": "AT",
    "Svizzera": "CH",
    "Polonia": "PL",
    "Svezia": "SE",
    "Norvegia": "NO",
    "Finlandia": "FI",
    "Grecia": "GR",
    "Australia": "AU",
    "Nuova Zelanda": "NZ",
    "Canada": "CA",
    "Argentina": "AR",
    "Brasile": "BR",
    "Cina": "CN",
    "Corea Del Sud": "KR",
    "Corea del Sud": "KR",
    "Thailandia": "TH",
    "Thailand": "TH",
    "Vietnam": "VN",
    "Turchia": "TR",
    "Cuba": "CU",
    "Giamaica": "JM",
    "Perù": "PE",
    "Cile": "CL",
    "Colombia": "CO",
    "Venezuela": "VE",
    "Egitto": "EG",
    "Marocco": "MA",
    "Tunisia": "TN",
    "India": "IN",
    "Filippine": "PH",
    "Indonesia": "ID",
    "Singapore": "SG",
    "Malesia": "MY",
    "Islanda": "IS",
    "Croazia": "HR",
    "Serbia": "RS",
    "Slovenia": "SI",
    "Ungheria": "HU",
    "Romania": "RO",
    "Bulgaria": "BG",
    "Ucraina": "UA",
    "Lituania": "LT",
    "Lettonia": "LV",
    "Estonia": "EE",
    "Sudafrica": "ZA",
    "Israele": "IL",
    "Repubblica Dominicana": "DO",
    "Porto Rico": "PR"
  };

  const foundKey = Object.keys(flags).find((k) => k.toLowerCase() === trimmed.toLowerCase());
  if (foundKey) return flags[foundKey];

  const cleanStr = trimmed.replace(/[^a-zA-Z]/g, '');
  if (cleanStr.length >= 2) {
    return cleanStr.substring(0, 2).toUpperCase();
  }
  return "XX";
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
  const strippedKeyMap = new Map<string, string>();

  safeStatic.forEach((b) => {
    if (b && b.brand) {
      const stripped = stripStr(b.brand);
      const safeVars = Array.isArray(b.variants) ? b.variants : ['Classica'];
      mergedMap.set(b.brand, { ...b, variants: [...safeVars] });
      strippedKeyMap.set(stripped, b.brand);
    }
  });

  customList.forEach((cb) => {
    if (cb && cb.brand) {
      const cbBrand = formatBeerTitle(cb.brand);
      const strippedCb = stripStr(cbBrand);

      // Resolve alias or stripped key
      let matchedCanonical = strippedKeyMap.get(strippedCb);
      if (!matchedCanonical) {
        if (strippedCb.includes('deforest') || strippedCb.includes('baiadeforest') || strippedCb.includes('abbay')) {
          matchedCanonical = 'Abbaye de Forest';
        }
      }

      const rawVars = Array.isArray(cb.variants)
        ? cb.variants
        : ((cb as any).variant ? [(cb as any).variant] : ['Classica']);
      const cbVariants = rawVars.map((v: string) => formatBeerTitle(v || 'Classica'));

      const cbType = cb.beerType || undefined;

      if (matchedCanonical && mergedMap.has(matchedCanonical)) {
        const existing = mergedMap.get(matchedCanonical)!;
        if (!Array.isArray(existing.variants)) existing.variants = ['Classica'];
        if (!existing.variantTypes) existing.variantTypes = {};
        cbVariants.forEach((v: string) => {
          const normV = stripStr(v);
          const alreadyExists = existing.variants.some((ev) => stripStr(ev) === normV);
          if (!alreadyExists && v) {
            existing.variants.push(v);
          }
          if (v && cbType) {
            existing.variantTypes![v] = cbType;
          }
        });
      } else {
        const varTypesObj: Record<string, any> = {};
        if (cbType) {
          cbVariants.forEach((v: string) => {
            if (v) varTypesObj[v] = cbType;
          });
        }
        mergedMap.set(cbBrand, {
          brand: cbBrand,
          country: cb.country || "Italia",
          flag: (cb.flag && cb.flag !== '🍺' && cb.flag !== '??' && cb.flag !== 'XX') ? cb.flag : getCountryFlag(cb.country || "Italia"),
          rarity: cb.rarity || "comune",
          desc: cb.desc || `Birra ${cbBrand}`,
          variants: cbVariants.length > 0 ? [...cbVariants] : ["Classica"],
          regione: cb.regione || undefined,
          barcodes: Array.isArray(cb.barcodes) ? [...cb.barcodes] : [],
          beerType: cbType,
          variantTypes: varTypesObj,
        });
        strippedKeyMap.set(strippedCb, cbBrand);
      }
    }
  });

  return Array.from(mergedMap.values());
}

export interface RarityScoreParams {
  volume: 1 | 2 | 3;       // V: 1 (>100k hl/anno), 2 (1k-100k hl/anno), 3 (<1k hl/anno)
  capillarity: 1 | 2 | 3;  // P: 1 (>50% punti vendita), 2 (5%-50%), 3 (<5%)
  temporality: 1 | 2 | 3;  // T: 1 (365 giorni/anno), 2 (stagionale/ciclica), 3 (one-off/prenotazione)
}

export function calculateCompositeRarity(params: RarityScoreParams): "comune" | "media" | "rara" {
  const S = params.volume + params.capillarity + params.temporality;
  if (S <= 4) return "comune";
  if (S <= 7) return "media";
  return "rara";
}

export function getBasePoints(brandName: string, variantName: string, allBeersCatalog: Beer[] = beers): number {
  let base = 1;
  const safeCatalog = Array.isArray(allBeersCatalog) ? allBeersCatalog : beers;
  const beer = safeCatalog.find(b => b && b.brand === brandName);
  if (beer) {
    if (beer.rarity === "media") base = 2;
    if (beer.rarity === "rara") base = 5;
  }
  // All mass-market commercial variants (e.g. Ichnusa Non Filtrata, Moretti, Peroni, Raffo) return 1 base point (Comune).
  // Special reserve editions:
  if (brandName === "Peroni" && variantName.includes("Gran Riserva")) return 2;
  if (brandName === "Poretti" && (variantName === "7 Luppoli" || variantName === "8 Luppoli" || variantName === "Le 9 Luppoli (IPA)")) return 2;

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

export function getUniqueParticipantPosts(posts: any[], username: string): any[] {
  if (!Array.isArray(posts) || !username) return [];

  const userLower = username.toLowerCase();

  // 1. Filter posts where user is author or tagged, AND exclude isStory posts
  const rawParticipantPosts = posts.filter(
    (p) => p && !p.isStory && p.brand !== 'Storia del Pub' && isUserParticipantInPost(p, userLower)
  );

  // 2. Deduplicate posts that belong to the same session or photo
  const uniquePosts: any[] = [];
  const seenSessions = new Set<string>();

  rawParticipantPosts.forEach((post) => {
    // Unique session key based on brand, variant, photo, and time within 3 minutes window
    const roundedTime = Math.floor((post.time || 0) / (180 * 1000));
    const participants = [
      post.user,
      ...(Array.isArray(post.taggedFriends) ? post.taggedFriends : []),
      ...(post.taggedFriend && typeof post.taggedFriend === 'string' ? post.taggedFriend.split(',').map((s: string) => s.trim()) : []),
    ]
      .filter(Boolean)
      .map((u: string) => u.toLowerCase())
      .sort();

    const sessionKey = `${post.brand}::${post.variant}::${roundedTime}::${participants.join('::')}`;
    const photoKey = post.photo ? `${post.brand}::${post.variant}::${post.photo}` : '';

    if (seenSessions.has(sessionKey) || (photoKey && seenSessions.has(photoKey))) {
      return; // Skip duplicate post for the same shared drinking session
    }

    seenSessions.add(sessionKey);
    if (photoKey) seenSessions.add(photoKey);
    uniquePosts.push(post);
  });

  return uniquePosts;
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

  // 1b. Alias check (e.g. Baia Deforest / Abbay -> Abbaye de Forest)
  if (!foundBeer && (entryBrand || key)) {
    const normStr = normalizeStr(entryBrand || key);
    if (normStr.includes('deforest') || normStr.includes('baiadeforest') || normStr.includes('abbay')) {
      foundBeer = safeCatalog.find((b) => b && b.brand === 'Abbaye de Forest');
    }
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

  // 3. Match longest brand prefix or substring in key
  if (!foundBeer && key) {
    let longestMatch: Beer | undefined = undefined;
    const normKey = normalizeStr(key);
    safeCatalog.forEach((b) => {
      if (!b || !b.brand) return;
      const normBrand = normalizeStr(b.brand);
      if (
        key.startsWith(`${b.brand}-`) ||
        key.startsWith(`${formatBeerTitle(b.brand)}-`) ||
        normKey.startsWith(`${normBrand}-`) ||
        normKey.startsWith(normBrand)
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

  const rawRarity = String(
    foundBeer?.rarity || (entry && typeof entry === 'object' ? (entry.rarity || entry.beer?.rarity) : '') || 'comune'
  ).toLowerCase().trim();

  let rarity: 'comune' | 'media' | 'rara' = 'comune';
  if (rawRarity === 'media' || rawRarity === 'medium' || rawRarity === 'medio') {
    rarity = 'media';
  } else if (rawRarity === 'rara' || rawRarity === 'rare' || rawRarity === 'raro') {
    rarity = 'rara';
  } else {
    rarity = 'comune';
  }

  const country = foundBeer?.country || (entry && typeof entry === 'object' ? (entry.country || entry.beer?.country) : '') || 'Italia';

  return { beer: foundBeer, brand, variant, rarity, country };
}

