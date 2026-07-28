import React from 'react';
import { beers, getBasePoints, getBeerType } from '../beers';

export interface PokedexEntry {
  photo: string;
  isShiny: boolean;
  isShared: boolean;
  taggedFriend: string | null;
  brand: string;
  rating?: number;
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

  // We evaluate current year and next year
  const years = [currentYear, currentYear + 1];
  years.sort((a, b) => b - a);

  const medals: EventMedal[] = [];

  const addMedalIfValid = (medal: EventMedal, startDate: Date, endDate: Date) => {
    // 1. If unlocked, always include it so the user keeps earned trophies
    if (medal.isUnlocked) {
      medals.push(medal);
      return;
    }
    // 2. If currently active, include it
    if (now >= startDate && now <= endDate) {
      medals.push(medal);
      return;
    }
    // 3. If in the future, include it if it's upcoming (within 1 year)
    if (now < startDate && startDate.getTime() - now.getTime() <= 365 * 24 * 60 * 60 * 1000) {
      medals.push(medal);
      return;
    }
    // 4. If in the past and NOT unlocked, DO NOT include it
  };

  // Helper for Easter / Pasquetta
  const getEasterDate = (year: number) => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const L = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * L) / 451);
    const month = Math.floor((h + L - 7 * m + 114) / 31);
    const day = ((h + L - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  };

  years.forEach(year => {
    // --- 1. EVENTI STAGIONALI (10 birre, 10 punti) ---

    // 🌸 Primavera (21 Mar - 20 Giu)
    const springStart = new Date(year, 2, 21, 0, 0, 0);
    const springEnd = new Date(year, 5, 20, 23, 59, 59);
    const springPosts = userPosts.filter(p => {
      const t = new Date(p.time);
      return t >= springStart && t <= springEnd;
    });
    const springCount = springPosts.filter(p => getBeerType(p.brand, p.variant) === "bianca").length;
    addMedalIfValid({
      id: `spring-${year}`,
      name: `Primavera ${year}`,
      year,
      icon: 'local_florist',
      color: '#E0F2FE',
      isUnlocked: springCount >= 10,
      desc: `Sblocca 10 birre Bianche (Blanche, Weizen, Saison) dal 21 Mar al 20 Giu. (${springCount}/10)`,
      points: 10
    }, springStart, springEnd);

    // ☀️ Estate (21 Giu - 22 Set)
    const summerStart = new Date(year, 5, 21, 0, 0, 0);
    const summerEnd = new Date(year, 8, 22, 23, 59, 59);
    const summerPosts = userPosts.filter(p => {
      const t = new Date(p.time);
      return t >= summerStart && t <= summerEnd;
    });
    const summerCount = summerPosts.filter(p => {
      const type = getBeerType(p.brand, p.variant);
      return type === "bionda" || type === "ipa";
    }).length;
    addMedalIfValid({
      id: `summer-${year}`,
      name: `Estate ${year}`,
      year,
      icon: 'wb_sunny',
      color: '#FDE68A',
      isUnlocked: summerCount >= 10,
      desc: `Sblocca 10 birre Bionde o IPA dal 21 Giu al 22 Set. (${summerCount}/10)`,
      points: 10
    }, summerStart, summerEnd);

    // 🍁 Autunno (23 Set - 20 Dic)
    const autumnStart = new Date(year, 8, 23, 0, 0, 0);
    const autumnEnd = new Date(year, 11, 20, 23, 59, 59);
    const autumnPosts = userPosts.filter(p => {
      const t = new Date(p.time);
      return t >= autumnStart && t <= autumnEnd;
    });
    const autumnCount = autumnPosts.filter(p => {
      const type = getBeerType(p.brand, p.variant);
      const beer = beers.find(b => b.brand === p.brand);
      const isGerman = beer && beer.country === "Germania";
      return type === "rossa" || type === "ipa" || isGerman;
    }).length;
    addMedalIfValid({
      id: `autumn-${year}`,
      name: `Autunno ${year}`,
      year,
      icon: 'wb_twilight',
      color: '#FDBA74',
      isUnlocked: autumnCount >= 10,
      desc: `Sblocca 10 birre Rosse, IPA o Tedesche dal 23 Set al 20 Dic. (${autumnCount}/10)`,
      points: 10
    }, autumnStart, autumnEnd);

    // ❄️ Inverno Y (21 Dic Y-1 - 20 Mar Y) -> Associato all'anno Y (anno con più mesi)
    const winterStart = new Date(year - 1, 11, 21, 0, 0, 0);
    const winterEnd = new Date(year, 2, 20, 23, 59, 59);
    const winterPosts = userPosts.filter(p => {
      const t = new Date(p.time);
      return t >= winterStart && t <= winterEnd;
    });
    const winterCount = winterPosts.filter(p => {
      const type = getBeerType(p.brand, p.variant);
      return type === "scura" || type === "rossa";
    }).length;
    addMedalIfValid({
      id: `winter-${year}`,
      name: `Inverno ${year}`,
      year,
      icon: 'ac_unit',
      color: '#93C5FD',
      isUnlocked: winterCount >= 10,
      desc: `Sblocca 10 birre Scure o Rosse dal 21 Dic al 20 Mar. (${winterCount}/10)`,
      points: 10
    }, winterStart, winterEnd);

    // --- 2. EVENTI FESTIVITÀ BIRRA (3 o 5 punti) ---

    // 🍀 San Patrizio (15 - 21 Mar) -> 3 punti
    const patrizioStart = new Date(year, 2, 15, 0, 0, 0);
    const patrizioEnd = new Date(year, 2, 21, 23, 59, 59);
    const patrizioPosts = userPosts.filter(p => {
      const t = new Date(p.time);
      return t >= patrizioStart && t <= patrizioEnd;
    });
    const patrizioCount = patrizioPosts.filter(p => {
      const beer = beers.find(b => b.brand === p.brand);
      const type = getBeerType(p.brand, p.variant);
      return (beer && (beer.country === "Irlanda" || beer.country === "Scozia")) || type === "scura";
    }).length;
    addMedalIfValid({
      id: `patrizio-${year}`,
      name: `San Patrizio ${year}`,
      year,
      icon: 'eco',
      color: '#A7F3D0',
      isUnlocked: patrizioCount >= 1,
      desc: `Sblocca 1 birra Irlandese, Scozzese o Scura per San Patrizio (15-21 Mar). (${patrizioCount}/1)`,
      points: 3
    }, patrizioStart, patrizioEnd);

    // 🧺 Pasquetta (Weekend Pasquetta) -> 3 punti
    const easterDate = getEasterDate(year);
    const pasquettaStart = new Date(easterDate);
    pasquettaStart.setDate(easterDate.getDate() - 1);
    pasquettaStart.setHours(0, 0, 0, 0);
    const pasquettaEnd = new Date(easterDate);
    pasquettaEnd.setDate(easterDate.getDate() + 1);
    pasquettaEnd.setHours(23, 59, 59, 999);
    const pasquettaPosts = userPosts.filter(p => {
      const t = new Date(p.time);
      return t >= pasquettaStart && t <= pasquettaEnd;
    });
    const pasquettaCount = pasquettaPosts.filter(p => {
      const beer = beers.find(b => b.brand === p.brand);
      const type = getBeerType(p.brand, p.variant);
      return (beer && beer.country === "Belgio") || type === "bionda";
    }).length;
    addMedalIfValid({
      id: `pasquetta-${year}`,
      name: `Pasquetta ${year}`,
      year,
      icon: 'egg',
      color: '#FDE68A',
      isUnlocked: pasquettaCount >= 1,
      desc: `Sblocca 1 birra Belga o Bionda a Pasquetta. (${pasquettaCount}/1)`,
      points: 3
    }, pasquettaStart, pasquettaEnd);

    // ☀️ Ferragosto (14 - 16 Ago) -> 3 punti
    const ferragostoStart = new Date(year, 7, 14, 0, 0, 0);
    const ferragostoEnd = new Date(year, 7, 16, 23, 59, 59);
    const ferragostoPosts = userPosts.filter(p => {
      const t = new Date(p.time);
      return t >= ferragostoStart && t <= ferragostoEnd;
    });
    const ferragostoCount = ferragostoPosts.length;
    addMedalIfValid({
      id: `ferragosto-${year}`,
      name: `Ferragosto ${year}`,
      year,
      icon: 'celebration',
      color: '#FCA5A5',
      isUnlocked: ferragostoCount >= 1,
      desc: `Sblocca 1 birra qualsiasi per il brindisi di Ferragosto (14-16 Ago). (${ferragostoCount}/1)`,
      points: 3
    }, ferragostoStart, ferragostoEnd);

    // 🍺 Oktoberfest (16 Set - 4 Ott) -> 5 punti
    const oktoberfestStart = new Date(year, 8, 16, 0, 0, 0);
    const oktoberfestEnd = new Date(year, 9, 4, 23, 59, 59);
    const oktoberfestPosts = userPosts.filter(p => {
      const t = new Date(p.time);
      return t >= oktoberfestStart && t <= oktoberfestEnd;
    });
    const oktoberfestCount = oktoberfestPosts.filter(p => {
      const beer = beers.find(b => b.brand === p.brand);
      return beer && beer.country === "Germania";
    }).length;
    addMedalIfValid({
      id: `oktoberfest-${year}`,
      name: `Oktoberfest ${year}`,
      year,
      icon: 'sports_bar',
      color: '#F59E0B',
      isUnlocked: oktoberfestCount >= 3,
      desc: `Sblocca 3 birre tedesche durante l'Oktoberfest (16 Set - 4 Ott). (${oktoberfestCount}/3)`,
      points: 5
    }, oktoberfestStart, oktoberfestEnd);
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
  allBeersCatalog?: any[];
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
  allBeersCatalog = beers,
}) => {
  const [medalsOpen, setMedalsOpen] = React.useState(false);
  const [eventsOpen, setEventsOpen] = React.useState(false);
  const [variantsOpen, setVariantsOpen] = React.useState(false);

  const rarityMap: Record<string, number> = { comune: 1, media: 2, rara: 3 };
  const eventMedalsList = getEventMedals(userPosts);

  // Calculate unlock count per brand
  const brandUnlockCounts: Record<string, number> = {};
  allBeersCatalog.forEach((b) => {
    brandUnlockCounts[b.brand] = 0;
  });

  // Build the list of all variants
  const allVariantsList = allBeersCatalog.flatMap((beer) => {
    return beer.variants.map((variant: string) => {
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
  const brandMedalsList = allBeersCatalog.map((beer) => {
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

  const completedMedalsCount = brandMedalsList.filter((m) => m.isCompleted).length;
  const unlockedEventsCount = eventMedalsList.filter((e) => e.isUnlocked).length;
  const unlockedVariantsCount = allVariantsList.filter((v) => v.isUnlocked).length;

  return (
    <>
      {/* 1. BRAND MEDALS ACCORDION SECTION */}
      {(!mode || mode === 'medals') && (
        <div style={{ marginBottom: '16px' }}>
          {!mode && (
            <div
              onClick={() => setMedalsOpen(!medalsOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--white)',
                border: '1px solid var(--gray)',
                padding: '12px 16px',
                borderRadius: '16px',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: 'var(--card-shadow)',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', color: 'var(--dark)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--gold)' }}>workspace_premium</span>
                <span>Medaglie Brand</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: '#F1F5F9', padding: '2px 8px', borderRadius: '10px' }}>
                  {completedMedalsCount} / {brandMedalsList.length}
                </span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{
                  color: 'var(--text-muted)',
                  transition: 'transform 0.2s ease',
                  transform: medalsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                expand_more
              </span>
            </div>
          )}

          {(mode || medalsOpen) && (
            <div className="trophy-grid" id="brandMedalsGrid" style={{ animation: 'fadeIn 0.2s ease-out' }}>
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
        </div>
      )}

      {/* 2. EVENT MEDALS ACCORDION SECTION */}
      {(!mode || mode === 'events') && (
        <div style={{ marginBottom: '16px' }}>
          {!mode && (
            <div
              onClick={() => setEventsOpen(!eventsOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--white)',
                border: '1px solid var(--gray)',
                padding: '12px 16px',
                borderRadius: '16px',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: 'var(--card-shadow)',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', color: 'var(--dark)' }}>
                <span className="material-symbols-outlined" style={{ color: '#27ae60' }}>event_available</span>
                <span>Medaglie Evento</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: '#F1F5F9', padding: '2px 8px', borderRadius: '10px' }}>
                  {unlockedEventsCount} / {eventMedalsList.length}
                </span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{
                  color: 'var(--text-muted)',
                  transition: 'transform 0.2s ease',
                  transform: eventsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                expand_more
              </span>
            </div>
          )}

          {(mode || eventsOpen) && (
            <div className="trophy-grid" id="eventMedalsGrid" style={{ animation: 'fadeIn 0.2s ease-out' }}>
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
        </div>
      )}

      {/* 3. VARIANTS ACCORDION SECTION */}
      {(!mode || mode === 'variants') && (
        <div style={{ marginBottom: '16px' }}>
          {!mode && (
            <div
              onClick={() => setVariantsOpen(!variantsOpen)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--white)',
                border: '1px solid var(--gray)',
                padding: '12px 16px',
                borderRadius: '16px',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: 'var(--card-shadow)',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px', color: 'var(--dark)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-dark)' }}>sports_bar</span>
                <span>Varianti Birre Sbloccate</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: '#F1F5F9', padding: '2px 8px', borderRadius: '10px' }}>
                  {unlockedVariantsCount} / {allVariantsList.length}
                </span>
              </div>
              <span
                className="material-symbols-outlined"
                style={{
                  color: 'var(--text-muted)',
                  transition: 'transform 0.2s ease',
                  transform: variantsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                expand_more
              </span>
            </div>
          )}

          {(mode || variantsOpen) && (
            <div className="trophy-grid" id="trophyGrid" style={{ animation: 'fadeIn 0.2s ease-out' }}>
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
                        {item.muls.map((iconName: string) => (
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
        </div>
      )}
    </>
  );
};
