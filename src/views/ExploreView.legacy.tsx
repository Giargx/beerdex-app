import React, { useState } from 'react';
import { beers, normalizeStr } from '../beers';
import type { Beer } from '../beers';
import { BeerCard } from '../components/BeerCard';
import type { PokedexEntry } from '../components/TrophyGrid';
import { FoamBubbles } from '../components/FoamBubbles';

interface ExploreViewProps {
  myPokedex: Record<string, PokedexEntry>;
  allPokedexProfiles?: Record<string, Record<string, PokedexEntry>>;
  globalPosts?: any[];
  onInitUnlock: (brand: string, variant: string) => void;
  onDeleteVariant: (brand: string, variant: string) => void;
  onOpenProposeModal: (searchTerm: string) => void;
  allBeersCatalog?: Beer[];
  onRateBeer?: (brand: string, variant: string, rating: number) => void;
  isAdminUser?: boolean;
  onDeleteCustomBeerCatalog?: (brand: string) => void;
  initialSearchTerm?: string;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  myPokedex,
  allPokedexProfiles = {},
  globalPosts = [],
  onInitUnlock,
  onDeleteVariant,
  onOpenProposeModal,
  allBeersCatalog = beers,
  onRateBeer,
  isAdminUser,
  onDeleteCustomBeerCatalog,
  initialSearchTerm = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [countryFilter, setCountryFilter] = useState('Tutte');
  const [regionFilter, setRegionFilter] = useState('Tutte');
  const [sortFilter, setSortFilter] = useState(() => {
    try { return localStorage.getItem('beerdex_catalog_sort') || 'alpha'; } catch { return 'alpha'; }
  });
  const [sortDir, setSortDir] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('beerdex_catalog_sort_dir');
      return saved ? parseInt(saved, 10) : 1;
    } catch { return 1; }
  });
  
  // Track expanded state for each beer brand card
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(() => {
    if (initialSearchTerm) {
      return { [initialSearchTerm]: true };
    }
    return {};
  });

  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
      setExpandedCards((prev) => ({ ...prev, [initialSearchTerm]: true }));
    }
  }, [initialSearchTerm]);

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

  const safeCatalog = Array.isArray(allBeersCatalog) ? allBeersCatalog : beers;

  // Extract unique regions for Italian beers
  const ItalianRegions = Array.from(
    new Set(
      safeCatalog
        .filter((b) => b && b.country === 'Italia' && b.regione)
        .map((b) => b.regione as string)
    )
  ).sort((a, b) => a.localeCompare(b));

  // Filter and sort beers list strictly by brand name prefix
  const normalizedSearch = normalizeStr(searchTerm).trim();
  const filteredBeers = safeCatalog.filter((beer) => {
    if (!beer || !beer.brand) return false;

    const brandName = normalizeStr(beer.brand).trim();
    const brandWords = brandName.split(/\s+/);

    // Strict brand name prefix matching (e.g. "per" matches "Peroni", "Pedavena", "Birra Peroni")
    const matchSearch =
      !normalizedSearch ||
      brandName.startsWith(normalizedSearch) ||
      brandWords.some((word) => word.startsWith(normalizedSearch));

    const matchCountry = countryFilter === 'Tutte' || beer.country === countryFilter;

    const matchRegion =
      countryFilter !== 'Italia' ||
      regionFilter === 'Tutte' ||
      beer.regione === regionFilter;

    return matchSearch && matchCountry && matchRegion;
  });

  const rarityMap: Record<string, number> = { comune: 1, media: 2, rara: 3 };

  filteredBeers.sort((a, b) => {
    let res = 0;
    if (sortFilter === 'alpha') {
      res = (a.brand || '').localeCompare(b.brand || '');
    } else if (sortFilter === 'rarity') {
      res = (rarityMap[a.rarity] || 0) - (rarityMap[b.rarity] || 0) || (a.brand || '').localeCompare(b.brand || '');
    }
    return res * sortDir;
  });

  // Calcolo delle valutazioni medie globali per ogni variante di birra da TUTTI gli utenti dell'app
  const globalAverageRatings = React.useMemo(() => {
    const ratingsMap: Record<string, number[]> = {};

    if (allPokedexProfiles && typeof allPokedexProfiles === 'object') {
      Object.values(allPokedexProfiles).forEach((userDex) => {
        if (userDex && typeof userDex === 'object') {
          Object.entries(userDex).forEach(([beerKey, entry]: [string, any]) => {
            if (entry && typeof entry.rating === 'number' && entry.rating > 0) {
              const key = beerKey.trim().toLowerCase();
              if (!ratingsMap[key]) {
                ratingsMap[key] = [];
              }
              ratingsMap[key].push(entry.rating);
            }
          });
        }
      });
    }

    if (Array.isArray(globalPosts)) {
      globalPosts.forEach((post) => {
        if (post && post.brand && post.variant && typeof post.rating === 'number' && post.rating > 0) {
          const key = `${post.brand}-${post.variant}`.trim().toLowerCase();
          if (!ratingsMap[key]) {
            ratingsMap[key] = [];
          }
        }
      });
    }

    const resultMap: Record<string, { average: number; count: number }> = {};
    Object.entries(ratingsMap).forEach(([key, votes]) => {
      if (votes.length > 0) {
        const sum = votes.reduce((acc, r) => acc + r, 0);
        const avg = parseFloat((sum / votes.length).toFixed(1));
        resultMap[key] = { average: avg, count: votes.length };
      }
    });

    return resultMap;
  }, [allPokedexProfiles, globalPosts]);

  return (
    <div className="page-container-view" style={{ overflowX: 'hidden' }}>
      <header className="hero" style={{ overflow: 'hidden' }}>
        <FoamBubbles />
        <h1 style={{ position: 'relative', zIndex: 2 }}>Catalogo Birre</h1>
        <p style={{ position: 'relative', zIndex: 2 }}>Scopri tutte le birre disponibili nel beerdex, filtra per paese o ricerca la tua preferita.</p>
      </header>

      <div className="page-container" style={{ marginTop: '-30px' }}>
        <div className="controls" id="exploreSearchHeader">
          <input
            type="text"
            placeholder="Cerca marca della birra..."
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

        <div className="container" id="beerList" style={{ marginTop: '20px', padding: '0 10px', width: '100%', boxSizing: 'border-box' }}>
          {filteredBeers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 20px',
                background: 'var(--white)',
                borderRadius: '24px',
                border: '2px dashed var(--gray)',
                margin: '10px auto 30px auto',
                width: '100%',
                maxWidth: '460px',
                boxShadow: 'var(--card-shadow)',
                boxSizing: 'border-box'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary-dark)', marginBottom: '10px' }}>
                sports_bar
              </span>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--dark)', fontSize: '18px' }}>Nessuna marca trovata</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
                {searchTerm ? (
                  <>Non c'è la marca "<strong>{searchTerm}</strong>"? Proponila agli admin!</>
                ) : (
                  <>Non vedi la tua marca preferita in lista? Proponila agli admin!</>
                )}
                <br />
                Se verrà approvata dagli admin, verrà aggiunta al catalogo, la sbloccherai subito e riceverai i punti della birra + <strong>2 Punti Bonus</strong>!
              </p>
              <button
                className="btn-main"
                onClick={() => onOpenProposeModal(searchTerm)}
                style={{ display: 'inline-flex', width: 'auto', padding: '12px 24px', margin: '0 auto' }}
              >
                <span className="material-symbols-outlined">add_circle</span> Proponi Nuova Birra
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '10px',
                  width: '100%',
                  boxSizing: 'border-box',
                  alignItems: 'stretch',
                }}
              >
                {filteredBeers.map((beer, index) => {
                  const isExpanded = !!expandedCards[beer.brand];
                  const pairIndex = Math.floor(index / 2);
                  const cardOrder = isExpanded ? pairIndex * 10 - 1 : pairIndex * 10 + (index % 2);

                  return (
                    <div
                      key={beer.brand}
                      style={{
                        gridColumn: isExpanded ? '1 / -1' : 'span 1',
                        order: cardOrder,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <BeerCard
                        beer={beer}
                        myPokedex={myPokedex}
                        globalAverageRatings={globalAverageRatings}
                        expanded={isExpanded}
                        onToggle={() => toggleCard(beer.brand)}
                        onInitUnlock={onInitUnlock}
                        onDeleteVariant={onDeleteVariant}
                        onOpenProposeModal={onOpenProposeModal}
                        onRateBeer={onRateBeer}
                        isAdminUser={isAdminUser}
                        onDeleteCustomBeerCatalog={onDeleteCustomBeerCatalog}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Propose Banner when results are displayed */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px 16px',
                  background: '#FFFDF5',
                  borderRadius: '20px',
                  border: '1px dashed rgba(255, 179, 0, 0.4)',
                  margin: '20px auto 10px auto',
                  width: '100%',
                  maxWidth: '500px',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--dark)', marginBottom: '4px' }}>
                  {searchTerm ? (
                    <>Non trovi la variante esatta per "<strong>{searchTerm}</strong>"?</>
                  ) : (
                    <>Manca una birra che conosci nel catalogo?</>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Proponila agli admin: la sbloccherai subito e otterrai <strong>+2 Punti Bonus</strong>!
                </div>
                <button
                  className="btn-main"
                  onClick={() => onOpenProposeModal(searchTerm)}
                  style={{ display: 'inline-flex', width: 'auto', padding: '10px 20px', fontSize: '13px', margin: '0 auto' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span> Proponi Nuova Birra
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
