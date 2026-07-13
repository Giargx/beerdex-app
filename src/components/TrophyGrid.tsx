import React from 'react';
import { beers, getBasePoints } from '../beers';

export interface PokedexEntry {
  photo: string;
  isShiny: boolean;
  isShared: boolean;
  taggedFriend: string | null;
  brand: string;
}

interface TrophyGridProps {
  pokedex: Record<string, PokedexEntry>;
  isPub: boolean;
  variantSortOption: "alpha" | "unlocked" | "rarity" | "nation";
  variantSortDir: number;
  medalSortOption: "alpha" | "unlocked" | "rarity" | "nation";
  medalSortDir: number;
  onDeleteEntry?: (brand: string, variant: string) => void;
  showDeleteButton?: boolean;
}

export const TrophyGrid: React.FC<TrophyGridProps> = ({
  pokedex,
  variantSortOption,
  variantSortDir,
  medalSortOption,
  medalSortDir,
  onDeleteEntry,
  showDeleteButton = false,
}) => {
  const rarityMap = { comune: 1, media: 2, rara: 3 };

  // Calculate unlock count per brand
  const brandUnlockCounts: Record<string, number> = {};
  beers.forEach((b) => {
    brandUnlockCounts[b.brand] = 0;
  });

  // Build the list of all variants
  const allVariantsList = beers.flatMap((beer) => {
    return beer.variants.map((variant) => {
      const uniqueId = `${beer.brand}-${variant}`;
      const entry = pokedex ? pokedex[uniqueId] : undefined;
      const isUnlocked = entry !== undefined;
      
      if (isUnlocked) {
        brandUnlockCounts[beer.brand]++;
      }

      const basePts = getBasePoints(beer.brand, variant);
      let finalPts = basePts;
      const muls: string[] = [];
      let isShiny = false;
      let isShared = false;
      let photo = '';

      if (isUnlocked && entry) {
        isShiny = entry.isShiny || false;
        isShared = entry.isShared || false;
        photo = entry.photo;
        
        if (isShiny) {
          finalPts *= 2;
          muls.push('auto_awesome'); // Material icon name
        }
        if (isShared) {
          finalPts *= 2;
          muls.push('group'); // Material icon name
        }
      }

      return {
        brand: beer.brand,
        variant,
        country: beer.country,
        rarity: beer.rarity,
        isUnlocked,
        isShiny,
        isShared,
        photo,
        finalPts,
        muls,
      };
    });
  });

  // Sort variants
  allVariantsList.sort((a, b) => {
    let res = 0;
    if (variantSortOption === 'alpha') {
      res = a.brand.localeCompare(b.brand) || a.variant.localeCompare(b.variant);
    } else if (variantSortOption === 'unlocked') {
      res = (a.isUnlocked === b.isUnlocked ? 0 : a.isUnlocked ? -1 : 1) || a.brand.localeCompare(b.brand);
    } else if (variantSortOption === 'rarity') {
      res = (rarityMap[a.rarity] || 0) - (rarityMap[b.rarity] || 0) || a.brand.localeCompare(b.brand);
    } else if (variantSortOption === 'nation') {
      res = a.country.localeCompare(b.country) || a.brand.localeCompare(b.brand);
    }
    return res * variantSortDir;
  });

  // Build the completed brand medals
  const brandMedalsList = beers.map((beer) => {
    const isCompleted = beer.variants.length > 0 && brandUnlockCounts[beer.brand] === beer.variants.length;
    return {
      brand: beer.brand,
      isCompleted,
      country: beer.country,
      rarity: beer.rarity,
    };
  });

  // Sort medals
  brandMedalsList.sort((a, b) => {
    let res = 0;
    if (medalSortOption === 'alpha') {
      res = a.brand.localeCompare(b.brand);
    } else if (medalSortOption === 'unlocked') {
      res = (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? -1 : 1) || a.brand.localeCompare(b.brand);
    } else if (medalSortOption === 'rarity') {
      res = (rarityMap[a.rarity] || 0) - (rarityMap[b.rarity] || 0) || a.brand.localeCompare(b.brand);
    } else if (medalSortOption === 'nation') {
      res = a.country.localeCompare(b.country) || a.brand.localeCompare(b.brand);
    }
    return res * medalSortDir;
  });

  return (
    <>
      {/* Medals Grid Section */}
      <div className="trophy-grid" id="brandMedalsGrid">
        {brandMedalsList.map((beerObj) => {
          const medalIcon = beerObj.isCompleted ? 'workspace_premium' : 'circle';
          const iconColor = beerObj.isCompleted ? 'var(--gold)' : 'var(--text-muted)';
          
          return (
            <div
              key={`medal-${beerObj.brand}`}
              className={`medal-badge-card ${beerObj.isCompleted ? 'unlocked' : ''}`}
            >
              {beerObj.isCompleted && (
                <div className="pts-badge" style={{ background: '#e67e22' }}>
                  +10pt
                </div>
              )}
              <div className="medal-icon-container" style={{ color: iconColor }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                  {medalIcon}
                </span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--dark)', lineHeight: 1.2 }}>
                Maestro<br />{beerObj.brand}
              </div>
            </div>
          );
        })}
      </div>

      {/* Title separator before variants */}
      <div style={{ borderBottom: '2px solid var(--gray)', margin: '15px 20px 20px 20px' }}></div>

      {/* Variants Grid Section */}
      <div className="trophy-grid" id="trophyGrid">
        {allVariantsList.map((item) => {
          const uniqueId = `${item.brand}-${item.variant}`;
          return (
            <div
              key={`variant-${uniqueId}`}
              className={`trophy-card ${item.isUnlocked ? 'unlocked' : ''} ${item.isShiny ? 'shiny-card' : ''}`}
            >
              {item.isUnlocked && (
                <div className="pts-badge">+{item.finalPts}pt</div>
              )}
              {item.isUnlocked && item.muls.length > 0 && (
                <div className="mul-badge">
                  {item.muls.map((iconName) => (
                    <span
                      key={iconName}
                      className="material-symbols-outlined"
                      style={{ fontSize: '12px' }}
                    >
                      {iconName}
                    </span>
                  ))}
                  <span>x{item.muls.length * 2}</span>
                </div>
              )}
              
              <div className="trophy-brand">{item.brand}</div>
              
              <div className="trophy-img-container">
                {item.isUnlocked ? (
                  <img src={item.photo} alt={item.variant} />
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                    sports_bar
                  </span>
                )}
              </div>
              
              <div className="trophy-name">{item.variant}</div>
              
              {showDeleteButton && item.isUnlocked && onDeleteEntry && (
                <button
                  className="btn-delete"
                  onClick={() => onDeleteEntry(item.brand, item.variant)}
                  title="Elimina sblocco"
                  style={{ position: 'absolute', bottom: '5px', right: '5px', opacity: 0.7 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    delete
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
