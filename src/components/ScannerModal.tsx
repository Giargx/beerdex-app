import React from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { beers } from '../beers';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargetBrand: string;
  onSuccess: (isSpinaBypass: boolean) => void;
  showAlert: (message: string, title?: string, showOk?: boolean, callback?: () => void) => void;
  showConfirm: (message: string, title: string, onConfirm: () => void) => void;
  hideAlert: () => void;
}

// Synonyms map to resolve parent companies, spelling variations, and cataloging anomalies in Open Food Facts
const brandSynonyms: Record<string, string[]> = {
  "affligem": ["affligem", "heineken"],
  "asahi": ["asahi"],
  "augustiner": ["augustiner", "augustiner-bräu", "augustiner-brau"],
  "baladin": ["baladin", "birra baladin"],
  "bavaria": ["bavaria", "swinkels", "8.6", "eight point six"],
  "beck's": ["beck", "becks", "beck's"],
  "best brau": ["best brau", "best bräu", "best braeu"],
  "birrificio italiano": ["birrificio italiano"],
  "birrificio lambrate": ["lambrate", "birrificio lambrate"],
  "birrificio messina": ["messina", "birra dello stretto", "stretto"],
  "brewdog": ["brewdog", "punk ipa"],
  "budweiser (usa)": ["bud", "budweiser", "anheuser-busch", "anheuser busch"],
  "budweiser budvar": ["budvar", "budweiser budvar", "budweiser czech", "budejovicky"],
  "carlsberg": ["carlsberg", "carls berg"],
  "castello": ["castello", "birra castello"],
  "ceres": ["ceres", "royal unibrew"],
  "chimay": ["chimay"],
  "chouffe": ["chouffe", "la chouffe", "duvel moortgat"],
  "corona": ["corona", "coronita", "modelo"],
  "crak brewery": ["crak", "crak brewery"],
  "del borgo": ["del borgo", "birra del borgo"],
  "delirium": ["delirium", "huyghe"],
  "desperados": ["desperados", "heineken"],
  "dreher": ["dreher", "heineken"],
  "duvel": ["duvel", "duvel moortgat"],
  "erdinger": ["erdinger"],
  "estrella damm": ["estrella damm", "damm"],
  "finkbräu": ["finkbräu", "finkbrau", "fink brau"],
  "fischer": ["fischer", "fischer tradition"],
  "flea": ["flea", "birra flea"],
  "forst": ["forst"],
  "franziskaner": ["franziskaner", "spaten-franziskaner", "spaten franziskaner"],
  "grimbergen": ["grimbergen"],
  "grolsch": ["grolsch"],
  "guinness": ["guinness", "diageo"],
  "hacker-pschorr": ["hacker", "pschorr", "hacker-pschorr", "hacker pschorr"],
  "heineken": ["heineken"],
  "hoegaarden": ["hoegaarden"],
  "hofbräu": ["hb", "hofbräu", "hofbrau", "staatliches hofbräuhaus"],
  "ichnusa": ["ichnusa", "heineken"],
  "kozel": ["kozel", "velkopopovicky kozel"],
  "krombacher": ["krombacher"],
  "kronenbourg 1664": ["kronenbourg", "1664"],
  "kwak": ["kwak", "pauwel kwak"],
  "la trappe": ["la trappe", "koningshoeven"],
  "leffe": ["leffe"],
  "löwenbräu": ["lowenbrau", "löwenbräu", "loewenbrau"],
  "mastri birrai umbri": ["mastri birrai", "umbri"],
  "menabrea": ["menabrea", "forst"],
  "miller": ["miller", "molsen coors", "molson coors"],
  "moretti": ["moretti", "birra moretti", "heineken"],
  "nastro azzurro": ["nastro azzurro", "peroni", "asahi"],
  "orval": ["orval"],
  "paulaner": ["paulaner"],
  "pedavena": ["pedavena", "castello"],
  "peroni": ["peroni", "nastro azzurro", "asahi"],
  "pilsner urquell": ["pilsner urquell", "urquell", "plzensky prazdroj"],
  "rochefort": ["rochefort", "trappistes rochefort"],
  "sagres": ["sagres", "heineken"],
  "samuel adams": ["samuel adams", "boston beer"],
  "san miguel": ["san miguel", "mahou"],
  "schneider weisse": ["schneider weisse", "schneider"],
  "sierra nevada": ["sierra nevada"],
  "spaten": ["spaten", "spaten-franziskaner", "spaten franziskaner"],
  "stella artois": ["stella artois", "stella"],
  "super bock": ["super bock"],
  "tennent's": ["tennent", "tennents", "tennent's"],
  "theresianer": ["theresianer"],
  "tripel karmeliet": ["karmeliet", "tripel karmeliet", "bosteels"],
  "tuborg": ["tuborg", "carlsberg"],
  "voll-damm": ["voll-damm", "damm"],
  "warsteiner": ["warsteiner"],
  "westmalle": ["westmalle"],
};

// Normalize helper: removes punctuation, spaces, accents, and converts to lowercase
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

// Check if the scanned brand matches the target brand, including synonyms
const checkBrandMatch = (targetBrand: string, scannedBrand: string, productName: string): boolean => {
  const targetLower = targetBrand.toLowerCase();
  const scannedLower = scannedBrand.toLowerCase();
  const prodNameLower = productName.toLowerCase();

  const targetNorm = normalize(targetLower);
  const scannedNorm = normalize(scannedLower);
  const prodNameNorm = normalize(prodNameLower);

  // 1. Direct normalized match
  if (scannedNorm.includes(targetNorm) || targetNorm.includes(scannedNorm) || prodNameNorm.includes(targetNorm)) {
    return true;
  }

  // 2. Synonyms lookup
  const synonyms = brandSynonyms[targetLower] || [targetLower];
  for (const syn of synonyms) {
    const synNorm = normalize(syn);
    if (scannedNorm.includes(synNorm) || synNorm.includes(scannedNorm) || prodNameNorm.includes(synNorm)) {
      return true;
    }
  }

  return false;
};

// Checks if the scanned product is a known different beer brand from our list
const getIdentifiedBrand = (scannedBrand: string, productName: string, targetBrand: string): string | null => {
  const targetLower = targetBrand.toLowerCase();
  const scannedLower = scannedBrand.toLowerCase();
  const prodNameLower = productName.toLowerCase();

  const scannedNorm = normalize(scannedLower);
  const prodNameNorm = normalize(prodNameLower);

  for (const brandKey of Object.keys(brandSynonyms)) {
    // Skip the target brand itself (we already know it doesn't match if this is called)
    if (brandKey === targetLower) continue;

    const synonyms = brandSynonyms[brandKey];
    for (const syn of synonyms) {
      const synNorm = normalize(syn);
      
      // Strict matching for other brands to avoid false flags
      if (scannedNorm === synNorm || (scannedNorm.length > 3 && scannedNorm.includes(synNorm)) || prodNameNorm.includes(synNorm)) {
        // Return the user-friendly name of the identified brand
        return beers.find((b) => b.brand.toLowerCase() === brandKey)?.brand || brandKey;
      }
    }
  }

  return null;
};

// Helper to verify if a text contains any beer-related keywords as whole words
const hasWholeBeerKeyword = (text: string): boolean => {
  if (!text) return false;
  // Replace symbols/punctuation with spaces, keeping standard accented letters
  const clean = text.toLowerCase().replace(/[^a-z0-9àèìòùáéíóúüñ]/g, ' ');
  const tokens = clean.split(/\s+/);
  
  const beerWords = new Set([
    "beer", "beers", 
    "birra", "birre", 
    "biere", "bieres", "bière", "bières", 
    "bier", "biere", 
    "cerveza", "cervezas", 
    "stout", "stouts", 
    "ipa", "ipas", 
    "lager", "lagers", 
    "ale", "ales", 
    "pils", "pilsner", "pilsners", 
    "weisse", "weissbier", 
    "radler", "radlers", 
    "tripel", "dubbel", 
    "trappist", "trappiste", 
    "bock", "doppelbock"
  ]);

  return tokens.some(token => beerWords.has(token));
};

// Multi-criteria verification to check if a product is a beer
const isProductBeer = (prod: any): boolean => {
  const prodName = prod.product_name || prod.product_name_it || prod.product_name_en || "";
  const prodNameLower = prodName.toLowerCase();
  const categoriesTags = prod.categories_tags || [];
  const categories = (prod.categories || "").toLowerCase();

  // 0. Prevent false positives for common non-beer categories (water, juices, sodas, solid foods)
  const exclusionKeywords = [
    "acqua", "water", "eau", "wasser", "juice", "succo", "jus", "saft",
    "soft drink", "cola", "soda", "lemonade", "gassosa", "aranciata",
    "farina", "flour", "pasta", "biscuit", "biscotto", "cookie", "snack"
  ];
  const isExcluded = exclusionKeywords.some(kw => 
    categories.includes(kw) || prodNameLower.includes(kw)
  );

  if (isExcluded) {
    // Only allow if it has a very strong and explicit beer keyword (e.g. "beer", "birra") to avoid blocking hop water
    const hasStrongBeerKeyword = ["birra", "beer", "biere", "bière", "bier", "cerveza"].some(
      kw => prodNameLower.includes(kw) || categories.includes(kw)
    );
    if (!hasStrongBeerKeyword) {
      return false;
    }
  }

  // 1. Check categories tags
  const beerTags = [
    "en:beers",
    "en:beers-with-alcohol",
    "en:alcohol-free-beers",
    "en:radlers",
    "en:beers-of-the-world",
    "en:stouts",
    "en:ales",
    "en:lagers",
    "en:ipas"
  ];
  const isBeerByTag = categoriesTags.some((tag: string) => beerTags.includes(tag));
  if (isBeerByTag) return true;

  // 2. Check keywords in categories or name (matching whole words only to avoid false positives like "naturale" -> "ale")
  const isBeerByKeyword = hasWholeBeerKeyword(categories) || hasWholeBeerKeyword(prodNameLower);
  if (isBeerByKeyword) return true;

  // 3. Check if it matches any of our known beer brands
  const scannedBrandNorm = normalize((prod.brands || "").toLowerCase());
  const prodNameNorm = normalize(prodNameLower);

  for (const brandKey of Object.keys(brandSynonyms)) {
    const brandNorm = normalize(brandKey);
    if (scannedBrandNorm === brandNorm || prodNameNorm.includes(brandNorm)) {
      return true;
    }
    for (const syn of brandSynonyms[brandKey]) {
      const synNorm = normalize(syn);
      if (scannedBrandNorm === synNorm || prodNameNorm.includes(synNorm)) {
        return true;
      }
    }
  }

  // 4. Check alcohol content in nutriment fields
  if (prod.nutriments && (prod.nutriments.alcohol !== undefined || prod.nutriments.alcohol_100g !== undefined)) {
    const alcVal = parseFloat(prod.nutriments.alcohol || prod.nutriments.alcohol_100g || "0");
    if (alcVal > 0) {
      // Exclude wine/liquors to avoid false positives
      const nonBeerKeywords = ["wine", "vino", "liquore", "gin", "vodka", "rum", "whisky", "whiskey", "grappa", "amaro"];
      const isNotBeer = nonBeerKeywords.some((kw) => categories.includes(kw) || prodNameLower.includes(kw));
      if (!isNotBeer) {
        return true;
      }
    }
  }

  return false;
};

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  currentTargetBrand,
  onSuccess,
  showAlert,
  showConfirm,
  hideAlert,
}) => {
  if (!isOpen) return null;

  const handleBarcodePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    showAlert("Lettura del codice a barre in corso...", "Analisi in corso", false);

    // Create a temporary hidden div in the DOM if it doesn't exist
    let hiddenDiv = document.getElementById('hidden-reader-div');
    if (!hiddenDiv) {
      hiddenDiv = document.createElement('div');
      hiddenDiv.id = 'hidden-reader-div';
      hiddenDiv.style.display = 'none';
      document.body.appendChild(hiddenDiv);
    }

    const html5QrCode = new Html5Qrcode("hidden-reader-div", {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ],
      verbose: false,
    });

    html5QrCode
      .scanFile(file, true)
      .then((decodedText) => {
        hideAlert();
        showAlert("Verifica prodotto in corso...", "Validazione", false);

        fetch(`https://world.openfoodfacts.org/api/v2/product/${decodedText}.json`)
          .then((res) => res.json())
          .then((data) => {
            hideAlert();
            const targetBeer = beers.find((b) => b.brand === currentTargetBrand);

            const proceedToCapture = () => {
              if (targetBeer?.barcodes && targetBeer.barcodes.length > 0) {
                if (!targetBeer.barcodes.includes(decodedText)) {
                  showAlert("Il codice a barre non corrisponde a questa birra. Riprova!", "Codice Errato");
                  return;
                }
              }
              onSuccess(false);
            };

            if (data.status === 1) {
              const prod = data.product;
              const prodName = prod.product_name || prod.product_name_it || prod.product_name_en || "Prodotto sconosciuto";

              // 1. Strict anti-cheat: verify it is actually a beer
              if (!isProductBeer(prod)) {
                showAlert(
                  `Rilevato: "${prodName}". Sblocco annullato: questo codice a barre non appartiene a una birra.`,
                  "Prodotto Non Valido",
                  true,
                  () => {
                    onClose();
                  }
                );
                return;
              }

              // 2. Strict anti-cheat: check if the brand matches
              const matchesTarget = checkBrandMatch(currentTargetBrand, prod.brands || "", prodName);

              if (!matchesTarget) {
                // Check if it belongs to a known different brand in our database
                const identifiedBrand = getIdentifiedBrand(prod.brands || "", prodName, currentTargetBrand);

                if (identifiedBrand) {
                  // Block them completely (no bypass allowed since it's confirmed to be a different brand)
                  showAlert(
                    `Hai inquadrato una birra di marca "${identifiedBrand}" (${prodName}), ma stai cercando di sbloccare "${currentTargetBrand}". Gioca pulito!`,
                    "Sblocco Bloccato",
                    true,
                    () => {
                      onClose();
                    }
                  );
                  return;
                } else {
                  // If the brand is empty or unknown (craft beers not in our DB), allow them to proceed after confirmation
                  showConfirm(
                    `Il codice corrisponde a "${prodName}" di marca "${prod.brands || 'Non Specificata'}" (invece di "${currentTargetBrand}"). Vuoi procedere comunque?`,
                    "Marca Rilevata Differente",
                    proceedToCapture
                  );
                  return;
                }
              }
            } else {
              // Barcode not found on Open Food Facts: allow bypass in case of new/unlisted beers
              showConfirm(
                `Questo codice non è stato trovato nel database globale degli alimenti. Assicurati che si tratti di una birra e che sia del marchio "${currentTargetBrand}". Vuoi procedere comunque?`,
                "Prodotto non catalogato",
                proceedToCapture
              );
              return;
            }

            proceedToCapture();
          })
          .catch((err) => {
            console.error("Open Food Facts API error:", err);
            hideAlert();

            const targetBeer = beers.find((b) => b.brand === currentTargetBrand);
            if (targetBeer?.barcodes && targetBeer.barcodes.length > 0) {
              if (!targetBeer.barcodes.includes(decodedText)) {
                showAlert("Il codice a barre non corrisponde a questa birra. Riprova!", "Codice Errato");
                return;
              }
            }
            onSuccess(false);
          });
      })
      .catch((_err) => {
        hideAlert();
        showAlert(
          "Non sono riuscito a leggere chiaramente il codice a barre dalla foto. Riprova scattando una foto a fuoco e ben illuminata.",
          "Lettura Fallita"
        );
      });
  };

  const handleDraftBypass = () => {
    onSuccess(true);
  };

  return (
    <div className="auth-modal" style={{ zIndex: 18000 }}>
      <div className="auth-container" style={{ maxWidth: '400px', width: '95%', padding: '20px', boxSizing: 'border-box' }}>
        <h3 style={{ marginTop: 0, color: 'var(--dark)', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">barcode_scanner</span> Codice a Barre
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>
          Scatta una foto chiara al codice a barre sul retro per verificare l'autenticità di <strong>{currentTargetBrand}</strong>.
        </p>

        <label className="btn-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center', padding: '14px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
          <span className="material-symbols-outlined">photo_camera</span> Fotografa Codice a Barre
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleBarcodePhoto}
          />
        </label>

        <hr style={{ border: 0, borderTop: '1px solid var(--gray)', margin: '20px 0' }} />
        <p style={{ fontSize: '12px', color: 'var(--dark)', fontWeight: 'bold', marginTop: 0, textAlign: 'center' }}>
          Stai bevendo una birra alla spina?
        </p>
        <button
          className="btn-secondary"
          onClick={handleDraftBypass}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center', padding: '12px', marginTop: '5px', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}
        >
          <span className="material-symbols-outlined">local_drink</span> È alla spina (Salta Scanner)
        </button>

        <button
          className="btn-secondary"
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '15px', background: 'var(--danger)', color: 'white', border: 'none', width: '100%', boxSizing: 'border-box', padding: '12px' }}
        >
          <span className="material-symbols-outlined">close</span> Annulla
        </button>
      </div>
    </div>
  );
};
