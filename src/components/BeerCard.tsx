import React from 'react';
import { getBeerType, getBasePoints, getCountryFlag } from '../beers';
import type { Beer } from '../beers';
import type { PokedexEntry } from './TrophyGrid';
import { StarRating } from './StarRating';

interface BeerCardProps {
  beer: Beer;
  myPokedex: Record<string, PokedexEntry>;
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
    if (safePokedex[`${beer.brand}-${v}`]) {
      brandDrunk++;
    }
  });

  const isCompleted = brandTotal > 0 && brandDrunk === brandTotal;

  const rawCode = beer.flag && beer.flag !== '🍺' ? beer.flag : getCountryFlag(beer.country);
  const countryCode = rawCode !== 'IT' && rawCode !== '🍺' ? rawCode : '';

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
            const entry = safePokedex[uniqueId];
            const hasPhoto = entry !== undefined;
            const specificPts = getBasePoints(beer.brand, variant);
            const typeKey = getBeerType(beer.brand, variant);

            return (
              <div key={uniqueId} className={`variant-item variant-type-${typeKey}`} onClick={(e) => e.stopPropagation()}>
                {/* Row 1: Left = Variant Name, Right = Unlock Button / Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A', lineHeight: '1.2' }}>
                    {variant}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {hasPhoto ? (
                      <div className="unlocked-status" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800, color: '#10B981' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              check_circle
                            </span>
                            <span>
                              {entry.isShiny ? (
                                <span style={{ color: 'var(--primary-dark)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
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
                              size={14}
                            />
                          </div>
                        </div>

                        <img
                          src={entry.photo}
                          className="thumb-preview"
                          alt={variant}
                          onContextMenu={(e) => e.preventDefault()}
                        />
                        <button
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteVariant(beer.brand, variant);
                          }}
                          title="Elimina foto"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
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

                {/* Row 2: Left = Points */}
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    ({specificPts} pt)
                  </span>
                </div>

                {/* Row 3: Left = Beer Style Type */}
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                  <span className="beer-type-label">
                    {typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}
                  </span>
                </div>
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
                Manca una variante di {beer.brand}? Proponila (+2pt)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};
