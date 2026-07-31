// src/utils/imageModeration.ts

declare global {
  interface Window {
    tf: any;
    nsfwjs: any;
  }
}

let nsfwModelPromise: Promise<any> | null = null;
let isScriptLoading = false;

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
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
        // Load default mobile-friendly NSFWJS model
        const model = await window.nsfwjs.load();
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
      return { isSafe: true };
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const predictions = await model.classify(img);
          let isSafe = true;
          let reason = '';

          predictions.forEach((p: { className: string; probability: number }) => {
            if ((p.className === 'Porn' || p.className === 'Hentai') && p.probability > 0.35) {
              isSafe = false;
              reason = 'La foto contiene contenuto per adulti o esplicito e non può essere caricata.';
            } else if (p.className === 'Sexy' && p.probability > 0.80) {
              isSafe = false;
              reason = 'La foto contiene contenuto ammiccante/esplicito non appropriato.';
            }
          });

          resolve({ isSafe, reason, predictions });
        } catch (err) {
          console.warn('Errore analisi immagini:', err);
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
