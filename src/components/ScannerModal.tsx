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
              const categoriesTags = prod.categories_tags || [];
              const categories = (prod.categories || "").toLowerCase();
              const prodNameLower = prodName.toLowerCase();

              const beerTags = ["en:beers", "en:beers-with-alcohol", "en:alcohol-free-beers", "en:radlers", "en:beers-of-the-world"];
              const isBeerByTag = categoriesTags.some((tag: string) => beerTags.includes(tag));

              const beerKeywords = ["beer", "birra", "bière", "bier", "cerveza", "stout", "ipa", "lager", "ale", "pils", "pilsner", "weisse", "radler", "tripel", "dubbel"];
              const isBeerByKeyword = beerKeywords.some((kw) => categories.includes(kw) || prodNameLower.includes(kw));

              const isBeer = isBeerByTag || isBeerByKeyword;

              if (!isBeer) {
                showAlert(
                  "Impossibile caricare la foto: il codice non corrisponde a una birra.",
                  "Errore",
                  true,
                  () => {
                    onClose();
                  }
                );
                return;
              }

              const scannedBrand = (prod.brands || "").toLowerCase();
              const targetBrandNormalized = currentTargetBrand.toLowerCase();
              const isBrandMatch =
                scannedBrand.includes(targetBrandNormalized) ||
                targetBrandNormalized.includes(scannedBrand) ||
                prodNameLower.includes(targetBrandNormalized) ||
                (scannedBrand === "" && prodNameLower.includes(targetBrandNormalized));

              if (!isBrandMatch && prod.brands) {
                showConfirm(
                  `Il codice corrisponde alla birra "${prodName}" di marca "${prod.brands}" (invece di "${currentTargetBrand}"). Vuoi procedere comunque?`,
                  "Marca Rilevata Differente",
                  proceedToCapture
                );
                return;
              }
            } else {
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
      <div className="auth-container" style={{ maxWidth: '400px', width: '95%', padding: '20px' }}>
        <h3 style={{ marginTop: 0, color: 'var(--dark)', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">barcode_scanner</span> Codice a Barre
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px' }}>
          Scatta una foto chiara al codice a barre sul retro per verificare l'autenticità di <strong>{currentTargetBrand}</strong>.
        </p>

        <label className="btn-main" style={{ display: 'flex', textAlign: 'center', padding: '14px', cursor: 'pointer', justifyContent: 'center' }}>
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
        <p style={{ fontSize: '12px', color: 'var(--dark)', fontWeight: 'bold', marginTop: 0 }}>
          Stai bevendo una birra alla spina?
        </p>
        <button
          className="btn-secondary"
          onClick={handleDraftBypass}
          style={{ display: 'flex', textAlign: 'center', padding: '12px', marginTop: '5px', cursor: 'pointer', justifyContent: 'center', width: '100%' }}
        >
          <span className="material-symbols-outlined">local_drink</span> È alla spina (Salta Scanner)
        </button>

        <button
          className="btn-secondary"
          onClick={onClose}
          style={{ marginTop: '15px', background: 'var(--danger)', color: 'white', border: 'none', justifyContent: 'center' }}
        >
          Annulla
        </button>
      </div>
    </div>
  );
};
