import React, { useState } from 'react';
import { TrophyGrid } from '../components/TrophyGrid';
import type { PokedexEntry } from '../components/TrophyGrid';

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
}) => {
  const [variantSort, setVariantSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [variantSortDir, setVariantSortDir] = useState<number>(1);
  const [medalSort, setMedalSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [medalSortDir, setMedalSortDir] = useState<number>(1);

  const score = leaderboardScores[currentUserNick] || 0;
  const rankTitle = getUserRankTitle(score);
  const avatar = globalAvatars[currentUserNick];

  const roleText = isAdminUser ? "ADMIN" : "UTENTE";
  const roleColor = isAdminUser ? "var(--danger)" : "var(--text-muted)";

  return (
    <div className="page-container-view">
      <header className="hero">
        <h1>Il Tuo Profilo</h1>
        <p>La tua bacheca personale e i tuoi dati.</p>
      </header>

      <div className="page-container" style={{ marginTop: '-30px' }}>
        <div className="profile-user-box">
          <button
            id="btnProfileMenu"
            onClick={onToggleSettings}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--dark)',
              transition: '0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
              menu
            </span>
          </button>

          <div
            style={{ cursor: 'pointer', display: 'inline-block', position: 'relative' }}
            title="Cambia foto profilo"
            onClick={onOpenAvatarSelector}
          >
            <div
              id="profileAvatarDisplay"
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
            <div style={{ fontSize: '12px', letterSpacing: '1px', color: roleColor, marginBottom: '5px' }}>
              {roleText}
            </div>
            <div style={{ fontSize: '26px', color: 'var(--primary-dark)', fontWeight: 900, marginBottom: '5px' }}>
              {currentUserNick}
            </div>
            <div className="user-rank-title" style={{ marginBottom: 0, fontSize: '13px', padding: '5px 12px' }}>
              {rankTitle}
            </div>
          </div>
        </div>

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
    </div>
  );
};
