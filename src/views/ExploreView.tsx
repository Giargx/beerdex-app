import React, { useState } from 'react';
import { beers, normalizeStr } from '../beers';
import { BeerCard } from '../components/BeerCard';
import type { PokedexEntry } from '../components/TrophyGrid';
import { FoamBubbles } from '../components/FoamBubbles';

interface ExploreViewProps {
  myPokedex: Record<string, PokedexEntry>;
  onInitUnlock: (brand: string, variant: string) => void;
  onDeleteVariant: (brand: string, variant: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  myPokedex,
  onInitUnlock,
  onDeleteVariant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('Tutte');
  const [sortFilter, setSortFilter] = useState('alpha');
  
  // Track expanded state for each beer brand card
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (brand: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [brand]: !prev[brand],
    }));
  };

  // Filter and sort beers list
  const normalizedSearch = normalizeStr(searchTerm);
  const filteredBeers = beers.filter((beer) => {
    const brandName = normalizeStr(beer.brand);
    const descText = normalizeStr(beer.desc);
    const variantsText = normalizeStr(beer.variants.join(' '));

    const matchSearch =
      brandName.includes(normalizedSearch) ||
      descText.includes(normalizedSearch) ||
      variantsText.includes(normalizedSearch);

    const matchCountry = countryFilter === 'Tutte' || beer.country === countryFilter;

    return matchSearch && matchCountry;
  });

  const rarityMap = { comune: 1, media: 2, rara: 3 };

  filteredBeers.sort((a, b) => {
    if (sortFilter === 'alpha') return a.brand.localeCompare(b.brand);
    if (sortFilter === 'nation') return a.country.localeCompare(b.country) || a.brand.localeCompare(b.brand);
    if (sortFilter === 'rarityAsc') {
      return (rarityMap[a.rarity] || 0) - (rarityMap[b.rarity] || 0) || a.brand.localeCompare(b.brand);
    }
    if (sortFilter === 'rarityDesc') {
      return (rarityMap[b.rarity] || 0) - (rarityMap[a.rarity] || 0) || a.brand.localeCompare(b.brand);
    }
    return 0;
  });

  return (
    <div className="page-container-view">
      <header className="hero">
        <FoamBubbles />
        <h1 style={{ position: 'relative', zIndex: 2 }}>Esplora Birre</h1>
        <p style={{ position: 'relative', zIndex: 2 }}>Cerca, scopri e scatta per catturare nuove birre.</p>
      </header>

      <div className="page-container" style={{ marginTop: '-30px' }}>
        <div className="controls">
          <input
            type="text"
            placeholder="Cerca marca o variante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <span className="filters-label">Esplora per nazione</span>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          >
            <option value="Tutte">Tutte le Nazioni</option>
            <option value="Italia">Italia</option>
            <option value="Germania">Germania</option>
            <option value="Belgio">Belgio</option>
            <option value="Paesi Bassi">Paesi Bassi</option>
            <option value="Repubblica Ceca">Repubblica Ceca</option>
            <option value="Danimarca">Danimarca</option>
            <option value="Spagna">Spagna</option>
            <option value="Francia">Francia</option>
            <option value="Irlanda">Irlanda</option>
            <option value="Scozia">Scozia</option>
            <option value="Portogallo">Portogallo</option>
            <option value="Messico">Messico</option>
            <option value="Stati Uniti">Stati Uniti</option>
          </select>

          <span className="filters-label">Ordina catalogo per</span>
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
          >
            <option value="alpha">Ordine Alfabetico</option>
            <option value="nation">Nazione</option>
            <option value="rarityAsc">Rarità (Crescente)</option>
            <option value="rarityDesc">Rarità (Decrescente)</option>
          </select>
        </div>

        <div className="container" id="beerList" style={{ marginTop: '20px', padding: 0 }}>
          {filteredBeers.map((beer) => (
            <BeerCard
              key={beer.brand}
              beer={beer}
              myPokedex={myPokedex}
              expanded={!!expandedCards[beer.brand]}
              onToggle={() => toggleCard(beer.brand)}
              onInitUnlock={onInitUnlock}
              onDeleteVariant={onDeleteVariant}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
