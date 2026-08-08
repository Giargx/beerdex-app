import React, { useState, useEffect } from 'react';
import type { Beer } from '../beers';

export interface AdminMoveBeerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername?: string;
  initialOldKey?: string;
  allBeersCatalog?: Beer[];
  onConfirmMove: (targetUsername: string, oldKey: string, newBrand: string, newVariant: string) => Promise<void> | void;
}

export const AdminMoveBeerModal: React.FC<AdminMoveBeerModalProps> = ({
  isOpen,
  onClose,
  targetUsername = '',
  initialOldKey = '',
  allBeersCatalog = [],
  onConfirmMove,
}) => {
  const [user, setUser] = useState(targetUsername);
  const [oldKey, setOldKey] = useState(initialOldKey);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [customVariant, setCustomVariant] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUser(targetUsername || '');
      setOldKey(initialOldKey || '');
      setErrorMessage('');
      setIsSubmitting(false);

      if (allBeersCatalog.length > 0) {
        const defaultBrand = allBeersCatalog.find((b) => b && b.brand === 'Abbaye de Forest') || allBeersCatalog[0];
        if (defaultBrand) {
          setSelectedBrand(defaultBrand.brand);
          setSelectedVariant((defaultBrand.variants && defaultBrand.variants[0]) || 'Classica');
        }
      }
    }
  }, [isOpen, targetUsername, initialOldKey, allBeersCatalog]);

  if (!isOpen) return null;

  const currentBrandObj = allBeersCatalog.find((b) => b && b.brand === selectedBrand);
  const availableVariants = currentBrandObj ? currentBrandObj.variants || ['Classica'] : ['Classica'];

  const handleBrandChange = (brandName: string) => {
    setSelectedBrand(brandName);
    const found = allBeersCatalog.find((b) => b && b.brand === brandName);
    if (found && found.variants && found.variants.length > 0) {
      setSelectedVariant(found.variants[0]);
    } else {
      setSelectedVariant('Classica');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim()) {
      setErrorMessage('Inserisci il nickname dell\'utente.');
      return;
    }
    if (!oldKey.trim()) {
      setErrorMessage('Inserisci la chiave o il nome della birra attuale da spostare.');
      return;
    }
    if (!selectedBrand.trim()) {
      setErrorMessage('Seleziona la marca di destinazione.');
      return;
    }

    const finalVariant = (customVariant.trim() || selectedVariant.trim() || 'Classica');

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onConfirmMove(user.trim(), oldKey.trim(), selectedBrand.trim(), finalVariant);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Errore durante lo spostamento della birra.');
    }
  };

  return (
    <div className="auth-modal" style={{ zIndex: 20000, padding: '20px 10px 70px 10px', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div
        className="auth-container"
        style={{
          maxWidth: '440px',
          width: '96%',
          maxHeight: '84vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          textAlign: 'left',
          padding: '24px 18px',
          borderRadius: '24px',
        }}
      >
        <h3 style={{ marginTop: 0, color: 'var(--dark)', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ color: '#6366F1' }}>move_down</span>
          Sposta Variante / Marca (Admin)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', textAlign: 'center', lineHeight: 1.4 }}>
          Sposta una bevuta o foto caricata da una scheda/variante errata o duplicata direttamente alla variante canonica desiderata.
        </p>

        {errorMessage && (
          <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '14px', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
              Utente Propriatario *
            </label>
            <input
              type="text"
              placeholder="Username (es. forne02)"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px', borderRadius: '12px', border: '1px solid var(--gray)' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
              Chiave / Nome Birra Attuale da Spostare *
            </label>
            <input
              type="text"
              placeholder="es. Abbaye De Forest-Brune o Baia Deforest"
              value={oldKey}
              onChange={(e) => setOldKey(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px', borderRadius: '12px', border: '1px solid var(--gray)' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
              Marca di Destinazione *
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => handleBrandChange(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--gray)',
                background: 'white',
                boxSizing: 'border-box',
                margin: 0,
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {allBeersCatalog.map((b) => (
                <option key={b.brand} value={b.brand}>
                  {b.brand} ({b.country})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Variante Destinazione *
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => {
                  setSelectedVariant(e.target.value);
                  setCustomVariant('');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--gray)',
                  background: 'white',
                  boxSizing: 'border-box',
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {availableVariants.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Oppure Nuova Variante
              </label>
              <input
                type="text"
                placeholder="es. Brune"
                value={customVariant}
                onChange={(e) => setCustomVariant(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', margin: 0, padding: '12px', borderRadius: '12px', border: '1px solid var(--gray)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <button
              type="submit"
              className="btn-main"
              disabled={isSubmitting}
              style={{ width: '100%', margin: 0, background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}
            >
              <span className="material-symbols-outlined">sync_alt</span>
              Conferma Spostamento
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
