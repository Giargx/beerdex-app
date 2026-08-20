import { beers, getBasePoints, resolvePokedexEntryBeer, formatBeerTitle, stripStr, type Beer } from '../beers';
import { getEventMedals } from '../components/TrophyGrid';

export interface ScoreBreakdown {
  beerUnlocks: number;
  shinyBonus: number;
  brandMedals: number;
  eventMedals: number;
  proposalsBonus: number;
  total: number;
}

export function calculateScoreBreakdown(
  pokedex: Record<string, any> = {},
  userPosts: any[] = [],
  catalog: Beer[] = beers
): ScoreBreakdown {
  const safeCatalog = Array.isArray(catalog) && catalog.length > 0 ? catalog : beers;
  let beerUnlocks = 0;
  let shinyBonus = 0;
  let proposalsBonus = 0;
  let brandMedals = 0;
  let eventMedals = 0;

  const brandUnlockedVariantsMap: Record<string, Set<string>> = {};
  safeCatalog.forEach((b) => {
    if (b && b.brand) {
      brandUnlockedVariantsMap[b.brand] = new Set<string>();
    }
  });

  const safePokedex = pokedex || {};
  const countedVariantsSet = new Set<string>();

  Object.keys(safePokedex).forEach((key) => {
    const entry = safePokedex[key];
    if (!entry) return;

    const { beer, brand, variant, rarity } = resolvePokedexEntryBeer(key, entry, safeCatalog);
    const targetBrand = beer ? beer.brand : brand;
    const canonicalV = variant ? formatBeerTitle(variant) : 'Classica';
    const uniqueVariantKey = `${stripStr(targetBrand)}-${stripStr(canonicalV)}`;

    if (countedVariantsSet.has(uniqueVariantKey)) {
      // Già conteggiata questa variante unica per l'utente, evita doppio conteggio
      return;
    }
    countedVariantsSet.add(uniqueVariantKey);

    const base = getBasePoints(targetBrand, canonicalV, safeCatalog, rarity || entry?.rarity || beer?.rarity);

    beerUnlocks += base;

    if (entry.isShiny) {
      shinyBonus += base;
    }

    if (entry.proposalBonus !== undefined && entry.proposalBonus !== null) {
      if (typeof entry.proposalBonus === 'number') {
        proposalsBonus += entry.proposalBonus;
      } else if (entry.proposalBonus === true) {
        proposalsBonus += entry.proposalType === 'variant' ? 1 : 2;
      }
    } else if (entry.isProposalBonus) {
      proposalsBonus += 2;
    }

    if (targetBrand) {
      if (!brandUnlockedVariantsMap[targetBrand]) {
        brandUnlockedVariantsMap[targetBrand] = new Set<string>();
      }
      if (canonicalV) {
        brandUnlockedVariantsMap[targetBrand].add(canonicalV);
      }
    }
  });

  safeCatalog.forEach((beer) => {
    if (!beer || !beer.brand) return;
    const vars = Array.isArray(beer.variants) && beer.variants.length > 0 ? beer.variants : ['Classica'];
    const unlockedSet = brandUnlockedVariantsMap[beer.brand];
    if (vars.length > 0 && unlockedSet && unlockedSet.size >= vars.length) {
      brandMedals += vars.length * 3;
    }
  });

  const eventsList = getEventMedals(userPosts, safeCatalog);
  eventsList.forEach((e) => {
    if (e.isUnlocked) {
      eventMedals += e.points;
    }
  });

  const total = beerUnlocks + shinyBonus + brandMedals + eventMedals + proposalsBonus;

  return {
    beerUnlocks,
    shinyBonus,
    brandMedals,
    eventMedals,
    proposalsBonus,
    total,
  };
}
