import React, { useState } from 'react';
import { TrophyGrid } from '../components/TrophyGrid';
import type { PokedexEntry } from '../components/TrophyGrid';
import { beers } from '../beers';

interface ProfileViewProps {
  currentUserNick: string;
  isAdminUser: boolean;
  myPokedex: Record<string, PokedexEntry>;
  globalAvatars: Record<string, string>;
  leaderboardScores: Record<string, number>;
  onOpenAvatarSelector: () => void;
  onToggleSettings: () => void;
  onDeleteVariant: (brand: string, variant: string) => void;
  getUserRankTitle: (score: number) => string;
  getAvatarZoomProps?: (url: string | undefined) => any;
  currentTheme: string;
  onChangeTheme: (theme: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUserNick,
  isAdminUser,
  myPokedex,
  globalAvatars,
  leaderboardScores,
  onOpenAvatarSelector,
  onToggleSettings,
  onDeleteVariant,
  getUserRankTitle,
  getAvatarZoomProps,
  currentTheme,
  onChangeTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'stats' | 'achievements'>('collection');
  const [variantSort, setVariantSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [variantSortDir, setVariantSortDir] = useState<number>(1);
  const [medalSort, setMedalSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [medalSortDir, setMedalSortDir] = useState<number>(1);

  const score = leaderboardScores[currentUserNick] || 0;
  const rankTitle = getUserRankTitle(score);
  const avatar = globalAvatars[currentUserNick];

  const roleText = isAdminUser ? "ADMIN" : "UTENTE";
  const roleColor = isAdminUser ? "var(--danger)" : "var(--text-muted)";

  // ----------------- CALCULATE STATS -----------------
  const pokedexEntries = Object.values(myPokedex || {});
  const totalUnlocked = pokedexEntries.length;
  
  // Total variants in the game
  const totalVariantsInGame = beers.reduce((acc, b) => acc + b.variants.length, 0);
  const completionPercentage = totalVariantsInGame > 0 ? Math.round((totalUnlocked / totalVariantsInGame) * 100) : 0;
  
  // Shiny count
  const shinyCount = pokedexEntries.filter(entry => entry.isShiny).length;
  
  // Tagged friends count
  const taggedFriendsCount = pokedexEntries.filter(entry => entry.taggedFriend).length;

  // Rarity distribution
  const rarityCounts = { comune: 0, media: 0, rara: 0 };
  Object.keys(myPokedex || {}).forEach(key => {
    const brand = key.split('-')[0];
    const beer = beers.find(b => b.brand === brand);
    if (beer) {
      const r = (beer.rarity || 'comune') as 'comune' | 'media' | 'rara';
      rarityCounts[r] = (rarityCounts[r] || 0) + 1;
    }
  });

  // Country completion
  const countryCounts: Record<string, { unlocked: number, total: number }> = {};
  beers.forEach(beer => {
    const c = beer.country || 'Sconosciuta';
    if (!countryCounts[c]) {
      countryCounts[c] = { unlocked: 0, total: 0 };
    }
    countryCounts[c].total += beer.variants.length;
  });
  Object.keys(myPokedex || {}).forEach(key => {
    const brand = key.split('-')[0];
    const beer = beers.find(b => b.brand === brand);
    if (beer) {
      const c = beer.country || 'Sconosciuta';
      if (countryCounts[c]) {
        countryCounts[c].unlocked += 1;
      }
    }
  });

  // Convert country counts to list, sort by percentage desc
  const countryStatsList = Object.entries(countryCounts)
    .map(([country, stats]) => ({
      country,
      percentage: stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0,
      ...stats
    }))
    .filter(stat => stat.unlocked > 0)
    .sort((a, b) => b.percentage - a.percentage);

  // ----------------- CALCULATE ACHIEVEMENTS (BADGES) -----------------
  // 1. Giro del Mondo (at least 5 different countries)
  const distinctCountriesCount = Object.keys(
    pokedexEntries.reduce((acc, entry) => {
      const beer = beers.find(b => b.brand === entry.brand);
      if (beer && beer.country) acc[beer.country] = true;
      return acc;
    }, {} as Record<string, boolean>)
  ).length;
  const badgeWorld = distinctCountriesCount >= 5;

  // 2. Collezionista Shiny (at least 1 shiny)
  const badgeShiny = shinyCount >= 1;

  // 3. Monarca delle Bionde (at least 15 comune variants)
  const badgeComune = rarityCounts.comune >= 15;

  // 4. Leggenda dei Pub (at least 5 rara variants)
  const badgeRara = rarityCounts.rara >= 5;

  // 5. Socio Onorario (at least 1 tagged sblocco)
  const badgeShared = taggedFriendsCount >= 1;

  // 6. Sommelier Esperto (at least 3 variants of the same brand unlocked)
  const brandUnlockMap: Record<string, number> = {};
  pokedexEntries.forEach(entry => {
    brandUnlockMap[entry.brand] = (brandUnlockMap[entry.brand] || 0) + 1;
  });
  const maxVariantsOfOneBrand = Math.max(...Object.values(brandUnlockMap), 0);
  const badgeSommelier = maxVariantsOfOneBrand >= 3;

  const achievementsList = [
    {
      id: 'world',
      title: '🌍 Giro del Mondo',
      description: 'Sblocca birre provenienti da almeno 5 nazioni diverse.',
      unlocked: badgeWorld,
      progress: distinctCountriesCount,
      target: 5,
    },
    {
      id: 'shiny',
      title: '✨ Collezionista Shiny',
      description: 'Trova la tua prima variante Shiny all\'avventura.',
      unlocked: badgeShiny,
      progress: shinyCount,
      target: 1,
    },
    {
      id: 'comune',
      title: '🥇 Monarca delle Bionde',
      description: 'Sblocca almeno 15 varianti di rarità comune.',
      unlocked: badgeComune,
      progress: rarityCounts.comune,
      target: 15,
    },
    {
      id: 'rara',
      title: '💎 Leggenda dei Pub',
      description: 'Sblocca almeno 5 varianti di rarità rara.',
      unlocked: badgeRara,
      progress: rarityCounts.rara,
      target: 5,
    },
    {
      id: 'shared',
      title: '🤝 Socio Onorario',
      description: 'Tagga un amico in uno sblocco di gruppo.',
      unlocked: badgeShared,
      progress: taggedFriendsCount,
      target: 1,
    },
    {
      id: 'sommelier',
      title: '🎓 Sommelier Esperto',
      description: 'Sblocca almeno 3 varianti diverse di uno stesso brand.',
      unlocked: badgeSommelier,
      progress: maxVariantsOfOneBrand,
      target: 3,
    },
  ];

  return (
    <div className="page-container-view" style={{ minHeight: '100%' }}>
      <div className="profile-header-card" style={{ position: 'relative', width: '100%' }}>
        <button
          className="settings-toggle-btn"
          onClick={onToggleSettings}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid var(--gray)',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            color: 'var(--dark)',
            transition: '0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            settings
          </span>
        </button>

        {/* User avatar display card */}
        <div style={{ textAlign: 'center', padding: '30px 20px 20px 20px' }}>
          <div
            style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}
            title="Cambia foto profilo"
            onClick={onOpenAvatarSelector}
          >
            <div
              id="profileAvatarDisplay"
              {...(getAvatarZoomProps ? getAvatarZoomProps(avatar) : {})}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: '#e0e6ed',
                margin: '0 auto 15px auto',
                border: '4px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                color: 'var(--text-muted)',
              }}
            >
              {avatar ? (
                <img src={avatar} alt={currentUserNick} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>
                  person
                </span>
              )}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '15px',
                right: 0,
                background: 'var(--white)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--primary)',
                color: 'var(--dark)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                photo_camera
              </span>
            </div>
          </div>

          <div id="settingsUserBoxContent">
            <div style={{ fontSize: '12px', letterSpacing: '1px', color: roleColor, marginBottom: '5px', fontWeight: 'bold' }}>
              {roleText}
            </div>
            <div style={{ fontSize: '26px', color: 'var(--dark)', fontWeight: 900, marginBottom: '5px' }}>
              {currentUserNick}
            </div>
            <div className="user-rank-title" style={{ marginBottom: 0, fontSize: '13px', padding: '5px 12px', display: 'inline-block' }}>
              {rankTitle}
            </div>
          </div>

          {/* Interface Brewery Themes selector */}
          <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Tema Grafico
            </span>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--white)', padding: '5px 10px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid var(--gray)' }}>
              {[
                { id: 'classic', color: '#FFB300', name: 'Pilsner (Classic)' },
                { id: 'amber', color: '#D35400', name: 'Amber Ale' },
                { id: 'dark', color: '#5C3D2E', name: 'Stout (Dark)' },
                { id: 'ipa', color: '#2D8A4E', name: 'Pale IPA' },
              ].map((themeItem) => (
                <button
                  key={themeItem.id}
                  onClick={() => onChangeTheme(themeItem.id)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: themeItem.color,
                    border: currentTheme === themeItem.id ? '2.5px solid var(--dark)' : '1.5px solid var(--gray)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'transform 0.1s ease',
                  }}
                  title={themeItem.name}
                >
                  {currentTheme === themeItem.id && (
                    <span className="material-symbols-outlined" style={{ fontSize: '12px', color: 'var(--white)', fontWeight: 'bold' }}>
                      done
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main tab control buttons */}
      <div style={{
        display: 'flex',
        margin: '10px 20px 15px 20px',
        background: 'var(--gray)',
        borderRadius: '12px',
        padding: '4px',
        gap: '4px'
      }}>
        {[
          { id: 'collection', label: 'Collezione', icon: 'collections_bookmark' },
          { id: 'stats', label: 'Statistiche', icon: 'bar_chart' },
          { id: 'achievements', label: 'Traguardi', icon: 'emoji_events' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--white)' : 'transparent',
              color: activeTab === tab.id ? 'var(--dark)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER THE TABS */}
      
      {/* 1. COLLECTION TAB */}
      {activeTab === 'collection' && (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {/* Medals sorting controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid var(--gray)',
              paddingBottom: '8px',
              margin: '30px 20px 15px 20px',
            }}
          >
            <h3 style={{ margin: 0, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--gold)' }}>
                workspace_premium
              </span>{' '}
              Medaglie Brand
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <select
                value={medalSort}
                onChange={(e) => setMedalSort(e.target.value as any)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--gray)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'var(--dark)',
                  background: '#fbfcfc',
                  outline: 'none',
                  cursor: 'pointer',
                  marginBottom: 0,
                }}
              >
                <option value="alpha">Alfabetico</option>
                <option value="nation">Nazione</option>
                <option value="rarity">Rarità</option>
                <option value="unlocked">Sbloccate</option>
              </select>
              <button
                onClick={() => setMedalSortDir((d) => d * -1)}
                style={{
                  border: '1px solid var(--gray)',
                  background: '#fbfcfc',
                  borderRadius: '8px',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {medalSortDir === -1 ? 'arrow_upward' : 'arrow_downward'}
                </span>
              </button>
            </div>
          </div>

          {/* Variants sorting controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid var(--gray)',
              paddingBottom: '8px',
              margin: '40px 20px 15px 20px',
            }}
          >
            <h3 style={{ margin: 0, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <span className="material-symbols-outlined">collections_bookmark</span> Varianti
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <select
                value={variantSort}
                onChange={(e) => setVariantSort(e.target.value as any)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  border: '1px solid var(--gray)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'var(--dark)',
                  background: '#fbfcfc',
                  outline: 'none',
                  cursor: 'pointer',
                  marginBottom: 0,
                }}
              >
                <option value="alpha">Alfabetico</option>
                <option value="nation">Nazione</option>
                <option value="rarity">Rarità</option>
                <option value="unlocked">Sbloccate</option>
              </select>
              <button
                onClick={() => setVariantSortDir((d) => d * -1)}
                style={{
                  border: '1px solid var(--gray)',
                  background: '#fbfcfc',
                  borderRadius: '8px',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {variantSortDir === -1 ? 'arrow_upward' : 'arrow_downward'}
                </span>
              </button>
            </div>
          </div>

          <TrophyGrid
            pokedex={myPokedex}
            isPub={false}
            variantSortOption={variantSort}
            variantSortDir={variantSortDir}
            medalSortOption={medalSort}
            medalSortDir={medalSortDir}
            onDeleteEntry={onDeleteVariant}
            showDeleteButton={true}
          />
        </div>
      )}

      {/* 2. STATS TAB */}
      {activeTab === 'stats' && (
        <div style={{ padding: '0 20px', animation: 'fadeIn 0.2s ease-out' }}>
          {/* Circular/Linear progress summary */}
          <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', textAlign: 'center', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Progresso Collezione
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                {/* SVG circular progress */}
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--gray)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${completionPercentage}, 100`} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', fontSize: '20px', fontWeight: 'bold', color: 'var(--dark)' }}>
                  {completionPercentage}%
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Varianti Trovate:</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--dark)', margin: '2px 0' }}>
                  {totalUnlocked} <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ {totalVariantsInGame}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--primary)' }}>auto_awesome</span>
                  <span>{shinyCount} Shiny sbloccate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: 'var(--white)', padding: '15px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--primary-dark)' }}>group</span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', textTransform: 'uppercase' }}>Brindisi in Compagnia</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark)', marginTop: '2px' }}>{taggedFriendsCount}</div>
            </div>
            <div style={{ background: 'var(--white)', padding: '15px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--gold)' }}>sports_bar</span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', textTransform: 'uppercase' }}>Punti Totali</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--dark)', marginTop: '2px' }}>{score}</div>
            </div>
          </div>

          {/* Rarity Breakdown */}
          <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', marginBottom: '25px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--dark)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined">analytics</span> Distribuzione Rarità
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Comuni', count: rarityCounts.comune, color: '#10B981', label: 'comune' },
                { name: 'Medie', count: rarityCounts.media, color: '#0EA5E9', label: 'media' },
                { name: 'Rare', count: rarityCounts.rara, color: '#EF4444', label: 'rara' },
              ].map(rarity => {
                const totalCalculated = (rarityCounts.comune + rarityCounts.media + rarityCounts.rara) || 1;
                const percent = Math.round((rarity.count / totalCalculated) * 100);
                return (
                  <div key={rarity.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--dark)' }}>{rarity.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{rarity.count} sbloccate ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--gray)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: rarity.color, borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Country completions */}
          <div style={{ background: 'var(--white)', padding: '20px', borderRadius: '16px', border: '1px solid var(--gray)', boxShadow: 'var(--card-shadow)', marginBottom: '30px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--dark)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined">flag</span> Completamento Nazioni
            </h4>
            {countryStatsList.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: '10px 0' }}>
                Nessuna nazione sbloccata. Inquadra un codice a barre per iniziare!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {countryStatsList.map(stat => (
                  <div key={stat.country} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '90px', fontSize: '13px', fontWeight: 'bold', color: 'var(--dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {stat.country}
                    </div>
                    <div style={{ flexGrow: 1, height: '8px', background: 'var(--gray)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${stat.percentage}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ width: '65px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {stat.unlocked}/{stat.total} ({stat.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ACHIEVEMENTS TAB */}
      {activeTab === 'achievements' && (
        <div style={{ padding: '0 20px', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            {achievementsList.map(badge => {
              const progressPercentage = Math.min(Math.round((badge.progress / badge.target) * 100), 100);
              return (
                <div
                  key={badge.id}
                  style={{
                    background: 'var(--white)',
                    border: badge.unlocked ? '2px solid var(--primary)' : '1px solid var(--gray)',
                    borderRadius: '16px',
                    padding: '15px',
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                    boxShadow: badge.unlocked ? '0 8px 24px rgba(245,166,35,0.08)' : 'var(--card-shadow)',
                    transition: 'all 0.2s ease',
                    opacity: badge.unlocked ? 1 : 0.7,
                  }}
                >
                  {/* Badge Icon circle */}
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: badge.unlocked ? 'linear-gradient(135deg, #FFFDE7, #FFF9C4)' : '#F1F5F9',
                      border: badge.unlocked ? '2px solid var(--primary)' : '2px dashed #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: badge.unlocked ? '0 4px 10px rgba(255,179,0,0.2)' : 'none',
                    }}
                  >
                    {badge.unlocked ? (
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--primary-dark)', animation: 'pulse 2s infinite' }}>
                        verified
                      </span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#94A3B8' }}>
                        lock
                      </span>
                    )}
                  </div>

                  {/* Badge Info */}
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--dark)' }}>
                        {badge.title}
                      </h4>
                      {badge.unlocked ? (
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary-dark)', background: '#FEF3C7', padding: '3px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                          Sbloccato
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                          {badge.progress} / {badge.target}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 8px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {badge.description}
                    </p>

                    {/* Progress bar (only if locked) */}
                    {!badge.unlocked && (
                      <div style={{ width: '100%', height: '6px', background: 'var(--gray)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercentage}%`, height: '100%', background: '#94A3B8', borderRadius: '3px' }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
