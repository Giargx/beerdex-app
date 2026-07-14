import React, { useState } from 'react';
import { TrophyGrid } from '../components/TrophyGrid';
import type { PokedexEntry } from '../components/TrophyGrid';
import { FoamBubbles } from '../components/FoamBubbles';

interface PublicProfileViewProps {
  username: string;
  displayName?: string;
  pokedex: Record<string, PokedexEntry>;
  score: number;
  avatar: string | undefined;
  onBack: () => void;
  getUserRankTitle: (score: number) => string;
  getAvatarZoomProps?: (url: string | undefined) => any;
  posts: any[];
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  username,
  displayName,
  pokedex,
  score,
  avatar,
  onBack,
  getUserRankTitle,
  getAvatarZoomProps,
  posts,
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'posts'>('collection');
  const [variantSort, setVariantSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [variantSortDir, setVariantSortDir] = useState<number>(1);
  const [medalSort, setMedalSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [medalSortDir, setMedalSortDir] = useState<number>(1);

  const rankTitle = getUserRankTitle(score);
  const myPosts = posts.filter((p) => p.user === username);
  const totalUnlocked = Object.keys(pokedex || {}).length;

  return (
    <div className="page-container-view">
      <header className="hero">
        <FoamBubbles />
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
            zIndex: 5,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            arrow_back
          </span>{' '}
          Indietro
        </button>
        
        <div
          id="pubAvatarDisplay"
          {...(getAvatarZoomProps ? getAvatarZoomProps(avatar) : {})}
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
            position: 'relative',
            zIndex: 2,
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
        
        <h1 id="pubProfileName" style={{ margin: '5px 0', position: 'relative', zIndex: 2 }}>
          {displayName ? displayName : username}
        </h1>
        {displayName && (
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '5px', position: 'relative', zIndex: 2 }}>
            @{username}
          </div>
        )}
        <p id="pubProfileRank" style={{ fontWeight: 'bold', color: 'var(--dark)', opacity: 0.7, position: 'relative', zIndex: 2, margin: '5px 0' }}>
          {rankTitle}
        </p>
        
        {/* Instagram-style user stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '18px', padding: '0 10px', position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', flex: '1' }}>
            <div style={{ fontWeight: 900, fontSize: '18px', color: 'var(--dark)' }}>{myPosts.length}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Post</div>
          </div>
          <div style={{ textAlign: 'center', flex: '1', borderLeft: '1px solid rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)' }}>
            <div style={{ fontWeight: 900, fontSize: '18px', color: 'var(--dark)' }}>{score}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Punti</div>
          </div>
          <div style={{ textAlign: 'center', flex: '1' }}>
            <div style={{ fontWeight: 900, fontSize: '18px', color: 'var(--dark)' }}>{totalUnlocked}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Sblocchi</div>
          </div>
        </div>
      </header>

      {/* Tab control bar */}
      <div style={{
        display: 'flex',
        margin: '10px 20px 15px 20px',
        background: 'var(--gray)',
        borderRadius: '12px',
        padding: '4px',
        gap: '4px',
        position: 'relative',
        zIndex: 2
      }}>
        {[
          { id: 'collection', label: 'Collezione', icon: 'collections_bookmark' },
          { id: 'posts', label: 'Post Caricati', icon: 'photo_library' }
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

      <div className="page-container" style={{ marginTop: '0px' }}>
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

            <TrophyGrid
              pokedex={pokedex}
              isPub={true}
              variantSortOption={variantSort}
              variantSortDir={variantSortDir}
              medalSortOption={medalSort}
              medalSortDir={medalSortDir}
              showDeleteButton={false}
              mode="medals"
            />

            {/* Event Medals Section */}
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
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                  event_note
                </span>{' '}
                Medaglie Evento
              </h3>
            </div>

            <TrophyGrid
              pokedex={pokedex}
              isPub={true}
              variantSortOption={variantSort}
              variantSortDir={variantSortDir}
              medalSortOption={medalSort}
              medalSortDir={medalSortDir}
              showDeleteButton={false}
              mode="events"
              userPosts={myPosts}
            />

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
              mode="variants"
            />
          </div>
        )}

        {activeTab === 'posts' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <h3 style={{ borderBottom: '2px solid var(--gray)', paddingBottom: '8px', margin: '20px 20px 15px 20px', fontSize: '16px', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">photo_library</span> Foto Caricate ({myPosts.length})
            </h3>
            {myPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '10px' }}>photo_camera</span>
                <p style={{ margin: 0, fontSize: '14px' }}>Nessuna foto caricata da questo utente.</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  margin: '0 20px 20px 20px'
                }}
              >
                {[...myPosts].reverse().map((post) => (
                  <div
                    key={post.postId}
                    style={{
                      position: 'relative',
                      aspectRatio: '1/1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#f1f5f9',
                      border: '1px solid var(--gray)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <img
                      src={post.photo}
                      alt={`${post.brand} - ${post.variant}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.65)',
                        padding: '4px 6px',
                        color: 'white',
                        boxSizing: 'border-box',
                        fontSize: '9px',
                        lineHeight: 1.2,
                      }}
                    >
                      <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.brand}
                      </div>
                      <div style={{ opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.variant}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
