import React, { useState, useEffect } from 'react';
import { formatBeerTitle, type Beer } from '../beers';
import { checkImageSafety } from '../utils/imageModeration';
import { containsProfanity } from '../utils/textFilter';

export interface BeerProposalData {
  brand: string;
  variant: string;
  beerType: "bionda" | "rossa" | "scura" | "bianca" | "ipa";
  country: string;
  regione?: string;
  rarity: "comune" | "media" | "rara";
  desc?: string;
  photo: string;
  isVariantProposal?: boolean;
  taggedFriends?: string[];
}

interface ProposeBeerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBrandSearch?: string;
  initialVariantPrefill?: string;
  initialRarityPrefill?: "comune" | "media" | "rara";
  initialDescPrefill?: string;
  allBeersCatalog?: Beer[];
  myFriendsList?: string[];
  globalAvatars?: Record<string, string>;
  globalDisplayNames?: Record<string, string>;
  onSubmitProposal: (proposalData: BeerProposalData) => void;
}

export const ProposeBeerModal: React.FC<ProposeBeerModalProps> = ({
  isOpen,
  onClose,
  initialBrandSearch = '',
  initialVariantPrefill = '',
  initialDescPrefill = '',
  allBeersCatalog = [],
  myFriendsList = [],
  globalAvatars = {},
  globalDisplayNames = {},
  onSubmitProposal,
}) => {
  const [brand, setBrand] = useState(initialBrandSearch);
  const [variant, setVariant] = useState(initialVariantPrefill);
  const [beerType, setBeerType] = useState<"bionda" | "rossa" | "scura" | "bianca" | "ipa" | "">('');
  const [country, setCountry] = useState('');
  const [regione, setRegione] = useState('Tutte');
  const [desc, setDesc] = useState(initialDescPrefill);
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [selectedTaggedFriends, setSelectedTaggedFriends] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if current brand input matches an existing brand in catalog
  const existingBeer = (allBeersCatalog || []).find(
    (b) => b && b.brand && b.brand.trim().toLowerCase() === brand.trim().toLowerCase()
  );

  useEffect(() => {
    if (isOpen) {
      const searchBrand = (initialBrandSearch || '').trim();
      setBrand(searchBrand);
      const vPrefill = initialVariantPrefill || '';
      setVariant(vPrefill);
      setBeerType('');
      setPhotoBase64('');
      setSelectedTaggedFriends([]);
      setErrorMessage('');

      const matched = (allBeersCatalog || []).find(
        (b) => b && b.brand && b.brand.trim().toLowerCase() === searchBrand.toLowerCase()
      );
      if (matched) {
        setCountry(matched.country || 'Italia');
        setRegione(matched.regione || 'Tutte');
        setDesc(matched.desc || '');
      } else {
        setCountry('');
        setRegione('Tutte');
        setDesc(initialDescPrefill || '');
      }
    }
  }, [isOpen, initialBrandSearch, initialVariantPrefill, initialDescPrefill, allBeersCatalog]);

  // Auto-compilazione Nazione, Regione e Descrizione quando la marca inserita esiste nel catalogo
  useEffect(() => {
    if (!isOpen) return;
    if (existingBeer) {
      if (existingBeer.country) setCountry(existingBeer.country);
      if (existingBeer.regione) setRegione(existingBeer.regione);
      else setRegione('Tutte');
      if (existingBeer.desc) setDesc(existingBeer.desc);
    } else if (!initialBrandSearch) {
      setDesc('');
    }
  }, [brand, existingBeer, isOpen, initialBrandSearch]);

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

    if (!variant.trim()) {
      setErrorMessage('Inserisci il nome della variante.');
      return;
    }

    if (!beerType) {
      setErrorMessage('Seleziona la tipologia di birra (Bionda, Rossa, Scura, Bianca o IPA).');
      return;
    }

    if (!existingBeer && !country.trim()) {
      setErrorMessage('Scrivi la nazione di provenienza della birra.');
      return;
    }

    const effectiveVariant = variant.trim();
    const effectiveCountry = country.trim() ? formatBeerTitle(country.trim()) : 'Non specificata';

    if (!photoBase64) {
      setErrorMessage('Scatta o seleziona una foto della birra.');
      return;
    }
    if (containsProfanity(brand) || containsProfanity(effectiveVariant) || containsProfanity(desc) || containsProfanity(effectiveCountry)) {
      setErrorMessage('La marca, la variante, la nazione o la descrizione contengono termini non appropriati o blasfemi.');
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
      beerType: beerType as "bionda" | "rossa" | "scura" | "bianca" | "ipa",
      country: effectiveCountry,
      regione: effectiveCountry.toLowerCase() === 'italia' && regione !== 'Tutte' ? regione : undefined,
      rarity: 'comune', // Impostata dagli Admin in fase di accettazione
      desc: desc.trim() || `Birra ${formattedBrand} (${formattedVariant})`,
      photo: photoBase64,
      isVariantProposal: !!existingBeer,
      taggedFriends: selectedTaggedFriends,
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

  const isBrandLocked = !!existingBeer;

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
          Gli admin valuteranno la tua proposta. Se approvata, la birra entrerà nel catalogo e sbloccherai un <strong>Bonus di +2 Punti</strong> (nuova marca) o <strong>+1 Punto</strong> (nuova variante)!
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
              placeholder="Moretti, Ichnusa, Heineken,..."
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              disabled={isBrandLocked}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                margin: 0,
                padding: '12px',
                opacity: isBrandLocked ? 0.75 : 1,
                background: isBrandLocked ? '#F1F5F9' : 'white',
                cursor: isBrandLocked ? 'not-allowed' : 'text',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Nome Variante *
              </label>
              <input
                type="text"
                placeholder=""
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px', borderRadius: '12px', border: '1px solid var(--gray)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Tipologia *
              </label>
              <select
                value={beerType}
                onChange={(e) => setBeerType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--gray)',
                  background: 'white',
                  boxSizing: 'border-box',
                  margin: 0,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: beerType ? 'var(--dark)' : 'var(--text-muted)',
                }}
              >
                <option value="">Seleziona...</option>
                <option value="bionda">🍺 Bionda</option>
                <option value="rossa">🔴 Rossa</option>
                <option value="scura">🌑 Scura</option>
                <option value="bianca">⚪ Bianca</option>
                <option value="ipa">🌿 IPA</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: country.trim().toLowerCase() === 'italia' ? '1fr 1fr' : '1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Nazione {existingBeer ? '' : '*'}
              </label>
              <input
                type="text"
                placeholder="Scrivi nazione (es. Giappone, Italia, Germania...)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={!!existingBeer}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--gray)',
                  opacity: existingBeer ? 0.8 : 1,
                  background: existingBeer ? '#F1F5F9' : 'white',
                  cursor: existingBeer ? 'not-allowed' : 'text',
                  boxSizing: 'border-box',
                  margin: 0,
                }}
              />
            </div>

            {country.trim().toLowerCase() === 'italia' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                  Regione (opzionale)
                </label>
                <select
                  value={regione}
                  onChange={(e) => setRegione(e.target.value)}
                  disabled={!!existingBeer}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--gray)',
                    opacity: existingBeer ? 0.8 : 1,
                    background: existingBeer ? '#F1F5F9' : 'white',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    cursor: existingBeer ? 'not-allowed' : 'pointer',
                  }}
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
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
              Foto della Birra *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <label className="btn-secondary" style={{ flex: 1, margin: 0, padding: '10px 6px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
                  Scatta Foto
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />
                </label>
                <label className="btn-secondary" style={{ flex: 1, margin: 0, padding: '10px 6px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_library</span>
                  Galleria
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              {photoBase64 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--gray)', marginTop: '2px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--primary)', flexShrink: 0 }}>
                    <img src={photoBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold' }}>Foto caricata con successo!</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
              Descrizione o Note
            </label>
            <input
              type="text"
              placeholder=""
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              disabled={!!existingBeer}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                margin: 0,
                padding: '10px 12px',
                fontSize: '13px',
                opacity: existingBeer ? 0.75 : 1,
                background: existingBeer ? '#F1F5F9' : 'white',
                cursor: existingBeer ? 'not-allowed' : 'text',
              }}
            />
          </div>

          {/* Proponi in compagnia / Tagga Amici */}
          {myFriendsList && myFriendsList.length > 0 && (
            <div style={{ marginBottom: '16px', background: '#F8FAFC', padding: '12px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#D97706' }}>group</span>
                Proponi in Compagnia (Tagga Amici)
              </label>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                Sei al pub con amici? Tagga gli amici che bevono con te: quando la proposta verrà approvata dagli admin, sia tu che loro sbloccherete la birra e riceverete i punti!
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
                {myFriendsList.map((f) => {
                  const isSelected = selectedTaggedFriends.includes(f);
                  const disp = (globalDisplayNames && globalDisplayNames[f]) || f;
                  const avat = globalAvatars && globalAvatars[f];
                  return (
                    <div
                      key={f}
                      onClick={() => {
                        setSelectedTaggedFriends((prev) =>
                          prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
                        );
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        border: '1px solid ' + (isSelected ? '#F59E0B' : '#E2E8F0'),
                        background: isSelected ? '#FEF3C7' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: '#E2E8F0', flexShrink: 0 }}>
                          {avat ? (
                            <img src={avat} alt={f} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', margin: '5px', color: '#64748B' }}>person</span>
                          )}
                        </div>
                        <span>{disp} <small style={{ color: '#64748B', fontWeight: 500 }}>(@{f})</small></span>
                      </div>
                      <span className="material-symbols-outlined" style={{ color: isSelected ? '#D97706' : '#94A3B8', fontSize: '20px' }}>
                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
