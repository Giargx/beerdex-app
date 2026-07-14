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
  const [regionFilter, setRegionFilter] = useState('Tutte');
  const [sortFilter, setSortFilter] = useState(() => localStorage.getItem('beerdex_catalog_sort') || 'alpha');
  const [sortDir, setSortDir] = useState<number>(() => {
    const saved = localStorage.getItem('beerdex_catalog_sort_dir');
    return saved ? parseInt(saved, 10) : 1;
  });
  
  // Track expanded state for each beer brand card
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (brand: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [brand]: !prev[brand],
    }));
  };

  const handleToggleDir = () => {
    const nextDir = sortDir === 1 ? -1 : 1;
    setSortDir(nextDir);
    localStorage.setItem('beerdex_catalog_sort_dir', nextDir.toString());
  };

  // Extract unique regions for Italian beers
  const ItalianRegions = Array.from(
    new Set(
      beers
        .filter((b) => b.country === 'Italia' && b.regione)
        .map((b) => b.regione as string)
    )
  ).sort((a, b) => a.localeCompare(b));

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

    const matchRegion =
      countryFilter !== 'Italia' ||
      regionFilter === 'Tutte' ||
      beer.regione === regionFilter;

    return matchSearch && matchCountry && matchRegion;
  });

  const rarityMap = { comune: 1, media: 2, rara: 3 };

  filteredBeers.sort((a, b) => {
    let res = 0;
    if (sortFilter === 'alpha') {
      res = a.brand.localeCompare(b.brand);
    } else if (sortFilter === 'rarity') {
      res = (rarityMap[a.rarity] || 0) - (rarityMap[b.rarity] || 0) || a.brand.localeCompare(b.brand);
    }
    return res * sortDir;
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
            onChange={(e) => {
              const val = e.target.value;
              setCountryFilter(val);
              if (val !== 'Italia') {
                setRegionFilter('Tutte');
              }
            }}
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

          {countryFilter === 'Italia' && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', animation: 'fadeIn 0.2s ease-out' }}>
              <span className="filters-label" style={{ marginTop: '8px' }}>Filtra per regione</span>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Tutte">Tutte le Regioni</option>
                {ItalianRegions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>
          )}

          <span className="filters-label">Ordina catalogo per</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={sortFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSortFilter(val);
                localStorage.setItem('beerdex_catalog_sort', val);
              }}
              style={{ flexGrow: 1, marginBottom: 0 }}
            >
              <option value="alpha">Ordine Alfabetico</option>
              <option value="rarity">Rarità</option>
            </select>
            <button
              onClick={handleToggleDir}
              style={{
                border: '1px solid var(--gray)',
                background: '#fbfcfc',
                borderRadius: '10px',
                padding: '10px 14px',
                cursor: 'pointer',
                color: 'var(--dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '42px',
                width: '42px',
                boxSizing: 'border-box'
              }}
              title={sortDir === 1 ? "Crescente" : "Decrescente"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {sortDir === 1 ? 'arrow_upward' : 'arrow_downward'}
              </span>
            </button>
          </div>
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
