import React from 'react';
import { calculateScoreBreakdown } from '../utils/score';
import type { Beer } from '../beers';

interface ScoreBreakdownCardProps {
  pokedex: Record<string, any>;
  userPosts?: any[];
  catalog?: Beer[];
  title?: string;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  pokedex,
  userPosts = [],
  catalog,
  title = "Composizione Punti",
}) => {
  const breakdown = calculateScoreBreakdown(pokedex, userPosts, catalog);

  const items = [
    {
      id: 'unlocks',
      label: 'Sblocco Birre',
      desc: 'Punti base birre collezionate',
      points: breakdown.beerUnlocks,
      icon: 'sports_bar',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      id: 'brand',
      label: 'Medaglie Brand',
      desc: 'Bonus per brand completati',
      points: breakdown.brandMedals,
      icon: 'workspace_premium',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      id: 'shiny',
      label: 'Birre Shiny',
      desc: 'Bonus sblocchi speciali Shiny',
      points: breakdown.shinyBonus,
      icon: 'auto_awesome',
      color: '#EC4899',
      bgColor: '#FCE7F3',
    },
    {
      id: 'events',
      label: 'Medaglie Evento',
      desc: 'Sfide stagionali completate',
      points: breakdown.eventMedals,
      icon: 'event_available',
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      id: 'proposals',
      label: 'Proposte Approvate',
      desc: 'Bonus per birre aggiunte',
      points: breakdown.proposalsBonus,
      icon: 'lightbulb',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
  ];

  return (
    <div
      style={{
        margin: '16px 20px 24px 20px',
        padding: '18px 18px 14px 18px',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '10px',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '22px' }}>
            analytics
          </span>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dark)' }}>
            {title}
          </span>
        </div>
        <div
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 900,
            padding: '4px 10px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
          }}
        >
          {breakdown.total} PT TOTALI
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => {
          const percent = breakdown.total > 0 ? Math.round((item.points / breakdown.total) * 100) : 0;
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '12px',
                background: '#F8FAFC',
                border: '1px solid #F1F5F9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: item.bgColor,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {item.icon}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {item.desc}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, color: item.points > 0 ? '#0F172A' : '#94A3B8' }}>
                  +{item.points} <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>pt</span>
                </div>
                {item.points > 0 && (
                  <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>
                    {percent}% del totale
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
