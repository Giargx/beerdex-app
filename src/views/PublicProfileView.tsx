import React, { useState } from 'react';
import { TrophyGrid } from '../components/TrophyGrid';
import type { PokedexEntry } from '../components/TrophyGrid';

interface PublicProfileViewProps {
  username: string;
  pokedex: Record<string, PokedexEntry>;
  score: number;
  avatar: string | undefined;
  onBack: () => void;
  getUserRankTitle: (score: number) => string;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  username,
  pokedex,
  score,
  avatar,
  onBack,
  getUserRankTitle,
}) => {
  const [variantSort, setVariantSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [variantSortDir, setVariantSortDir] = useState<number>(1);
  const [medalSort, setMedalSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [medalSortDir, setMedalSortDir] = useState<number>(1);

  const rankTitle = getUserRankTitle(score);

  return (
    <div className="page-container-view">
      <header className="hero">
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '10px',
            color: 'var(--dark)',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            arrow_back
          </span>{' '}
          Indietro
        </button>
        
        <div
          id="pubAvatarDisplay"
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: '#e0e6ed',
            margin: '10px auto 10px auto',
            border: '3px solid var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            fontWeight: 'bold',
            color: 'var(--text-muted)',
          }}
        >
          {avatar ? (
            <img src={avatar} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              person
            </span>
          )}
        </div>
        
        <h1 id="pubProfileName" style={{ margin: '5px 0' }}>
          {username}
        </h1>
        <p id="pubProfileRank" style={{ fontWeight: 'bold', color: 'var(--dark)', opacity: 0.7 }}>
          {rankTitle}
        </p>
        
        <div
          style={{
            fontSize: '20px',
            fontWeight: 900,
            color: 'var(--dark)',
            marginTop: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
          }}
          id="pubProfileScore"
        >
          {score}{' '}
          <span className="material-symbols-outlined" style={{ color: 'var(--primary-dark)' }}>
            emoji_events
          </span>
        </div>
      </header>

      <div className="page-container" style={{ marginTop: '-30px' }}>
        {/* Medals sorting controls */}
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
          <h3 style={{ margin: 0, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <h3 style={{ margin: 0, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          pokedex={pokedex}
          isPub={true}
          variantSortOption={variantSort}
          variantSortDir={variantSortDir}
          medalSortOption={medalSort}
          medalSortDir={medalSortDir}
          showDeleteButton={false}
        />
      </div>
    </div>
  );
};
