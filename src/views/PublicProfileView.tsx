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
  currentUserNick: string;
  onToggleLike: (postId: string, imageContainer: HTMLElement | null) => void;
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
  currentUserNick,
  onToggleLike,
}) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'posts'>('collection');
  const [variantSort, setVariantSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [variantSortDir, setVariantSortDir] = useState<number>(1);
  const [medalSort, setMedalSort] = useState<'alpha' | 'unlocked' | 'rarity' | 'nation'>('unlocked');
  const [medalSortDir, setMedalSortDir] = useState<number>(1);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

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
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }} title={tab.label}>{tab.icon}</span>
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
                    onClick={() => setSelectedPost(post)}
                    style={{
                      position: 'relative',
                      aspectRatio: '1/1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#f1f5f9',
                      border: '1px solid var(--gray)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
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

      {/* INSTAGRAM POST DETAIL MODAL OVERLAY */}
      {(() => {
        const currentPostInProp = selectedPost ? posts.find(p => p.postId === selectedPost.postId) : null;
        const activeModalPost = currentPostInProp || selectedPost;
        if (!activeModalPost) return null;
        
        return (
          <div
            className="modal-backdrop"
            onClick={() => setSelectedPost(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
              boxSizing: 'border-box',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div
              className="instagram-post-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--white)',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '480px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '90vh',
                animation: 'zoomIn 0.2s ease-out'
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '2px solid var(--primary)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                      color: 'white',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      fontSize: '14px'
                    }}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={username}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      username.substring(0, 2)
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--dark)' }}>
                      {displayName || username}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(activeModalPost.time).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
                </button>
              </div>

              {/* Post Photo */}
              <div
                style={{
                  position: 'relative',
                  background: '#0c0c0e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '1/1',
                }}
              >
                <img
                  src={activeModalPost.photo}
                  alt={`${activeModalPost.brand} - ${activeModalPost.variant}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                {activeModalPost.isShiny && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 10px rgba(245, 158, 11, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>star</span> Shiny
                  </div>
                )}
              </div>

              {/* Post Info and Actions */}
              <div style={{ padding: '16px 20px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Like Button */}
                    <button
                      onClick={() => {
                        onToggleLike(activeModalPost.postId, null);
                      }}
                      style={{
                        background: activeModalPost.likes && activeModalPost.likes[currentUserNick] ? '#FFFBEB' : '#F8FAFC',
                        border: '1px solid ' + (activeModalPost.likes && activeModalPost.likes[currentUserNick] ? 'var(--primary)' : 'var(--gray)'),
                        borderRadius: '20px',
                        padding: '6px 14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: activeModalPost.likes && activeModalPost.likes[currentUserNick] ? 'var(--primary-dark)' : 'var(--text-muted)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sports_bar</span>
                      <span style={{ fontSize: '13px' }}>
                        {activeModalPost.likes ? Object.keys(activeModalPost.likes).length : 0} Brindisi
                      </span>
                    </button>
                  </div>
                </div>

                {/* Beer Details Card */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--gray)',
                    borderRadius: '16px',
                    padding: '12px 14px',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 900, fontSize: '15px', color: 'var(--dark)' }}>
                      {activeModalPost.brand}
                    </div>
                    <div
                      style={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background:
                          activeModalPost.rarity === 'rara'
                            ? '#FEE2E2'
                            : activeModalPost.rarity === 'media'
                            ? '#FEF3C7'
                            : '#F1F5F9',
                        color:
                          activeModalPost.rarity === 'rara'
                            ? '#991B1B'
                            : activeModalPost.rarity === 'media'
                            ? '#92400E'
                            : '#475569',
                      }}
                    >
                      {activeModalPost.rarity || 'comune'}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {activeModalPost.variant}
                  </div>
                  {activeModalPost.pubName && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: 'var(--primary-dark)',
                        marginTop: '6px',
                        fontWeight: '600'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                      {activeModalPost.pubName}
                    </div>
                  )}
                </div>

                {/* Description / Caption */}
                {activeModalPost.description && (
                  <div style={{ fontSize: '13px', color: 'var(--dark)', lineHeight: 1.4, margin: '8px 0 0 2px' }}>
                    <strong style={{ marginRight: '6px' }}>
                      {displayName || username}
                    </strong>
                    {activeModalPost.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
