import React from 'react';

interface StappoOverlayProps {
  isActive: boolean;
  isPopped: boolean;
  text: string;
}

export const StappoOverlay: React.FC<StappoOverlayProps> = ({ isActive, isPopped, text }) => {
  return (
    <div className={`stappo-overlay ${isActive ? 'active' : ''} ${isPopped ? 'popped' : ''}`}>
      <div className="stappo-container">
        <div
          style={{
            position: 'relative',
            height: '220px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            width: '220px',
            margin: '0 auto',
          }}
        >
          {/* Shockwave Flash Burst */}
          <div className="stappo-flash"></div>

          {/* Flying Metallic Crown Cap */}
          <div className="stappo-cap-wrapper">
            <svg viewBox="0 0 40 40" width="36" height="36">
              <circle cx="20" cy="20" r="18" fill="#D97706" stroke="#FEF3C7" strokeWidth="2.5" />
              <circle cx="20" cy="20" r="14" fill="#F59E0B" />
              <path d="M 12 20 L 28 20 M 20 12 L 20 28" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Beer Bottle SVG */}
          <div className="stappo-bottle-wrapper">
            <svg viewBox="0 0 100 200" width="90" height="180">
              {/* Bottle Body */}
              <path
                d="M 38 10 L 62 10 C 65 10 66 18 68 35 C 75 60 85 80 85 110 L 85 185 C 85 195 75 195 50 195 C 25 195 15 195 15 185 L 15 110 C 15 80 25 60 32 35 C 34 18 35 10 38 10 Z"
                fill="url(#bottleAmberGrad)"
                stroke="#78350F"
                strokeWidth="3"
              />
              {/* Gold Foil Neck */}
              <path d="M 36 20 L 64 20 C 67 35 70 50 72 60 L 28 60 C 30 50 33 35 36 20 Z" fill="url(#goldFoilGrad)" />
              {/* Bottle Label */}
              <rect x="25" y="100" width="50" height="60" rx="6" fill="#FFFBEB" stroke="#D97706" strokeWidth="2" />
              <circle cx="50" cy="130" r="16" fill="#F59E0B" />
              <path d="M 44 130 L 56 130 M 50 124 L 50 136" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              {/* Gradients */}
              <defs>
                <linearGradient id="bottleAmberGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B45309" />
                  <stop offset="40%" stopColor="#D97706" />
                  <stop offset="80%" stopColor="#92400E" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="goldFoilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Erupting Foam & Bubbles Spray */}
          <div className="stappo-foam-wrapper">
            <div className="foam-cloud"></div>
            <div className="bubble b1"></div>
            <div className="bubble b2"></div>
            <div className="bubble b3"></div>
            <div className="bubble b4"></div>
            <div className="bubble b5"></div>
          </div>
        </div>

        <div className="stappo-text">{text}</div>
      </div>
    </div>
  );
};
