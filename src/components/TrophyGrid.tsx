import React from 'react';
import { beers, getBasePoints, getBeerType, formatBeerTitle, resolvePokedexEntryBeer, type Beer } from '../beers';

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
  currentCount?: number;
  targetCount?: number;
}

export function getEventMedals(userPosts: any[] = [], catalog: Beer[] = beers, pokedex: Record<string, any> = {}): EventMedal[] {
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
    const timeVal = p.time ?? p.timestamp ?? p.createdAt ?? p.unlockedAt;
    if (!timeVal) return null;
    const t = new Date(timeVal);
    return isNaN(t.getTime()) ? null : t;
  };

  interface UnlockedItem {
    brand: string;
    variant: string;
    date: Date;
  }
  const unlockedItems: UnlockedItem[] = [];

  const safePokedex = pokedex || {};
  const dexKeys = Object.keys(safePokedex);

  if (dexKeys.length > 0) {
    dexKeys.forEach((key) => {
      const entry = safePokedex[key];
      if (!entry) return;
      const { beer, brand, variant } = resolvePokedexEntryBeer(key, entry, safeCatalog);
      const bName = beer ? beer.brand : brand;
      if (!bName) return;

      let dateVal = getPostDate(entry);
      if (!dateVal) {
        const matchingPost = (userPosts || []).find((p) => {
          if (!p || !p.brand || !p.variant) return false;
          return (
            formatBeerTitle(p.brand) === formatBeerTitle(bName) &&
            formatBeerTitle(p.variant) === formatBeerTitle(variant || '')
          );
        });
        dateVal = getPostDate(matchingPost) || new Date();
      }

      unlockedItems.push({
        brand: bName,
        variant: variant || '',
        date: dateVal,
      });
    });
  } else if (Array.isArray(userPosts) && userPosts.length > 0) {
    const seen = new Set<string>();
    userPosts.forEach((p) => {
      if (!p || !p.brand || !p.variant) return;
      const formattedB = formatBeerTitle(p.brand);
      const formattedV = formatBeerTitle(p.variant);
      const uKey = `${formattedB}::${formattedV}`;
      if (!seen.has(uKey)) {
        seen.add(uKey);
        const dateVal = getPostDate(p) || new Date();
        unlockedItems.push({
          brand: formattedB,
          variant: formattedV,
          date: dateVal,
        });
      }
    });
  }

  // 1. ❄️ Inverno Y (21 Dic Y-1 - 20 Mar Y)
  const winterStart = new Date(year - 1, 11, 21, 0, 0, 0);
  const winterEnd = new Date(year, 2, 20, 23, 59, 59);
  const winterCount = unlockedItems.filter((item) => {
    if (item.date < winterStart || item.date > winterEnd) return false;
    const type = getBeerType(item.brand, item.variant, safeCatalog);
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
    currentCount: Math.min(winterCount, 10),
    targetCount: 10,
  });

  // 2. 🍀 San Patrizio (15 - 21 Mar)
  const patrizioStart = new Date(year, 2, 15, 0, 0, 0);
  const patrizioEnd = new Date(year, 2, 21, 23, 59, 59);
  const patrizioCount = unlockedItems.filter((item) => {
    if (item.date < patrizioStart || item.date > patrizioEnd) return false;
    const beer = safeCatalog.find(b => b && (b.brand === item.brand || formatBeerTitle(b.brand) === formatBeerTitle(item.brand)));
    const type = getBeerType(item.brand, item.variant, safeCatalog);
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
    currentCount: Math.min(patrizioCount, 1),
    targetCount: 1,
  });

  // 3. 🌸 Primavera (21 Mar - 20 Giu)
  const springStart = new Date(year, 2, 21, 0, 0, 0);
  const springEnd = new Date(year, 5, 20, 23, 59, 59);
  const springCount = unlockedItems.filter((item) => {
    if (item.date < springStart || item.date > springEnd) return false;
    return getBeerType(item.brand, item.variant, safeCatalog) === "bianca";
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
    currentCount: Math.min(springCount, 10),
    targetCount: 10,
  });

  // 4. 🧺 Pasquetta (Weekend Pasquetta)
  const easterDate = getEasterDate(year);
  const pasquettaStart = new Date(easterDate);
  pasquettaStart.setDate(easterDate.getDate() - 1);
  pasquettaStart.setHours(0, 0, 0, 0);
  const pasquettaEnd = new Date(easterDate);
  pasquettaEnd.setDate(easterDate.getDate() + 1);
  pasquettaEnd.setHours(23, 59, 59, 999);
  const pasquettaCount = unlockedItems.filter((item) => {
    if (item.date < pasquettaStart || item.date > pasquettaEnd) return false;
    const beer = safeCatalog.find(b => b && (b.brand === item.brand || formatBeerTitle(b.brand) === formatBeerTitle(item.brand)));
    const type = getBeerType(item.brand, item.variant, safeCatalog);
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
    currentCount: Math.min(pasquettaCount, 1),
    targetCount: 1,
  });

  // 5. ☀️ Estate (21 Giu - 22 Set)
  const summerStart = new Date(year, 5, 21, 0, 0, 0);
  const summerEnd = new Date(year, 8, 22, 23, 59, 59);
  const summerCount = unlockedItems.filter((item) => {
    if (item.date < summerStart || item.date > summerEnd) return false;
    const type = getBeerType(item.brand, item.variant, safeCatalog);
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
    currentCount: Math.min(summerCount, 10),
    targetCount: 10,
  });

  // 6. 🍉 Ferragosto (14 - 16 Ago)
  const ferragostoStart = new Date(year, 7, 14, 0, 0, 0);
  const ferragostoEnd = new Date(year, 7, 16, 23, 59, 59);
  const ferragostoCount = unlockedItems.filter((item) => {
    return item.date >= ferragostoStart && item.date <= ferragostoEnd;
  }).length;
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
    currentCount: Math.min(ferragostoCount, 1),
    targetCount: 1,
  });

  // 7. 🍺 Oktoberfest (16 Set - 4 Ott)
  const oktoberfestStart = new Date(year, 8, 16, 0, 0, 0);
  const oktoberfestEnd = new Date(year, 9, 4, 23, 59, 59);
  const oktoberfestCount = unlockedItems.filter((item) => {
    if (item.date < oktoberfestStart || item.date > oktoberfestEnd) return false;
    const beer = safeCatalog.find(b => b && (b.brand === item.brand || formatBeerTitle(b.brand) === formatBeerTitle(item.brand)));
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
    currentCount: Math.min(oktoberfestCount, 3),
    targetCount: 3,
  });

  // 8. 🍁 Autunno (23 Set - 20 Dic)
  const autumnStart = new Date(year, 8, 23, 0, 0, 0);
  const autumnEnd = new Date(year, 11, 20, 23, 59, 59);
  const autumnCount = unlockedItems.filter((item) => {
    if (item.date < autumnStart || item.date > autumnEnd) return false;
    const type = getBeerType(item.brand, item.variant, safeCatalog);
    const beer = safeCatalog.find(b => b && (b.brand === item.brand || formatBeerTitle(b.brand) === formatBeerTitle(item.brand)));
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
    currentCount: Math.min(autumnCount, 10),
    targetCount: 10,
  });

  // Sort medals in reverse chronological order (most recent events first)
  medals.sort((a, b) => {
    const timeA = a.startDate ? a.startDate.getTime() : 0;
    const timeB = b.startDate ? b.startDate.getTime() : 0;
    return timeB - timeA;
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

export const RealisticMedal: React.FC<{ medal: EventMedal }> = ({ medal }) => {
  const isUnlocked = medal.isUnlocked;

  const ribbonGradients: Record<string, string> = {
    ac_unit: 'linear-gradient(180deg, #1D4ED8 0%, #3B82F6 50%, #93C5FD 100%)',
    eco: 'linear-gradient(180deg, #15803D 0%, #22C55E 50%, #86EFAC 100%)',
    local_florist: 'linear-gradient(180deg, #BE185D 0%, #EC4899 50%, #FBCFE8 100%)',
    egg: 'linear-gradient(180deg, #B45309 0%, #F59E0B 50%, #FEF3C7 100%)',
    wb_sunny: 'linear-gradient(180deg, #C2410C 0%, #EA580C 50%, #FDE047 100%)',
    celebration: 'linear-gradient(180deg, #B91C1C 0%, #EF4444 50%, #FCA5A5 100%)',
    sports_bar: 'linear-gradient(180deg, #1E3A8A 0%, #2563EB 50%, #F59E0B 100%)',
    wb_twilight: 'linear-gradient(180deg, #7C2D12 0%, #C2410C 50%, #FDBA74 100%)',
  };

  const ribbonBg = isUnlocked
    ? (ribbonGradients[medal.icon] || 'linear-gradient(180deg, #B45309 0%, #F59E0B 50%, #FDE68A 100%)')
    : 'linear-gradient(180deg, #475569 0%, #64748B 50%, #94A3B8 100%)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '68px', margin: '0 auto 8px auto' }}>
      {/* Top Ribbon */}
      <div
        style={{
          width: '28px',
          height: '24px',
          background: ribbonBg,
          borderRadius: '4px 4px 0 0',
          position: 'relative',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)',
          zIndex: 1,
        }}
      >
        {/* Ribbon center stripe */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '6px',
            transform: 'translateX(-50%)',
            background: isUnlocked ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
          }}
        />
      </div>

      {/* Gold/Silver Connector Loop */}
      <div
        style={{
          width: '14px',
          height: '6px',
          borderRadius: '3px',
          background: isUnlocked
            ? 'linear-gradient(90deg, #B45309 0%, #FDE047 50%, #92400E 100%)'
            : 'linear-gradient(90deg, #334155 0%, #CBD5E1 50%, #334155 100%)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
          marginTop: '-3px',
          zIndex: 2,
        }}
      />

      {/* Circular Medallion */}
      <div
        style={{
          width: '62px',
          height: '62px',
          borderRadius: '50%',
          marginTop: '-2px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isUnlocked
            ? 'linear-gradient(135deg, #FEF08A 0%, #EAB308 25%, #CA8A04 60%, #854D0E 100%)'
            : 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 50%, #475569 100%)',
          padding: '3px',
          boxSizing: 'border-box',
          boxShadow: isUnlocked
            ? '0 6px 16px rgba(234, 179, 8, 0.35), 0 2px 4px rgba(0,0,0,0.2)'
            : '0 4px 10px rgba(0,0,0,0.15)',
          zIndex: 3,
        }}
      >
        {/* Beaded / Embossed Outer Rim */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            border: isUnlocked ? '1.5px dashed rgba(254, 240, 138, 0.7)' : '1.5px dashed rgba(255, 255, 255, 0.4)',
            background: isUnlocked
              ? 'radial-gradient(circle at 35% 30%, #FEF9C3 0%, #FDE047 35%, #EAB308 75%, #A16207 100%)'
              : 'radial-gradient(circle at 35% 30%, #F8FAFC 0%, #E2E8F0 45%, #94A3B8 100%)',
            boxShadow: isUnlocked
              ? 'inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(113, 63, 18, 0.4)'
              : 'inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(30, 41, 59, 0.3)',
          }}
        >
          {/* Specular Highlight Sheen */}
          <div
            style={{
              position: 'absolute',
              top: '2px',
              left: '6px',
              width: '18px',
              height: '9px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)',
              transform: 'rotate(-25deg)',
              pointerEvents: 'none',
            }}
          />

          {/* Central Theme Icon */}
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px',
              color: isUnlocked ? '#78350F' : '#64748B',
              marginTop: '1px',
              textShadow: isUnlocked ? '0 1px 0 rgba(255,255,255,0.8)' : '0 1px 0 rgba(255,255,255,0.4)',
              lineHeight: 1,
            }}
          >
            {isUnlocked ? medal.icon : 'lock'}
          </span>

          {/* Engraved Year Badge */}
          <div
            style={{
              fontSize: '9px',
              fontWeight: 900,
              letterSpacing: '0.4px',
              color: isUnlocked ? '#78350F' : '#475569',
              background: isUnlocked ? 'rgba(254, 240, 138, 0.85)' : 'rgba(241, 245, 249, 0.85)',
              border: isUnlocked ? '1px solid rgba(180, 83, 9, 0.35)' : '1px solid rgba(148, 163, 184, 0.5)',
              borderRadius: '4px',
              padding: '0 4px',
              marginTop: '2px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              textShadow: '0 1px 0 rgba(255,255,255,0.6)',
              lineHeight: 1.2,
            }}
          >
            {medal.year}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const eventMedalsList = getEventMedals(userPosts, allBeersCatalog, pokedex);

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
                return (
                  <div
                    key={medal.id}
                    className={`medal-badge-card ${medal.isUnlocked ? 'unlocked' : ''}`}
                    style={{
                      background: medal.isUnlocked ? 'linear-gradient(180deg, #FFFDF5 0%, #FEFCE8 100%)' : '#F8FAFC',
                      border: medal.isUnlocked ? '1.5px solid #FDE047' : '1px solid #E2E8F0',
                      borderRadius: '20px',
                      padding: '14px 8px 12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: medal.isUnlocked ? '0 6px 16px rgba(234, 179, 8, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                      opacity: medal.isUnlocked ? 1 : 0.75,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {medal.isUnlocked && (
                      <div
                        className="pts-badge"
                        style={{
                          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                        }}
                      >
                        +{medal.points}pt
                      </div>
                    )}
                    <RealisticMedal medal={medal} />
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#0F172A', lineHeight: 1.2, marginTop: '2px' }}>
                      {medal.name}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#64748B', marginTop: '4px', lineHeight: 1.25, fontWeight: 500 }}>
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
