// src/utils/imageModeration.ts

declare global {
  interface Window {
    tf: any;
    nsfwjs: any;
  }
}

let nsfwModelInstance: any = null;
let nsfwModelPromise: Promise<any> | null = null;
let isScriptLoading = false;

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if ((window as any).nsfwjs || (window as any).tf) {
        resolve();
        return;
      }
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Impossibile caricare script ${src}`));
    document.head.appendChild(script);
  });
};

export const initModerationModel = async (): Promise<any> => {
  if (nsfwModelInstance) return nsfwModelInstance;
  if (nsfwModelPromise) return nsfwModelPromise;

  nsfwModelPromise = (async () => {
    try {
      if (isScriptLoading) return null;
      isScriptLoading = true;

      if (!window.tf) {
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
      }
      if (!window.nsfwjs) {
        await loadScript('https://cdn.jsdelivr.net/npm/nsfwjs@2.4.2/dist/nsfwjs.min.js');
      }

      if (window.nsfwjs) {
        // Carica il modello NSFWJS mobile-friendly
        const model = await window.nsfwjs.load();
        nsfwModelInstance = model;
        return model;
      }
      return null;
    } catch (err) {
      console.warn('Moderazione immagini non disponibile:', err);
      return null;
    } finally {
      isScriptLoading = false;
    }
  })();

  return nsfwModelPromise;
};

export interface ModerationResult {
  isSafe: boolean;
  reason?: string;
  predictions?: Array<{ className: string; probability: number }>;
}

export const checkImageSafety = async (imageBase64: string): Promise<ModerationResult> => {
  try {
    const model = await initModerationModel();
    if (!model) {
      console.warn('Modello AI di moderazione non pronto, impossibile verificare la foto.');
      return { isSafe: true };
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          // Renderizza l'immagine su un canvas per assicurare la compatibilità di lettura dei pixel con TensorFlow/NSFWJS
          const canvas = document.createElement('canvas');
          const width = img.naturalWidth || img.width || 299;
          const height = img.naturalHeight || img.height || 299;
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }

          // Analizza direttamente l'elemento canvas o img
          const predictions = await model.classify(ctx ? canvas : img);
          let isSafe = true;
          let reason = '';

          predictions.forEach((p: { className: string; probability: number }) => {
            // Soglie di moderazione più severe per bloccare nudo ed esplicito
            if ((p.className === 'Porn' || p.className === 'Hentai') && p.probability > 0.15) {
              isSafe = false;
              reason = 'La foto contiene contenuto per adulti o esplicito e non può essere caricata.';
            } else if (p.className === 'Sexy' && p.probability > 0.50) {
              isSafe = false;
              reason = 'La foto contiene contenuto ammiccante o esplicito non appropriato.';
            }
          });

          resolve({ isSafe, reason, predictions });
        } catch (err) {
          console.warn('Errore durante la classificazione AI dell\'immagine:', err);
          resolve({ isSafe: true });
        }
      };
      img.onerror = () => resolve({ isSafe: true });
      img.src = imageBase64;
    });
  } catch (err) {
    console.warn('Errore moderazione immagine:', err);
    return { isSafe: true };
  }
};
