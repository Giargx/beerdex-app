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
  points: number;
}

export function getEventMedals(userPosts: any[]): EventMedal[] {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Dynamic years from 2026 up to currentYear (remove 2025 and don't put 2027 until it's time)
  const years: number[] = [];
  for (let y = 2026; y <= currentYear; y++) {
    years.push(y);
  }
  // Sort years descending so newest events are first
  years.sort((a, b) => b - a);

  const medals: EventMedal[] = [];

  years.forEach(year => {
    // Filter posts for this year
    const yearPosts = userPosts.filter(p => p.time && new Date(p.time).getFullYear() === year);

    // Dynamic date checker helper: only show if the event period has started
    const isStarted = (startMonth: number) => {
      return new Date(year, startMonth, 1) <= now;
    };

    // Helper to get posts by month (0-indexed)
    const getPostsByMonth = (month: number) => {
      return yearPosts.filter(p => new Date(p.time).getMonth() === month);
    };

    // --- EVENTI STAGIONALI (10 birre, 10 punti) ---

    // 🌸 Primavera (Mar-Mag)
    if (isStarted(2)) { // March
      const springPosts = yearPosts.filter(p => {
        const m = new Date(p.time).getMonth();
        return m >= 2 && m <= 4;
      });
      const springCount = springPosts.filter(p => {
        const type = getBeerType(p.brand, p.variant);
        return type === "bianca"; // Blanche, Weizen, Saison map to "bianca"
      }).length;
      medals.push({
        id: `spring-${year}`,
        name: `Primavera ${year}`,
        year,
        icon: 'local_florist',
        color: '#E0F2FE',
        isUnlocked: springCount >= 10,
        desc: `Sblocca 10 birre Bianche (Blanche, Weizen, Saison) in Primavera (Mar-Mag). (${springCount}/10)`,
        points: 10
      });
    }

    // ☀️ Estate (Giu-Ago)
    if (isStarted(5)) { // June
      const summerPosts = yearPosts.filter(p => {
        const m = new Date(p.time).getMonth();
        return m >= 5 && m <= 7;
      });
      const summerCount = summerPosts.filter(p => {
        const type = getBeerType(p.brand, p.variant);
        return type === "bionda" || type === "ipa";
      }).length;
      medals.push({
        id: `summer-${year}`,
        name: `Estate ${year}`,
        year,
        icon: 'wb_sunny',
        color: '#FDE68A',
        isUnlocked: summerCount >= 10,
        desc: `Sblocca 10 Bionde o IPA in Estate (Giu-Ago). (${summerCount}/10)`,
        points: 10
      });
    }

    // 🍁 Autunno (Set-Nov)
    if (isStarted(8)) { // September
      const autumnPosts = yearPosts.filter(p => {
        const m = new Date(p.time).getMonth();
        return m >= 8 && m <= 10;
      });
      const autumnCount = autumnPosts.filter(p => {
        const type = getBeerType(p.brand, p.variant);
        const beer = beers.find(b => b.brand === p.brand);
        const isGerman = beer && beer.country === "Germania";
        return type === "rossa" || type === "ipa" || isGerman;
      }).length;
      medals.push({
        id: `autumn-${year}`,
        name: `Autunno ${year}`,
        year,
        icon: 'wb_twilight',
        color: '#FDBA74',
        isUnlocked: autumnCount >= 10,
        desc: `Sblocca 10 Rosse, IPA o Tedesche in Autunno (Set-Nov). (${autumnCount}/10)`,
        points: 10
      });
    }

    // ❄️ Inverno (Dic-Feb)
    if (isStarted(11)) { // December
      const winterPosts = yearPosts.filter(p => {
        const m = new Date(p.time).getMonth();
        return m === 11 || m === 0 || m === 1;
      });
      const winterCount = winterPosts.filter(p => {
        const type = getBeerType(p.brand, p.variant);
        return type === "scura" || type === "rossa";
      }).length;
      medals.push({
        id: `winter-${year}`,
        name: `Inverno ${year}`,
        year,
        icon: 'ac_unit',
        color: '#93C5FD',
        isUnlocked: winterCount >= 10,
        desc: `Sblocca 10 Scure o Rosse in Inverno (Dic-Feb). (${winterCount}/10)`,
        points: 10
      });
    }

    // --- EVENTI FESTIVITÀ (1 birra, 5 punti) ---

    // 1. 🎉 Capodanno (Gennaio)
    if (isStarted(0)) {
      const janPosts = getPostsByMonth(0);
      const count = janPosts.length;
      medals.push({
        id: `capodanno-${year}`,
        name: `Capodanno ${year}`,
        year,
        icon: 'celebration',
        color: '#FBBF24',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 birra qualsiasi a Gennaio. (${count}/1)`,
        points: 5
      });
    }

    // 2. 💖 San Valentino (Febbraio)
    if (isStarted(1)) {
      const febPosts = getPostsByMonth(1);
      const count = febPosts.filter(p => {
        const type = getBeerType(p.brand, p.variant);
        return type === "rossa" || type === "scura";
      }).length;
      medals.push({
        id: `valentino-${year}`,
        name: `San Valentino ${year}`,
        year,
        icon: 'favorite',
        color: '#F472B6',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 Rossa o Scura a San Valentino (Febbraio). (${count}/1)`,
        points: 5
      });
    }

    // 3. 🍀 San Patrizio (Marzo)
    if (isStarted(2)) {
      const marchPosts = getPostsByMonth(2);
      const IrishCount = marchPosts.filter(p => {
        const beer = beers.find(b => b.brand === p.brand);
        return beer && (beer.country === "Irlanda" || beer.country === "Scozia");
      }).length;
      medals.push({
        id: `patrizio-${year}`,
        name: `San Patrizio ${year}`,
        year,
        icon: 'eco',
        color: '#A7F3D0',
        isUnlocked: IrishCount >= 1,
        desc: `Sblocca 1 birra d'Irlanda/Scozia a Marzo. (${IrishCount}/1)`,
        points: 5
      });
    }

    // 4. 👨 Festa del Papà (Marzo)
    if (isStarted(2)) {
      const marchPosts = getPostsByMonth(2);
      const count = marchPosts.filter(p => {
        const beer = beers.find(b => b.brand === p.brand);
        return beer && (beer.rarity === "rara" || beer.rarity === "media");
      }).length;
      medals.push({
        id: `papa-${year}`,
        name: `Festa del Papà ${year}`,
        year,
        icon: 'person',
        color: '#93C5FD',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 birra Rara o Media per la Festa del Papà (Marzo). (${count}/1)`,
        points: 5
      });
    }

    // 5. 🥚 Pasqua (Aprile)
    if (isStarted(3)) {
      const aprilPosts = getPostsByMonth(3);
      const count = aprilPosts.filter(p => {
        const beer = beers.find(b => b.brand === p.brand);
        return beer && beer.country === "Belgio";
      }).length;
      medals.push({
        id: `pasqua-${year}`,
        name: `Pasqua ${year}`,
        year,
        icon: 'egg',
        color: '#FDE68A',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 birra belga a Pasqua (Aprile). (${count}/1)`,
        points: 5
      });
    }

    // 6. 🛠️ Festa del Lavoro (Maggio)
    if (isStarted(4)) {
      const mayPosts = getPostsByMonth(4);
      const count = mayPosts.filter(p => getBeerType(p.brand, p.variant) === "bionda").length;
      medals.push({
        id: `lavoro-${year}`,
        name: `Festa del Lavoro ${year}`,
        year,
        icon: 'build',
        color: '#6EE7B7',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 birra Bionda per la Festa del Lavoro (Maggio). (${count}/1)`,
        points: 5
      });
    }

    // 7. 🇮🇹 Festa della Repubblica (Giugno)
    if (isStarted(5)) {
      const junePosts = getPostsByMonth(5);
      const count = junePosts.filter(p => {
        const beer = beers.find(b => b.brand === p.brand);
        return beer && beer.country === "Italia";
      }).length;
      medals.push({
        id: `repubblica-${year}`,
        name: `Festa della Repubblica ${year}`,
        year,
        icon: 'flag',
        color: '#86EFAC',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 birra italiana a Giugno. (${count}/1)`,
        points: 5
      });
    }

    // 8. 🔥 Grigliata di Luglio (Luglio)
    if (isStarted(6)) {
      const julyPosts = getPostsByMonth(6);
      const count = julyPosts.filter(p => {
        const type = getBeerType(p.brand, p.variant);
        return type === "ipa" || type === "bionda";
      }).length;
      medals.push({
        id: `grigliata-${year}`,
        name: `Grigliata di Luglio ${year}`,
        year,
        icon: 'local_fire_department',
        color: '#FDBA74',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 IPA o Bionda per la Grigliata di Luglio. (${count}/1)`,
        points: 5
      });
    }

    // 9. 🍉 Ferragosto (Agosto)
    if (isStarted(7)) {
      const augustPosts = getPostsByMonth(7);
      const count = augustPosts.length;
      medals.push({
        id: `ferragosto-${year}`,
        name: `Ferragosto ${year}`,
        year,
        icon: 'celebration',
        color: '#FCA5A5',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 birra qualsiasi ad Agosto. (${count}/1)`,
        points: 5
      });
    }

    // 10. 🍻 Oktoberfest Inizio (Settembre)
    if (isStarted(8)) {
      const septPosts = getPostsByMonth(8);
      const count = septPosts.filter(p => {
        const beer = beers.find(b => b.brand === p.brand);
        return beer && beer.country === "Germania";
      }).length;
      medals.push({
        id: `oktoberfest-start-${year}`,
        name: `Oktoberfest Start ${year}`,
        year,
        icon: 'sports_bar',
        color: '#F59E0B',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 birra tedesca a Settembre per l'Oktoberfest. (${count}/1)`,
        points: 5
      });
    }

    // 11. 🍻 Oktoberfest Fine (Ottobre)
    if (isStarted(9)) {
      const octPosts = getPostsByMonth(9);
      const count = octPosts.filter(p => {
        const beer = beers.find(b => b.brand === p.brand);
        return beer && beer.country === "Germania";
      }).length;
      medals.push({
        id: `oktoberfest-end-${year}`,
        name: `Oktoberfest ${year}`,
        year,
        icon: 'sports_bar',
        color: '#D97706',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 birra tedesca ad Ottobre. (${count}/1)`,
        points: 5
      });
    }

    // 12. 🎃 Halloween (Ottobre)
    if (isStarted(9)) {
      const octoberPosts = getPostsByMonth(9);
      const darkOrRedCount = octoberPosts.filter(p => {
        const type = getBeerType(p.brand, p.variant);
        return type === "scura" || type === "rossa";
      }).length;
      medals.push({
        id: `halloween-${year}`,
        name: `Halloween ${year}`,
        year,
        icon: 'dark_mode',
        color: '#C084FC',
        isUnlocked: darkOrRedCount >= 1,
        desc: `Sblocca 1 Stout o Rossa ad Ottobre. (${darkOrRedCount}/1)`,
        points: 5
      });
    }

    // 13. 🍁 Castagnata (Novembre)
    if (isStarted(10)) {
      const novPosts = getPostsByMonth(10);
      const count = novPosts.filter(p => {
        const type = getBeerType(p.brand, p.variant);
        return type === "scura" || type === "rossa";
      }).length;
      medals.push({
        id: `castagnata-${year}`,
        name: `Castagnata ${year}`,
        year,
        icon: 'forest',
        color: '#B45309',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 Rossa o Scura a Novembre. (${count}/1)`,
        points: 5
      });
    }

    // 14. 🎄 Natale (Dicembre)
    if (isStarted(11)) {
      const decemberPosts = getPostsByMonth(11);
      const ChristmasCount = decemberPosts.filter(p => {
        const beer = beers.find(b => b.brand === p.brand);
        return beer && (beer.rarity === "rara" || beer.rarity === "media");
      }).length;
      medals.push({
        id: `natale-${year}`,
        name: `Natale ${year}`,
        year,
        icon: 'redeem',
        color: '#F87171',
        isUnlocked: ChristmasCount >= 1,
        desc: `Sblocca 1 birra Rara o Media a Dicembre. (${ChristmasCount}/1)`,
        points: 5
      });
    }

    // 15. 🎆 Vigilia di Capodanno (Dicembre)
    if (isStarted(11)) {
      const decemberPosts = getPostsByMonth(11);
      const count = decemberPosts.length;
      medals.push({
        id: `vigilia-${year}`,
        name: `Vigilia ${year}`,
        year,
        icon: 'auto_awesome',
        color: '#FCD34D',
        isUnlocked: count >= 1,
        desc: `Sblocca 1 birra qualsiasi a Dicembre per Capodanno. (${count}/1)`,
        points: 5
      });
    }
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
      variantsLength: beer.variants.length,
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
                    +{beerObj.variantsLength * 3}pt
                  </div>
                )}
                <div className="medal-icon-container" style={{ color: iconColor }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                    {medalIcon}
                  </span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--dark)', lineHeight: 1.2 }}>
                  Mastro<br />{beerObj.brand}
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
                    +{medal.points}pt
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
