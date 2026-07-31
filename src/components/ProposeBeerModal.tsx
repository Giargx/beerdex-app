import React, { useState, useEffect } from 'react';
import { formatBeerTitle, type Beer } from '../beers';
import { checkImageSafety } from '../utils/imageModeration';
import { containsProfanity } from '../utils/textFilter';

export interface BeerProposalData {
  brand: string;
  variant: string;
  country: string;
  regione?: string;
  rarity: "comune" | "media" | "rara";
  desc?: string;
  photo: string;
}

interface ProposeBeerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBrandSearch?: string;
  initialVariantPrefill?: string;
  initialRarityPrefill?: "comune" | "media" | "rara";
  initialDescPrefill?: string;
  allBeersCatalog?: Beer[];
  onSubmitProposal: (proposalData: BeerProposalData) => void;
}

export const ProposeBeerModal: React.FC<ProposeBeerModalProps> = ({
  isOpen,
  onClose,
  initialBrandSearch = '',
  initialVariantPrefill = '',
  initialRarityPrefill = 'comune',
  initialDescPrefill = '',
  allBeersCatalog = [],
  onSubmitProposal,
}) => {
  const [brand, setBrand] = useState(initialBrandSearch);
  const [variant, setVariant] = useState(initialVariantPrefill);
  const [country, setCountry] = useState('Italia');
  const [regione, setRegione] = useState('Tutte');
  const [desc, setDesc] = useState(initialDescPrefill);
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if current brand input matches an existing brand in catalog
  const existingBeer = (allBeersCatalog || []).find(
    (b) => b && b.brand && b.brand.trim().toLowerCase() === brand.trim().toLowerCase()
  );

  useEffect(() => {
    if (isOpen) {
      setBrand(initialBrandSearch || '');
      setVariant(initialVariantPrefill || '');
      setDesc(initialDescPrefill || '');
      setPhotoBase64('');
      setErrorMessage('');

      const matched = (allBeersCatalog || []).find(
        (b) => b && b.brand && b.brand.trim().toLowerCase() === (initialBrandSearch || '').trim().toLowerCase()
      );
      if (matched) {
        setCountry(matched.country || 'Italia');
        setRegione(matched.regione || 'Tutte');
        if (matched.desc) setDesc(matched.desc);
      } else {
        setCountry('Italia');
        setRegione('Tutte');
      }
    }
  }, [isOpen, initialBrandSearch, initialVariantPrefill, initialDescPrefill, allBeersCatalog]);

  // Auto-compilazione Nazione e Regione quando la marca inserita esiste nel catalogo
  useEffect(() => {
    if (existingBeer) {
      if (existingBeer.country) setCountry(existingBeer.country);
      if (existingBeer.regione) setRegione(existingBeer.regione);
      else setRegione('Tutte');
      if (existingBeer.desc && !desc) setDesc(existingBeer.desc);
    }
  }, [brand, existingBeer]);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 750;
        const MAX_HEIGHT = 750;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.65);
          setPhotoBase64(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) {
      setErrorMessage('Inserisci la marca della birra.');
      return;
    }

    const effectiveVariant = variant.trim() ? variant.trim() : 'Classica';

    if (!photoBase64) {
      setErrorMessage('Scatta o seleziona una foto della birra.');
      return;
    }
    if (containsProfanity(brand) || containsProfanity(effectiveVariant) || containsProfanity(desc)) {
      setErrorMessage('La marca, la variante o la descrizione contengono termini non appropriati o blasfemi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Analisi contenuti espliciti
    const safety = await checkImageSafety(photoBase64);
    if (!safety.isSafe) {
      setIsSubmitting(false);
      setErrorMessage(safety.reason || 'La foto contiene contenuto per adulti o esplicito e non può essere caricata.');
      return;
    }

    const formattedBrand = formatBeerTitle(brand.trim());
    const formattedVariant = formatBeerTitle(effectiveVariant);

    onSubmitProposal({
      brand: formattedBrand,
      variant: formattedVariant,
      country,
      regione: country === 'Italia' && regione !== 'Tutte' ? regione : undefined,
      rarity: 'comune', // Impostata dagli Admin in fase di accettazione
      desc: desc.trim() || `Birra ${formattedBrand} (${formattedVariant})`,
      photo: photoBase64,
    });
    setIsSubmitting(false);
    onClose();
  };

  const ItalianRegions = [
    'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
    'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
    'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
    'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'
  ];

  return (
    <div className="auth-modal" style={{ zIndex: 19000, padding: '20px 10px 70px 10px', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div
        className="auth-container"
        style={{
          maxWidth: '440px',
          width: '96%',
          maxHeight: '82vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          textAlign: 'left',
          padding: '24px 18px 24px 18px',
          borderRadius: '24px',
        }}
      >
        <h3 style={{ marginTop: 0, color: 'var(--dark)', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary-dark)' }}>sports_bar</span>
          Proponi Nuova Birra
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', textAlign: 'center', lineHeight: 1.4 }}>
          Gli admin valuteranno la tua proposta. Se approvata, la birra entrerà nell'app, la sbloccherai subito e riceverai un <strong>Bonus di +2 Punti</strong>!
        </p>

        {errorMessage && (
          <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '14px', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
              Marca / Birrificio *
            </label>
            <input
              type="text"
              placeholder="es. Moretti, BrewDog, Baladin..."
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px' }}
            />
            {existingBeer && (
              <div style={{ fontSize: '11px', color: '#059669', background: '#D1FAE5', padding: '6px 10px', borderRadius: '8px', marginTop: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>verified</span>
                Marca esistente! Nazione ({existingBeer.country}){existingBeer.regione && existingBeer.regione !== 'Tutte' ? ` e Regione (${existingBeer.regione})` : ''} pre-compilate in automatico.
              </div>
            )}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
              Variante / Stile <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(opzionale)</span>
            </label>
            <input
              type="text"
              placeholder="es. IPA, Non Filtrata... (Se vuoto: Classica)"
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: country === 'Italia' ? '1fr 1fr' : '1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Nazione {existingBeer && <span style={{ color: '#059669', fontSize: '10px' }}>(Automatico)</span>}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={!!existingBeer}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--gray)', opacity: existingBeer ? 0.8 : 1, background: existingBeer ? '#F1F5F9' : 'white' }}
              >
                <option value="Non specificata">Non specificata / Non so</option>
                <option value="Italia">Italia</option>
                <option value="Germania">Germania</option>
                <option value="Belgio">Belgio</option>
                <option value="Paesi Bassi">Paesi Bassi</option>
                <option value="Repubblica Ceca">Repubblica Ceca</option>
                <option value="Danimarca">Danimarca</option>
                <option value="Spagna">Spagna</option>
                <option value="Francia">Francia</option>
                <option value="Irlanda">Irlanda</option>
                <option value="Scozia">Scozia</option>
                <option value="Portogallo">Portogallo</option>
                <option value="Messico">Messico</option>
                <option value="Stati Uniti">Stati Uniti</option>
              </select>
            </div>

            {country === 'Italia' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                  Regione (opzionale) {existingBeer && <span style={{ color: '#059669', fontSize: '10px' }}>(Automatico)</span>}
                </label>
                <select
                  value={regione}
                  onChange={(e) => setRegione(e.target.value)}
                  disabled={!!existingBeer}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--gray)', opacity: existingBeer ? 0.8 : 1, background: existingBeer ? '#F1F5F9' : 'white' }}
                >
                  <option value="Tutte">Nessuna specifica</option>
                  {ItalianRegions.map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
              Foto della Birra *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label className="btn-secondary" style={{ flexGrow: 1, margin: 0, padding: '10px', fontSize: '13px', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">photo_camera</span>
                {photoBase64 ? 'Cambia Foto' : 'Carica Foto'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
              </label>
              {photoBase64 && (
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--primary)', flexShrink: 0 }}>
                  <img src={photoBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
              Descrizione o Note (opzionale)
            </label>
            <input
              type="text"
              placeholder="es. Trovata al pub X, note di gusto..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '10px 12px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px', paddingBottom: '10px' }}>
            <button
              type="submit"
              className="btn-main"
              disabled={isSubmitting}
              style={{ width: '100%', margin: 0 }}
            >
              <span className="material-symbols-outlined">send</span>
              Invia Proposta
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ width: '100%', margin: 0 }}
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
