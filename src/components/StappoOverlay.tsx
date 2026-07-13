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
            height: '180px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            width: '200px',
            margin: '0 auto',
          }}
        >
          <span className="stappo-cap">🪙</span>
          <span className="stappo-bottle">🍾</span>
          <span className="stappo-foam">🫧💦✨</span>
        </div>
        <div className="stappo-text">{text}</div>
      </div>
    </div>
  );
};
