import { beers, getBasePoints, resolvePokedexEntryBeer, type Beer } from '../beers';
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

  const brandUnlockCounts: Record<string, number> = {};
  safeCatalog.forEach((b) => {
    if (b && b.brand) brandUnlockCounts[b.brand] = 0;
  });

  const safePokedex = pokedex || {};
  Object.keys(safePokedex).forEach((key) => {
    const entry = safePokedex[key];
    if (!entry) return;

    const { beer, brand, variant } = resolvePokedexEntryBeer(key, entry, safeCatalog);
    const base = getBasePoints(brand, variant, safeCatalog);

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

    if (brandUnlockCounts[brand] !== undefined) {
      brandUnlockCounts[brand]++;
    } else if (beer && brandUnlockCounts[beer.brand] !== undefined) {
      brandUnlockCounts[beer.brand]++;
    }
  });

  safeCatalog.forEach((beer) => {
    if (!beer || !beer.brand) return;
    const vars = Array.isArray(beer.variants) && beer.variants.length > 0 ? beer.variants : ['Classica'];
    if (vars.length > 0 && brandUnlockCounts[beer.brand] === vars.length) {
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
