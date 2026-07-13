import React from 'react';
import { getBeerType, getBasePoints } from '../beers';
import type { Beer } from '../beers';
import type { PokedexEntry } from './TrophyGrid';

interface BeerCardProps {
  beer: Beer;
  myPokedex: Record<string, PokedexEntry>;
  expanded: boolean;
  onToggle: () => void;
  onInitUnlock: (brand: string, variant: string) => void;
  onDeleteVariant: (brand: string, variant: string) => void;
}

export const BeerCard: React.FC<BeerCardProps> = ({
  beer,
  myPokedex,
  expanded,
  onToggle,
  onInitUnlock,
  onDeleteVariant,
}) => {
  // Check if all variants are completed
  const brandTotal = beer.variants.length;
  let brandDrunk = 0;
  beer.variants.forEach((v) => {
    if (myPokedex[`${beer.brand}-${v}`]) {
      brandDrunk++;
    }
  });

  const isCompleted = brandTotal > 0 && brandDrunk === brandTotal;

  const regionLabel = beer.country === 'Italia' && beer.regione
    ? `${beer.flag} ${beer.country} (${beer.regione})`
    : `${beer.flag} ${beer.country}`;

  return (
    <div
      className={`card ${expanded ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
      onClick={onToggle}
    >
      <div className="toggle-icon">
        <span className="material-symbols-outlined">expand_more</span>
      </div>
      
      <div className="card-badges">
        <span className="region">{regionLabel}</span>
        <span className={`rarity-badge rarity-${beer.rarity}`}>{beer.rarity}</span>
      </div>
      
      <h2 style={{ marginTop: 0 }}>
        {beer.brand}
        <span
          className="trophy"
          style={{
            display: isCompleted ? 'inline-block' : 'none',
            color: 'var(--primary-dark)',
            fontSize: '24px',
          }}
        >
          <span className="material-symbols-outlined">workspace_premium</span>
        </span>
      </h2>
      
      <div className="desc">{beer.desc}</div>
      
      <div className="variants-container">
        <div className="variants" onClick={(e) => e.stopPropagation()}>
          <p>Varianti da trovare:</p>
          {beer.variants.map((variant) => {
            const uniqueId = `${beer.brand}-${variant}`;
            const entry = myPokedex[uniqueId];
            const hasPhoto = entry !== undefined;
            const specificPts = getBasePoints(beer.brand, variant);
            const typeKey = getBeerType(beer.brand, variant);

            return (
              <div key={uniqueId} className="variant-item" onClick={(e) => e.stopPropagation()}>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    {variant}{' '}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                      ({specificPts} pt)
                    </span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                    <span className={`beer-type-dot type-${typeKey}`}></span>
                    <span className="beer-type-label">
                      {typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}
                    </span>
                  </div>
                </div>

                {hasPhoto ? (
                  <div className="unlocked-status">
                    <span className="material-symbols-outlined" style={{ marginRight: '2px', fontSize: '16px' }}>
                      check_circle
                    </span>
                    <span>
                      {entry.isShiny ? (
                        <>
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '14px', verticalAlign: 'text-bottom', color: 'var(--primary-dark)' }}
                          >
                            auto_awesome
                          </span>{' '}
                          Shiny
                        </>
                      ) : (
                        'Sbloccato'
                      )}
                    </span>
                    <img
                      src={entry.photo}
                      className="thumb-preview"
                      alt={variant}
                      onClick={() => {
                        // Optional preview action if needed, or do nothing since doubletap works on feed
                      }}
                    />
                    <button
                      className="btn-delete"
                      onClick={() => onDeleteVariant(beer.brand, variant)}
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
            );
          })}
        </div>
      </div>
    </div>
  );
};
