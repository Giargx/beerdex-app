import React, { useState, useEffect } from 'react';
import { formatBeerTitle, stripStr, type Beer } from '../beers';
import type { BeerProposalItem } from './AdminProposalsModal';
import { checkImageSafety } from '../utils/imageModeration';

export interface AdminReviewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: BeerProposalItem | null;
  onAccept: (updatedProposal: BeerProposalItem) => void;
  onReject: (proposalId: string) => void;
  allBeersCatalog?: Beer[];
  globalAvatars?: Record<string, string>;
  globalDisplayNames?: Record<string, string>;
}

const ItalianRegions = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto'
];

const beerStyles: Array<{ id: "bionda" | "rossa" | "scura" | "bianca" | "ipa"; label: string; icon: string; color: string; bg: string; border: string }> = [
  { id: 'bionda', label: 'Bionda / Lager', icon: 'sports_bar', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
  { id: 'rossa', label: 'Rossa / Ambrata', icon: 'local_fire_department', color: '#B91C1C', bg: '#FEE2E2', border: '#FECACA' },
  { id: 'scura', label: 'Scura / Stout', icon: 'dark_mode', color: '#78350F', bg: '#F5E6D3', border: '#DECAA0' },
  { id: 'bianca', label: 'Bianca / Weiss', icon: 'snowing', color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' },
  { id: 'ipa', label: 'IPA & Craft', icon: 'glass_cup', color: '#047857', bg: '#D1FAE5', border: '#A7F3D0' },
];

const rarities: Array<{ id: "comune" | "media" | "rara"; label: string; pts: string; color: string; bg: string; border: string }> = [
  { id: 'comune', label: 'Comune', pts: '1 pt base', color: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
  { id: 'media', label: 'Media', pts: '2 pt base', color: '#0369A1', bg: '#E0F2FE', border: '#BAE6FD' },
  { id: 'rara', label: 'Rara', pts: '5 pt base', color: '#6D28D9', bg: '#EDE9FE', border: '#DDD6FE' },
];

export const AdminReviewProposalModal: React.FC<AdminReviewProposalModalProps> = ({
  isOpen,
  onClose,
  proposal,
  onAccept,
  onReject,
  allBeersCatalog = [],
  globalAvatars = {},
  globalDisplayNames = {},
}) => {
  const [brand, setBrand] = useState('');
  const [variant, setVariant] = useState('');
  const [beerType, setBeerType] = useState<"bionda" | "rossa" | "scura" | "bianca" | "ipa">('bionda');
  const [country, setCountry] = useState('Italia');
  const [regione, setRegione] = useState('Tutte');
  const [rarity, setRarity] = useState<"comune" | "media" | "rara">('comune');
  const [desc, setDesc] = useState('');
  const [photo, setPhoto] = useState('');
  const [isVariantProposal, setIsVariantProposal] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(2);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  useEffect(() => {
    if (isOpen && proposal) {
      setBrand(proposal.brand || '');
      setVariant(proposal.variant || '');
      setBeerType(proposal.beerType || 'bionda');
      setCountry(proposal.country || 'Italia');
      setRegione(proposal.regione || 'Tutte');
      setRarity(proposal.rarity || 'comune');
      setDesc(proposal.desc || '');
      setPhoto(proposal.photo || '');
      
      const isVariant = Boolean(proposal.isVariantProposal);
      setIsVariantProposal(isVariant);
      setBonusPoints(proposal.bonusPoints ?? (isVariant ? 1 : 2));
      setTaggedFriends(Array.isArray(proposal.taggedFriends) ? [...proposal.taggedFriends] : []);
      setErrorMessage('');
    }
  }, [isOpen, proposal]);

  if (!isOpen || !proposal) return null;

  const authorName = proposal.proposedBy || 'Utente';
  const authorDisplayName = globalDisplayNames[authorName] || authorName;
  const authorAvatar = globalAvatars[authorName];
  const dateStr = new Date(proposal.timestamp || Date.now()).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Check if brand exists in catalog
  const strippedBrand = brand.trim() ? stripStr(brand) : '';
  const existingBeerInCatalog = strippedBrand
    ? (allBeersCatalog || []).find(
        (b) =>
          b &&
          b.brand &&
          (stripStr(b.brand) === strippedBrand ||
            b.brand.trim().toLowerCase() === brand.trim().toLowerCase() ||
            formatBeerTitle(b.brand) === formatBeerTitle(brand))
      )
    : undefined;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
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
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setPhoto(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFriendTag = (friendNick: string) => {
    setTaggedFriends((prev) => prev.filter((f) => f !== friendNick));
  };

  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) {
      setErrorMessage('Inserisci la marca della birra.');
      return;
    }
    if (!variant.trim()) {
      setErrorMessage('Inserisci il nome della variante.');
      return;
    }
    if (!photo) {
      setErrorMessage('La foto della birra è obbligatoria.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Safety check on photo if modified
    if (photo !== proposal.photo) {
      const safety = await checkImageSafety(photo);
      if (!safety.isSafe) {
        setIsSubmitting(false);
        setErrorMessage(safety.reason || 'La foto contiene contenuti non consentiti.');
        return;
      }
    }

    const formattedBrand = formatBeerTitle(brand.trim());
    const formattedVariant = formatBeerTitle(variant.trim());
    const formattedCountry = formatBeerTitle((country || 'Non specificata').trim());

    const updatedProposal: BeerProposalItem = {
      ...proposal,
      brand: formattedBrand,
      variant: formattedVariant,
      beerType: beerType,
      country: formattedCountry,
      regione: formattedCountry.toLowerCase() === 'italia' && regione !== 'Tutte' ? regione : undefined,
      rarity: rarity,
      desc: desc.trim() || `Birra ${formattedBrand} (${formattedVariant})`,
      photo: photo,
      isVariantProposal: isVariantProposal,
      bonusPoints: bonusPoints,
      taggedFriends: taggedFriends,
    };

    onAccept(updatedProposal);
    setIsSubmitting(false);
    onClose();
  };

  const handleRejectClick = () => {
    if (window.confirm(`Sei sicuro di voler rifiutare la proposta per "${brand || proposal.brand} - ${variant || proposal.variant}"?`)) {
      onReject(proposal.proposalId);
      onClose();
    }
  };

  return (
    <div
      className="auth-modal"
      style={{
        zIndex: 100000,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '20px 12px 90px 12px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="auth-container"
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
          textAlign: 'left',
          padding: '24px 20px',
          borderRadius: '24px',
          background: '#FFFFFF',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
        }}
      >
        {/* Header with Admin Badge & Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: '8px',
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>shield</span>
              ADMIN
            </span>
            <h3 style={{ margin: 0, color: 'var(--dark)', fontSize: '18px', fontWeight: 900 }}>
              Valuta & Modifica Proposta
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Proposer Info Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#CBD5E1', overflow: 'hidden', border: '2px solid #FFFFFF', flexShrink: 0 }}>
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontWeight: 900 }}>
                  {authorDisplayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--dark)' }}>
                {authorDisplayName} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>@{authorName}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Inviata il {dateStr}
              </div>
            </div>
          </div>
          <span
            style={{
              background: proposal.status === 'accepted' ? '#ECFDF5' : proposal.status === 'rejected' ? '#FEF2F2' : '#FEF3C7',
              color: proposal.status === 'accepted' ? '#059669' : proposal.status === 'rejected' ? '#DC2626' : '#D97706',
              border: `1px solid ${proposal.status === 'accepted' ? '#A7F3D0' : proposal.status === 'rejected' ? '#FECACA' : '#FDE68A'}`,
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
            }}
          >
            {proposal.status === 'accepted' ? 'Approvata' : proposal.status === 'rejected' ? 'Rifiutata' : 'In Attesa'}
          </span>
        </div>

        {/* Proposal Type Switcher (Nuova Marca +2pt vs Nuova Variante +1pt) */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
            Tipo di Aggiunta & Punti Bonus per l'Utente *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div
              onClick={() => {
                setIsVariantProposal(false);
                setBonusPoints(2);
              }}
              style={{
                border: !isVariantProposal ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                background: !isVariantProposal ? '#FFFDF5' : '#FFFFFF',
                borderRadius: '14px',
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: !isVariantProposal ? '#F59E0B' : '#94A3B8', fontSize: '22px' }}>
                {!isVariantProposal ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: !isVariantProposal ? '#92400E' : 'var(--dark)' }}>
                  Nuova Marca
                </div>
                <div style={{ fontSize: '10px', color: '#B45309', fontWeight: 700 }}>
                  +2 Punti Bonus
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                setIsVariantProposal(true);
                setBonusPoints(1);
              }}
              style={{
                border: isVariantProposal ? '2px solid #0284C7' : '1px solid #E2E8F0',
                background: isVariantProposal ? '#F0F9FF' : '#FFFFFF',
                borderRadius: '14px',
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: isVariantProposal ? '#0284C7' : '#94A3B8', fontSize: '22px' }}>
                {isVariantProposal ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: isVariantProposal ? '#0369A1' : 'var(--dark)' }}>
                  Nuova Variante
                </div>
                <div style={{ fontSize: '10px', color: '#0284C7', fontWeight: 700 }}>
                  +1 Punto Bonus
                </div>
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', color: '#B91C1C', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '14px', textAlign: 'center', fontWeight: 700 }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleAcceptSubmit}>
          {/* Photo Preview & Replace */}
          <div style={{ marginBottom: '16px', background: '#F8FAFC', padding: '12px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
              Foto della Birra Proposta *
            </label>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div
                onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '2px solid var(--primary)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  position: 'relative',
                }}
                title="Tocca per ingrandire"
              >
                {photo ? (
                  <img src={photo} alt={brand} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E2E8F0', color: '#64748B' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>no_photography</span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.6)', borderRadius: '6px', padding: '2px 4px', color: 'white', fontSize: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>zoom_in</span>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>
                  ✓ Foto caricata dall'utente
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <label
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--dark)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary-dark)' }}>photo_camera</span>
                    Sostituisci
                    <input type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>

            {/* In-modal Zoom Preview */}
            {isPhotoZoomed && photo && (
              <div
                onClick={() => setIsPhotoZoomed(false)}
                style={{
                  marginTop: '10px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #CBD5E1',
                  maxHeight: '260px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0F172A',
                  cursor: 'zoom-out',
                }}
              >
                <img src={photo} alt="Zoom" style={{ maxHeight: '260px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            )}
          </div>

          {/* Brand & Variant Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Marca / Birrificio *
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="es. Menabrea, Ichnusa..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--gray)',
                  fontSize: '13px',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  margin: 0,
                  outline: 'none',
                }}
              />
              {existingBeerInCatalog && (
                <span style={{ fontSize: '10px', color: '#0369A1', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                  ✓ Già a catalogo
                </span>
              )}
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Nome Variante *
              </label>
              <input
                type="text"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                placeholder="es. 150° Bionda, Non Filtrata..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--gray)',
                  fontSize: '13px',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  margin: 0,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Beer Style (Tipologia) Selection */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
              Tipologia / Stile di Birra *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '6px' }}>
              {beerStyles.slice(0, 3).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setBeerType(st.id)}
                  style={{
                    padding: '8px 6px',
                    borderRadius: '12px',
                    border: beerType === st.id ? `2px solid ${st.color}` : '1px solid var(--gray)',
                    background: beerType === st.id ? st.bg : '#FFFFFF',
                    color: beerType === st.id ? st.color : 'var(--dark)',
                    fontWeight: 800,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    boxShadow: beerType === st.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: st.color }}>{st.icon}</span>
                  <span>{st.label.split(' / ')[0]}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {beerStyles.slice(3).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setBeerType(st.id)}
                  style={{
                    padding: '8px 6px',
                    borderRadius: '12px',
                    border: beerType === st.id ? `2px solid ${st.color}` : '1px solid var(--gray)',
                    background: beerType === st.id ? st.bg : '#FFFFFF',
                    color: beerType === st.id ? st.color : 'var(--dark)',
                    fontWeight: 800,
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    boxShadow: beerType === st.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: st.color }}>{st.icon}</span>
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rarity Selection */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '6px' }}>
              Rarità e Punti Base a Catalogo *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {rarities.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRarity(r.id)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: '12px',
                    border: rarity === r.id ? `2px solid ${r.color}` : '1px solid var(--gray)',
                    background: rarity === r.id ? r.bg : '#FFFFFF',
                    color: rarity === r.id ? r.color : 'var(--dark)',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    transition: 'all 0.15s ease',
                    boxShadow: rarity === r.id ? '0 3px 10px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <span>{r.label}</span>
                  <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: 700 }}>+{r.pts}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Country & Region Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Nazione di Provenienza *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Italia, Germania, Belgio..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--gray)',
                    fontSize: '13px',
                    fontWeight: 700,
                    boxSizing: 'border-box',
                    margin: 0,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
                Regione Italiana
              </label>
              <select
                value={regione}
                onChange={(e) => setRegione(e.target.value)}
                disabled={country.trim().toLowerCase() !== 'italia' && country.trim() !== ''}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--gray)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--dark)',
                  background: country.trim().toLowerCase() === 'italia' || !country.trim() ? '#FFFFFF' : '#F1F5F9',
                  boxSizing: 'border-box',
                  margin: 0,
                  cursor: 'pointer',
                  opacity: country.trim().toLowerCase() === 'italia' || !country.trim() ? 1 : 0.6,
                }}
              >
                <option value="Tutte">Tutta Italia / Nessuna</option>
                {ItalianRegions.map((reg) => (
                  <option key={reg} value={reg}>📍 {reg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--dark)', display: 'block', marginBottom: '4px' }}>
              Descrizione o Note della Birra
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={`Birra ${brand} (${variant})`}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1.5px solid var(--gray)',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                margin: 0,
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          {/* Tagged Friends in the Drinking session */}
          {taggedFriends && taggedFriends.length > 0 && (
            <div style={{ marginBottom: '18px', background: '#FEF3C7', padding: '12px 14px', borderRadius: '16px', border: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group</span>
                  Amici Taggati nel Brindisi ({taggedFriends.length})
                </span>
                <span style={{ fontSize: '10px', color: '#B45309', fontWeight: 700 }}>
                  Riceveranno sblocco e +{bonusPoints} pt
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {taggedFriends.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#FFFFFF',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#78350F',
                      border: '1px solid #FDE68A',
                    }}
                  >
                    <span>@{f}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFriendTag(f)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Rimuovi tag"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Accept & Add to Catalog, Reject, Cancel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
              Approva & Aggiungi al Catalogo (+{bonusPoints}pt a @{authorName})
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={handleRejectClick}
                disabled={isSubmitting}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #FECACA',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                Rifiuta Proposta
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--gray)',
                  background: '#FFFFFF',
                  color: 'var(--dark)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Annulla
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
