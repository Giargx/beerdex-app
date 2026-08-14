import React from 'react';
import { getBeerType, getBasePoints, getCountryFlag, stripStr } from '../beers';
import type { Beer } from '../beers';
import type { PokedexEntry } from './TrophyGrid';
import { StarRating } from './StarRating';

interface BeerCardProps {
  beer: Beer;
  myPokedex: Record<string, PokedexEntry>;
  globalAverageRatings?: Record<string, { average: number; count: number }>;
  expanded: boolean;
  onToggle: () => void;
  onInitUnlock: (brand: string, variant: string) => void;
  onDeleteVariant: (brand: string, variant: string) => void;
  onOpenProposeModal?: (brandPrefill: string) => void;
  onRateBeer?: (brand: string, variant: string, rating: number) => void;
  isAdminUser?: boolean;
  onDeleteCustomBeerCatalog?: (brand: string) => void;
}

export const BeerCard: React.FC<BeerCardProps> = ({
  beer,
  myPokedex,
  globalAverageRatings,
  expanded,
  onToggle,
  onInitUnlock,
  onDeleteVariant,
  onOpenProposeModal,
  onRateBeer,
  isAdminUser,
  onDeleteCustomBeerCatalog,
}) => {
  if (!beer || !beer.brand) return null;

  const safePokedex = myPokedex || {};
  const variants = Array.isArray(beer.variants) && beer.variants.length > 0 ? beer.variants : ['Classica'];
  const brandTotal = variants.length;
  let brandDrunk = 0;
  variants.forEach((v) => {
    const uId = `${beer.brand}-${v}`;
    const normBrand = stripStr(beer.brand);
    const normVar = stripStr(v);
    const hasEntry = !!safePokedex[uId] || Object.keys(safePokedex).some((pKey) => {
      const pVal = safePokedex[pKey];
      if (!pVal) return false;
      const pBrand = pVal.brand || (pKey.includes('-') ? pKey.split('-')[0] : pKey);
      const pVariant = pVal.variant || (pKey.includes('-') ? pKey.split('-').slice(1).join('-') : 'Classica');
      return (stripStr(pBrand) === normBrand || normBrand.includes(stripStr(pBrand)) || stripStr(pBrand).includes(normBrand)) &&
             (stripStr(pVariant) === normVar || normVar.includes(stripStr(pVariant)) || stripStr(pVariant).includes(normVar));
    });
    if (hasEntry) {
      brandDrunk++;
    }
  });

  const isCompleted = brandTotal > 0 && brandDrunk === brandTotal;

  const rawCode = (beer.flag && beer.flag !== '🍺' && beer.flag !== '??' && beer.flag !== 'XX') ? beer.flag : getCountryFlag(beer.country);
  const countryCode = (rawCode && rawCode !== 'IT' && rawCode !== 'XX' && rawCode !== '??') ? rawCode : '';

  let regionLabel = '';
  if (beer.country === 'Italia') {
    regionLabel = beer.regione ? `Italia (${beer.regione})` : 'Italia';
  } else {
    regionLabel = countryCode ? `${beer.country} (${countryCode})` : beer.country;
  }

  return (
    <div
      className={`card ${expanded ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
      onClick={onToggle}
      style={{
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 14px',
        overflow: 'hidden',
      }}
    >
      <div>
        <div className="card-badges" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <span className="region" style={{ fontSize: '11px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{regionLabel}</span>
          <span className={`rarity-badge rarity-${beer.rarity}`} style={{ fontSize: '10px' }}>{beer.rarity}</span>
        </div>
        
        <h2 style={{ marginTop: 0, fontSize: '17px', lineHeight: '1.2', wordBreak: 'break-word', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <span>{beer.brand}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isAdminUser && onDeleteCustomBeerCatalog && (
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCustomBeerCatalog(beer.brand);
                }}
                style={{
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  padding: '3px 7px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
                title="Elimina marca/categoria dal catalogo (Admin)"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete_forever</span>
              </button>
            )}
            <span
              className="trophy"
              style={{
                display: isCompleted ? 'inline-block' : 'none',
                color: 'var(--primary-dark)',
                fontSize: '22px',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined">workspace_premium</span>
            </span>
          </div>
        </h2>
        
        <div className="desc" style={{ fontSize: '12px', lineHeight: '1.35', color: 'var(--text-muted)', marginBottom: '8px', wordBreak: 'break-word' }}>{beer.desc}</div>
      </div>
      
      <div className="variants-container">
        <div className="variants-container-inner">
          <div className="variants" onClick={(e) => e.stopPropagation()}>
            <p>Varianti da trovare:</p>
          {variants.map((variant) => {
            const uniqueId = `${beer.brand}-${variant}`;
            const normBrand = stripStr(beer.brand);
            const normVar = stripStr(variant);
            const matchingKey = Object.keys(safePokedex).find((pKey) => {
              if (pKey === uniqueId) return true;
              const pVal = safePokedex[pKey];
              if (!pVal) return false;
              const pBrand = pVal.brand || (pKey.includes('-') ? pKey.split('-')[0] : pKey);
              const pVariant = pVal.variant || (pKey.includes('-') ? pKey.split('-').slice(1).join('-') : 'Classica');
              return (stripStr(pBrand) === normBrand || normBrand.includes(stripStr(pBrand)) || stripStr(pBrand).includes(normBrand)) &&
                     (stripStr(pVariant) === normVar || normVar.includes(stripStr(pVariant)) || stripStr(pVariant).includes(normVar));
            });
            const entry = matchingKey ? safePokedex[matchingKey] : undefined;
            const hasPhoto = entry !== undefined;
            const specificPts = getBasePoints(beer.brand, variant);
            const typeKey = (beer.variantTypes && (beer.variantTypes[variant] || Object.entries(beer.variantTypes).find(([k]) => stripStr(k) === normVar)?.[1])) ||
                            beer.beerType ||
                            getBeerType(beer.brand, variant);

            return (
              <div key={uniqueId} className={`variant-item variant-type-${typeKey}`} onClick={(e) => e.stopPropagation()}>
                {/* Row 1: Left = Variant Name, Right = Unlock Button / Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', lineHeight: '1.2' }}>
                    {variant}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {hasPhoto ? (
                      <div className="unlocked-status" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, color: '#10B981', whiteSpace: 'nowrap' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                              check_circle
                            </span>
                            <span>
                              {entry.isShiny ? (
                                <span style={{ color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                                    auto_awesome
                                  </span>
                                  Shiny
                                </span>
                              ) : (
                                'Sbloccato'
                              )}
                            </span>
                          </div>

                          <div onClick={(e) => e.stopPropagation()}>
                            <StarRating
                              rating={entry.rating || 0}
                              onRate={(r) => onRateBeer?.(beer.brand, variant, r)}
                              size={13}
                            />
                          </div>
                        </div>

                        {/* Thumbnail with overlay Trash Icon Badge */}
                        <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                          <img
                            src={entry.photo}
                            alt={variant}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              border: '2px solid var(--primary)',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              display: 'block',
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteVariant(beer.brand, variant);
                            }}
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: '#EF4444',
                              color: '#FFFFFF',
                              border: '2px solid #FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 5px rgba(239,68,68,0.4)',
                              padding: 0,
                              zIndex: 2,
                            }}
                            title="Elimina sblocco variante"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '13px', fontWeight: 900 }}>delete</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="photo-btn"
                        onClick={() => onInitUnlock(beer.brand, variant)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          photo_camera
                        </span>{' '}
                        Sblocca
                      </button>
                    )}
                  </div>
                </div>

                {/* Row 2: Left = Points & Beer Style */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, lineHeight: '1.1' }}>
                    ({specificPts} pt)
                  </span>
                  <span className="beer-type-label">
                    {typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}
                  </span>
                </div>

                {/* Row 3: Global Average Rating (Calcolata da TUTTI gli utenti dell'app) */}
                {(() => {
                  const key = `${beer.brand}-${variant}`.trim().toLowerCase();
                  const globalStats = globalAverageRatings?.[key];
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {globalStats && globalStats.count > 0 ? (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255, 179, 0, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.35)',
                            padding: '3px 9px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#D97706',
                          }}
                          title={`Valutazione media: ${globalStats.average} / 5 calcolata su ${globalStats.count} ${globalStats.count === 1 ? 'voto' : 'voti'} della community`}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#F59E0B', fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span>{globalStats.average.toFixed(1)}</span>
                          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                            ({globalStats.count} {globalStats.count === 1 ? 'valutazione' : 'valutazioni'})
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#94A3B8',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#CBD5E1' }}>
                            star
                          </span>
                          <span>Non ancora valutata</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}

          {onOpenProposeModal && (
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--gray)', textAlign: 'center' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProposeModal(beer.brand);
                }}
                style={{
                  background: 'rgba(255, 179, 0, 0.08)',
                  border: '1px solid rgba(255, 111, 0, 0.25)',
                  color: 'var(--primary-dark)',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
                Manca una variante di {beer.brand}? Proponila (+1pt)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};
