import React, { useState, useMemo } from 'react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [sortFilter, setSortFilter] = useState(() => {
    try { return localStorage.getItem('beerdex_catalog_sort') || 'alpha'; } catch { return 'alpha'; }
  });
  const [sortDir, setSortDir] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('beerdex_catalog_sort_dir');
      return saved ? parseInt(saved, 10) : 1;
    } catch { return 1; }
  });

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
  const ItalianRegions = useMemo(() => {
    return Array.from(
      new Set(
        safeCatalog
          .filter((b) => b && b.country === 'Italia' && b.regione)
          .map((b) => b.regione as string)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [safeCatalog]);

  // Principali Nazioni per le Quick Filter Chips
  const popularCountries = [
    { label: 'Tutte', flag: '🌍' },
    { label: 'Italia', flag: '🇮🇹' },
    { label: 'Germania', flag: '🇩🇪' },
    { label: 'Belgio', flag: '🇧🇪' },
    { label: 'Paesi Bassi', flag: '🇳🇱' },
    { label: 'Repubblica Ceca', flag: '🇨🇿' },
    { label: 'Stati Uniti', flag: '🇺🇸' },
    { label: 'Irlanda', flag: '🇮🇪' },
    { label: 'Messico', flag: '🇲🇽' },
    { label: 'Danimarca', flag: '🇩🇰' },
    { label: 'Spagna', flag: '🇪🇸' },
    { label: 'Francia', flag: '🇫🇷' },
    { label: 'Scozia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ];

  // Filter and sort beers list
  const normalizedSearch = normalizeStr(searchTerm).trim();
  const filteredBeers = useMemo(() => {
    return safeCatalog.filter((beer) => {
      if (!beer || !beer.brand) return false;

      const brandName = normalizeStr(beer.brand).trim();
      const brandWords = brandName.split(/\s+/);

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
  }, [safeCatalog, normalizedSearch, countryFilter, regionFilter]);

  const rarityMap: Record<string, number> = { comune: 1, media: 2, rara: 3 };

  const sortedBeers = useMemo(() => {
    const list = [...filteredBeers];
    list.sort((a, b) => {
      let res = 0;
      if (sortFilter === 'alpha') {
        res = (a.brand || '').localeCompare(b.brand || '');
      } else if (sortFilter === 'rarity') {
        res = (rarityMap[a.rarity] || 0) - (rarityMap[b.rarity] || 0) || (a.brand || '').localeCompare(b.brand || '');
      }
      return res * sortDir;
    });
    return list;
  }, [filteredBeers, sortFilter, sortDir]);

  // Calcolo delle valutazioni medie globali per ogni variante di birra da TUTTI gli utenti dell'app
  const globalAverageRatings = useMemo(() => {
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
    <div className="page-container-view" style={{ overflowX: 'hidden', paddingBottom: '90px' }}>
      {/* 🌟 Modern Hero Banner with Glassmorphism Stats */}
      <header className="hero">
        <FoamBubbles />
        <h1 style={{ position: 'relative', zIndex: 2 }}>Esplora Catalogo Birre 🍺</h1>
        <p style={{ position: 'relative', zIndex: 2 }}>Scopri tutte le birre disponibili nel beerdex, filtra per paese o ricerca la tua preferita.</p>
      </header>

      <div className="page-container" style={{ marginTop: '-20px', padding: '0 12px' }}>
        {/* 🔎 Modern Search & Quick Country Filter Chips Container */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #F1F5F9',
            marginBottom: '16px',
          }}
        >
          {/* Search Input with Clear Button */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                fontSize: '20px',
              }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Cerca marca (es. Peroni, Heineken, Corona...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 38px 12px 42px',
                borderRadius: '14px',
                border: '1.5px solid #E2E8F0',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0F172A',
                background: '#F8FAFC',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
            />
            {searchTerm && (
              <span
                className="material-symbols-outlined"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                cancel
              </span>
            )}
          </div>

          {/* Quick Country Filter Chips (Horizontal Scroll) */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Nazione
            </div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                touchAction: 'pan-x',
                overscrollBehaviorX: 'contain',
              }}
            >
              {popularCountries.map((c) => {
                const isSelected = countryFilter === c.label;
                return (
                  <button
                    key={c.label}
                    onClick={() => {
                      setCountryFilter(c.label);
                      if (c.label !== 'Italia') setRegionFilter('Tutte');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 13px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      border: isSelected ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                      background: isSelected ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : '#F8FAFC',
                      color: isSelected ? '#FFFFFF' : '#334155',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 3px 10px rgba(245, 158, 11, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <span>{c.flag}</span>
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Italian Region Sub-Filter */}
          {countryFilter === 'Italia' && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #E2E8F0', animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase' }}>
                Regione Italiana
              </div>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              >
                <option value="Tutte">Tutte le Regioni Italiane</option>
                {ItalianRegions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort & Layout Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>Ordina:</span>
              <select
                value={sortFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSortFilter(val);
                  localStorage.setItem('beerdex_catalog_sort', val);
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0F172A',
                  background: '#FFFFFF',
                  flexGrow: 1,
                  maxWidth: '160px',
                }}
              >
                <option value="alpha">Alfabetico</option>
                <option value="rarity">Rarità</option>
              </select>

              <button
                onClick={handleToggleDir}
                style={{
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#334155',
                }}
                title={sortDir === 1 ? "Crescente" : "Decrescente"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {sortDir === 1 ? 'arrow_upward' : 'arrow_downward'}
                </span>
              </button>
            </div>

            {/* View Mode Switcher (Grid 2-Col vs Compact List) */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  border: 'none',
                  background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'grid' ? '#F59E0B' : '#64748B',
                  borderRadius: '7px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'grid' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                }}
                title="Vista a Griglia (2 Colonne)"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  border: 'none',
                  background: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'list' ? '#F59E0B' : '#64748B',
                  borderRadius: '7px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'list' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                }}
                title="Vista a Lista (1 Colonna)"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_stream</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🍺 Main Beer Catalog List / Grid */}
        <div id="beerList" style={{ width: '100%', boxSizing: 'border-box' }}>
          {sortedBeers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 20px',
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '2px dashed #E2E8F0',
                margin: '10px auto 30px auto',
                width: '100%',
                maxWidth: '460px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                boxSizing: 'border-box',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#F59E0B', marginBottom: '10px' }}>
                sports_bar
              </span>
              <h3 style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>
                Nessuna marca trovata
              </h3>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
                {searchTerm ? (
                  <>Non trovi la marca "<strong>{searchTerm}</strong>"? Proponila agli admin!</>
                ) : (
                  <>Non vedi la marca che cerchi? Proponila subito agli admin!</>
                )}
                <br />
                Se approvata, la sbloccherai immediatamente e riceverai <strong>+2 Punti Bonus</strong>!
              </p>
              <button
                className="btn-main"
                onClick={() => onOpenProposeModal(searchTerm)}
                style={{ display: 'inline-flex', width: 'auto', padding: '12px 24px', margin: '0 auto', fontSize: '14px' }}
              >
                <span className="material-symbols-outlined">add_circle</span> Proponi Nuova Birra
              </button>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                  gap: '12px',
                  width: '100%',
                  boxSizing: 'border-box',
                  alignItems: 'stretch',
                }}
              >
                {sortedBeers.map((beer, index) => {
                  const isExpanded = !!expandedCards[beer.brand];
                  const pairIndex = Math.floor(index / (viewMode === 'grid' ? 2 : 1));
                  const cardOrder = isExpanded
                    ? pairIndex * 10 - 1
                    : pairIndex * 10 + (index % (viewMode === 'grid' ? 2 : 1));

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

              {/* Bottom Propose Banner */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px 16px',
                  background: 'linear-gradient(135deg, #FFFDF5 0%, #FEF3C7 100%)',
                  borderRadius: '20px',
                  border: '1.5px dashed rgba(245, 158, 11, 0.4)',
                  margin: '24px auto 10px auto',
                  width: '100%',
                  maxWidth: '500px',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  {searchTerm ? (
                    <>Manca la variante per "<strong>{searchTerm}</strong>"?</>
                  ) : (
                    <>Manca una birra che conosci nel catalogo?</>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px', fontWeight: 500 }}>
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
