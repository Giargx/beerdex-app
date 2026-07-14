import React from 'react';
import { beers, getBasePoints, getBeerType } from '../beers';

export interface PokedexEntry {
  photo: string;
  isShiny: boolean;
  isShared: boolean;
  taggedFriend: string | null;
  brand: string;
}

export interface EventMedal {
  id: string;
  name: string;
  year: number;
  icon: string;
  color: string;
  isUnlocked: boolean;
  desc: string;
}

export function getEventMedals(userPosts: any[]): EventMedal[] {
  const currentYear = new Date().getFullYear();
  const yearSet = new Set([2025, 2026, 2027, currentYear]);
  userPosts.forEach(p => {
    if (p.time) {
      const yr = new Date(p.time).getFullYear();
      if (!isNaN(yr)) yearSet.add(yr);
    }
  });

  const years = Array.from(yearSet).sort((a, b) => b - a);
  const medals: EventMedal[] = [];

  years.forEach(year => {
    // Filter posts for this year
    const yearPosts = userPosts.filter(p => p.time && new Date(p.time).getFullYear() === year);

    // 1. San Patrizio (March - Month index 2)
    const marchPosts = yearPosts.filter(p => new Date(p.time).getMonth() === 2);
    const irishScottishCount = marchPosts.filter(p => {
      const beer = beers.find(b => b.brand === p.brand);
      return beer && (beer.country === "Irlanda" || beer.country === "Scozia");
    }).length;
    const sanPatrizioUnlocked = irishScottishCount >= 2;
    medals.push({
      id: `patrizio-${year}`,
      name: `San Patrizio ${year}`,
      year,
      icon: 'eco',
      color: '#27ae60',
      isUnlocked: sanPatrizioUnlocked,
      desc: `Sblocca 2 birre d'Irlanda/Scozia a Marzo. (${irishScottishCount}/2)`
    });

    // 2. Solstizio d'Estate (June-August: month index 5, 6, 7)
    const summerPosts = yearPosts.filter(p => {
      const m = new Date(p.time).getMonth();
      return m >= 5 && m <= 7;
    });
    const summerCount = summerPosts.filter(p => {
      const type = getBeerType(p.brand, p.variant);
      return type === "bionda" || type === "ipa";
    }).length;
    const summerUnlocked = summerCount >= 3;
    medals.push({
      id: `summer-${year}`,
      name: `Solstizio d'Estate ${year}`,
      year,
      icon: 'wb_sunny',
      color: '#f39c12',
      isUnlocked: summerUnlocked,
      desc: `Sblocca 3 Bionde o IPA in Estate (Giu-Ago). (${summerCount}/3)`
    });

    // 3. Oktoberfest (September-October: month index 8, 9)
    const oktoberfestPosts = yearPosts.filter(p => {
      const m = new Date(p.time).getMonth();
      return m === 8 || m === 9;
    });
    const germanCount = oktoberfestPosts.filter(p => {
      const beer = beers.find(b => b.brand === p.brand);
      return beer && beer.country === "Germania";
    }).length;
    const oktoberfestUnlocked = germanCount >= 3;
    medals.push({
      id: `oktoberfest-${year}`,
      name: `Oktoberfest ${year}`,
      year,
      icon: 'sports_bar',
      color: '#d35400',
      isUnlocked: oktoberfestUnlocked,
      desc: `Sblocca 3 birre tedesche a Settembre/Ottobre. (${germanCount}/3)`
    });
  });

  return medals;
}

interface TrophyGridProps {
  pokedex: Record<string, PokedexEntry>;
  isPub?: boolean;
  variantSortOption: "alpha" | "unlocked" | "rarity" | "nation";
  variantSortDir: number;
  medalSortOption: "alpha" | "unlocked" | "rarity" | "nation";
  medalSortDir: number;
  onDeleteEntry?: (brand: string, variant: string) => void;
  showDeleteButton?: boolean;
  mode?: 'medals' | 'variants' | 'events';
  userPosts?: any[];
}

export const TrophyGrid: React.FC<TrophyGridProps> = ({
  pokedex,
  variantSortOption,
  variantSortDir,
  medalSortOption,
  medalSortDir,
  onDeleteEntry,
  showDeleteButton = false,
  mode,
  userPosts = [],
}) => {
  const rarityMap = { comune: 1, media: 2, rara: 3 };
  const eventMedalsList = getEventMedals(userPosts);

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
      {(!mode || mode === 'medals') && (
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
      )}

      {/* Title separator before variants - only if rendering both */}
      {!mode && (
        <div style={{ borderBottom: '2px solid var(--gray)', margin: '15px 20px 20px 20px' }}></div>
      )}

      {/* Variants Grid Section */}
      {(!mode || mode === 'variants') && (
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
                    <img
                      src={item.photo}
                      alt={item.variant}
                      onContextMenu={(e) => e.preventDefault()}
                    />
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
      )}

      {/* Event Medals Grid Section */}
      {mode === 'events' && (
        <div className="trophy-grid" id="eventMedalsGrid">
          {eventMedalsList.map((medal) => {
            const iconColor = medal.isUnlocked ? medal.color : 'var(--text-muted)';
            const medalIcon = medal.isUnlocked ? medal.icon : 'lock';
            return (
              <div
                key={medal.id}
                className={`medal-badge-card ${medal.isUnlocked ? 'unlocked' : ''}`}
                style={{
                  opacity: medal.isUnlocked ? 1 : 0.65,
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {medal.isUnlocked && (
                  <div className="pts-badge" style={{ background: '#27ae60' }}>
                    +15pt
                  </div>
                )}
                <div className="medal-icon-container" style={{ color: iconColor, marginBottom: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                    {medalIcon}
                  </span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--dark)', lineHeight: 1.2 }}>
                  {medal.name}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.2 }}>
                  {medal.desc}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
