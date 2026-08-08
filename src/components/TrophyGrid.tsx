import React from 'react';
import { beers, getBasePoints, getBeerType, formatBeerTitle, type Beer } from '../beers';

export interface PokedexEntry {
  photo: string;
  isShiny: boolean;
  isShared: boolean;
  taggedFriend: string | null;
  brand: string;
  variant?: string;
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
  startDate?: Date;
  endDate?: Date;
}

export function getEventMedals(userPosts: any[], catalog: Beer[] = beers): EventMedal[] {
  const safeCatalog = Array.isArray(catalog) && catalog.length > 0 ? catalog : beers;
  const now = new Date();
  const currentYear = now.getFullYear();
  const medals: EventMedal[] = [];

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

  const year = currentYear;
  const getPostDate = (p: any): Date | null => {
    if (!p) return null;
    const timeVal = p.time ?? p.timestamp ?? p.createdAt;
    if (!timeVal) return null;
    const t = new Date(timeVal);
    return isNaN(t.getTime()) ? null : t;
  };

  // 1. ❄️ Inverno Y (21 Dic Y-1 - 20 Mar Y)
  const winterStart = new Date(year - 1, 11, 21, 0, 0, 0);
  const winterEnd = new Date(year, 2, 20, 23, 59, 59);
  const winterPosts = userPosts.filter(p => {
    const t = getPostDate(p);
    return t && t >= winterStart && t <= winterEnd;
  });
  const winterCount = winterPosts.filter(p => {
    if (!p.brand || !p.variant) return false;
    const type = getBeerType(p.brand, p.variant, safeCatalog);
    return type === "scura" || type === "rossa";
  }).length;
  medals.push({
    id: `winter-${year}`,
    name: `Inverno ${year}`,
    year,
    icon: 'ac_unit',
    color: '#93C5FD',
    isUnlocked: winterCount >= 10,
    desc: `Sblocca 10 birre Scure o Rosse dal 21 Dic al 20 Mar. (${Math.min(winterCount, 10)}/10)`,
    points: 10,
    startDate: winterStart,
    endDate: winterEnd,
  });

  // 2. 🍀 San Patrizio (15 - 21 Mar)
  const patrizioStart = new Date(year, 2, 15, 0, 0, 0);
  const patrizioEnd = new Date(year, 2, 21, 23, 59, 59);
  const patrizioPosts = userPosts.filter(p => {
    const t = getPostDate(p);
    return t && t >= patrizioStart && t <= patrizioEnd;
  });
  const patrizioCount = patrizioPosts.filter(p => {
    if (!p.brand || !p.variant) return false;
    const beer = safeCatalog.find(b => b && (b.brand === p.brand || formatBeerTitle(b.brand) === formatBeerTitle(p.brand)));
    const type = getBeerType(p.brand, p.variant, safeCatalog);
    const isIrishOrScotch = beer && (beer.country === "Irlanda" || beer.country === "Scozia" || beer.flag === "IE" || beer.flag === "GB-SCT");
    return isIrishOrScotch || type === "scura";
  }).length;
  medals.push({
    id: `patrizio-${year}`,
    name: `San Patrizio ${year}`,
    year,
    icon: 'eco',
    color: '#A7F3D0',
    isUnlocked: patrizioCount >= 1,
    desc: `Sblocca 1 birra Irlandese, Scozzese o Scura per San Patrizio (15-21 Mar). (${Math.min(patrizioCount, 1)}/1)`,
    points: 3,
    startDate: patrizioStart,
    endDate: patrizioEnd,
  });

  // 3. 🌸 Primavera (21 Mar - 20 Giu)
  const springStart = new Date(year, 2, 21, 0, 0, 0);
  const springEnd = new Date(year, 5, 20, 23, 59, 59);
  const springPosts = userPosts.filter(p => {
    const t = getPostDate(p);
    return t && t >= springStart && t <= springEnd;
  });
  const springCount = springPosts.filter(p => {
    if (!p.brand || !p.variant) return false;
    return getBeerType(p.brand, p.variant, safeCatalog) === "bianca";
  }).length;
  medals.push({
    id: `spring-${year}`,
    name: `Primavera ${year}`,
    year,
    icon: 'local_florist',
    color: '#E0F2FE',
    isUnlocked: springCount >= 10,
    desc: `Sblocca 10 birre Bianche (Blanche, Weizen, Saison) dal 21 Mar al 20 Giu. (${Math.min(springCount, 10)}/10)`,
    points: 10,
    startDate: springStart,
    endDate: springEnd,
  });

  // 4. 🧺 Pasquetta (Weekend Pasquetta)
  const easterDate = getEasterDate(year);
  const pasquettaStart = new Date(easterDate);
  pasquettaStart.setDate(easterDate.getDate() - 1);
  pasquettaStart.setHours(0, 0, 0, 0);
  const pasquettaEnd = new Date(easterDate);
  pasquettaEnd.setDate(easterDate.getDate() + 1);
  pasquettaEnd.setHours(23, 59, 59, 999);
  const pasquettaPosts = userPosts.filter(p => {
    const t = getPostDate(p);
    return t && t >= pasquettaStart && t <= pasquettaEnd;
  });
  const pasquettaCount = pasquettaPosts.filter(p => {
    if (!p.brand || !p.variant) return false;
    const beer = safeCatalog.find(b => b && (b.brand === p.brand || formatBeerTitle(b.brand) === formatBeerTitle(p.brand)));
    const type = getBeerType(p.brand, p.variant, safeCatalog);
    const isBelgian = beer && (beer.country === "Belgio" || beer.flag === "BE");
    return isBelgian || type === "bionda";
  }).length;
  medals.push({
    id: `pasquetta-${year}`,
    name: `Pasquetta ${year}`,
    year,
    icon: 'egg',
    color: '#FDE68A',
    isUnlocked: pasquettaCount >= 1,
    desc: `Sblocca 1 birra Belga o Bionda a Pasquetta. (${Math.min(pasquettaCount, 1)}/1)`,
    points: 3,
    startDate: pasquettaStart,
    endDate: pasquettaEnd,
  });

  // 5. ☀️ Estate (21 Giu - 22 Set)
  const summerStart = new Date(year, 5, 21, 0, 0, 0);
  const summerEnd = new Date(year, 8, 22, 23, 59, 59);
  const summerPosts = userPosts.filter(p => {
    const t = getPostDate(p);
    return t && t >= summerStart && t <= summerEnd;
  });
  const summerCount = summerPosts.filter(p => {
    if (!p.brand || !p.variant) return false;
    const type = getBeerType(p.brand, p.variant, safeCatalog);
    return type === "bionda" || type === "ipa";
  }).length;
  medals.push({
    id: `summer-${year}`,
    name: `Estate ${year}`,
    year,
    icon: 'wb_sunny',
    color: '#FDE68A',
    isUnlocked: summerCount >= 10,
    desc: `Sblocca 10 birre Bionde o IPA dal 21 Giu al 22 Set. (${Math.min(summerCount, 10)}/10)`,
    points: 10,
    startDate: summerStart,
    endDate: summerEnd,
  });

  // 6. 🍉 Ferragosto (14 - 16 Ago)
  const ferragostoStart = new Date(year, 7, 14, 0, 0, 0);
  const ferragostoEnd = new Date(year, 7, 16, 23, 59, 59);
  const ferragostoPosts = userPosts.filter(p => {
    const t = getPostDate(p);
    return t && t >= ferragostoStart && t <= ferragostoEnd;
  });
  const ferragostoCount = ferragostoPosts.filter(p => p && p.brand && p.variant).length;
  medals.push({
    id: `ferragosto-${year}`,
    name: `Ferragosto ${year}`,
    year,
    icon: 'celebration',
    color: '#FCA5A5',
    isUnlocked: ferragostoCount >= 1,
    desc: `Sblocca 1 birra qualsiasi per il brindisi di Ferragosto (14-16 Ago). (${Math.min(ferragostoCount, 1)}/1)`,
    points: 3,
    startDate: ferragostoStart,
    endDate: ferragostoEnd,
  });

  // 7. 🍺 Oktoberfest (16 Set - 4 Ott)
  const oktoberfestStart = new Date(year, 8, 16, 0, 0, 0);
  const oktoberfestEnd = new Date(year, 9, 4, 23, 59, 59);
  const oktoberfestPosts = userPosts.filter(p => {
    const t = getPostDate(p);
    return t && t >= oktoberfestStart && t <= oktoberfestEnd;
  });
  const oktoberfestCount = oktoberfestPosts.filter(p => {
    if (!p.brand || !p.variant) return false;
    const beer = safeCatalog.find(b => b && (b.brand === p.brand || formatBeerTitle(b.brand) === formatBeerTitle(p.brand)));
    return beer && (beer.country === "Germania" || beer.flag === "DE");
  }).length;
  medals.push({
    id: `oktoberfest-${year}`,
    name: `Oktoberfest ${year}`,
    year,
    icon: 'sports_bar',
    color: '#F59E0B',
    isUnlocked: oktoberfestCount >= 3,
    desc: `Sblocca 3 birre tedesche durante l'Oktoberfest (16 Set - 4 Ott). (${Math.min(oktoberfestCount, 3)}/3)`,
    points: 5,
    startDate: oktoberfestStart,
    endDate: oktoberfestEnd,
  });

  // 8. 🍁 Autunno (23 Set - 20 Dic)
  const autumnStart = new Date(year, 8, 23, 0, 0, 0);
  const autumnEnd = new Date(year, 11, 20, 23, 59, 59);
  const autumnPosts = userPosts.filter(p => {
    const t = getPostDate(p);
    return t && t >= autumnStart && t <= autumnEnd;
  });
  const autumnCount = autumnPosts.filter(p => {
    if (!p.brand || !p.variant) return false;
    const type = getBeerType(p.brand, p.variant, safeCatalog);
    const beer = safeCatalog.find(b => b && (b.brand === p.brand || formatBeerTitle(b.brand) === formatBeerTitle(p.brand)));
    const isGerman = beer && (beer.country === "Germania" || beer.flag === "DE");
    return type === "rossa" || type === "ipa" || isGerman;
  }).length;
  medals.push({
    id: `autumn-${year}`,
    name: `Autunno ${year}`,
    year,
    icon: 'wb_twilight',
    color: '#FDBA74',
    isUnlocked: autumnCount >= 10,
    desc: `Sblocca 10 birre Rosse, IPA o Tedesche dal 23 Set al 20 Dic. (${Math.min(autumnCount, 10)}/10)`,
    points: 10,
    startDate: autumnStart,
    endDate: autumnEnd,
  });

  // Sort medals in chronological order throughout the year
  medals.sort((a, b) => {
    const timeA = a.startDate ? a.startDate.getTime() : 0;
    const timeB = b.startDate ? b.startDate.getTime() : 0;
    return timeA - timeB;
  });

  // Keep all unlocked medals, plus active or future upcoming events
  const activeMedals = medals.filter((m) => {
    if (m.isUnlocked) return true; // Always retain unlocked medals!
    if (!m.endDate) return true;
    return m.endDate >= now;
  });

  return activeMedals;
}

export interface TrophyGridProps {
  pokedex: Record<string, PokedexEntry>;
  isPub?: boolean;
  variantSortOption: "alpha" | "unlocked" | "rarity" | "nation";
  variantSortDir: number;
  medalSortOption: "alpha" | "unlocked" | "rarity" | "nation";
  medalSortDir: number;
  onDeleteEntry?: (brand: string, variant: string) => void;
  showDeleteButton?: boolean;
  mode?: "medals" | "events" | "variants";
  userPosts?: any[];
  allBeersCatalog?: Beer[];
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
  const eventMedalsList = getEventMedals(userPosts, allBeersCatalog);

  // Calculate unlock count per brand
  const brandUnlockCounts: Record<string, number> = {};
  allBeersCatalog.forEach((b) => {
    brandUnlockCounts[b.brand] = 0;
  });

  // Build the list of all variants
  const allVariantsList = (allBeersCatalog || []).flatMap((beer) => {
    if (!beer || !beer.brand) return [];
    const vars = Array.isArray(beer.variants) && beer.variants.length > 0 ? beer.variants : ['Classica'];
    return vars.map((variant: string) => {
      const uniqueId = `${beer.brand}-${variant}`;
      const formattedB = formatBeerTitle(beer.brand);
      const formattedV = formatBeerTitle(variant);

      const entry = pokedex
        ? (pokedex[uniqueId] ||
           pokedex[`${formattedB}-${formattedV}`] ||
           Object.values(pokedex).find(
             (e: any) =>
               e &&
               typeof e === 'object' &&
               ((e.brand === beer.brand || e.brand === formattedB) &&
                (e.variant === variant || e.variant === formattedV))
           ))
        : undefined;
      
      const isUnlocked = entry !== undefined;
      
      if (isUnlocked) {
        brandUnlockCounts[beer.brand]++;
      }

      const basePts = getBasePoints(beer.brand, variant, allBeersCatalog);
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
        country: beer.country || 'Italia',
        rarity: beer.rarity || 'comune',
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
  const brandMedalsList = (allBeersCatalog || []).map((beer) => {
    const vars = Array.isArray(beer?.variants) && beer.variants.length > 0 ? beer.variants : ['Classica'];
    const isCompleted = vars.length > 0 && brandUnlockCounts[beer.brand] === vars.length;
    return {
      brand: beer.brand,
      isCompleted,
      country: beer.country || 'Italia',
      rarity: beer.rarity || 'comune',
      variantsLength: vars.length,
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
