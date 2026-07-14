import React from 'react';

export const FoamBubbles: React.FC = () => {
  const isEnabled = localStorage.getItem('beerdex_bubbles') !== 'no';
  if (!isEnabled) return null;

  return (
    <div className="foam-container" style={{ position: 'absolute', top: 0, left: '-10%', width: '120%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      {/* Set of 8 rising bubbles with staggered offsets and speeds */}
      <div className="bubble" style={{ left: '8%', width: '14px', height: '14px', animationDelay: '0.2s', animationDuration: '4.8s' }}></div>
      <div className="bubble" style={{ left: '22%', width: '20px', height: '20px', animationDelay: '1.5s', animationDuration: '6.2s' }}></div>
      <div className="bubble" style={{ left: '36%', width: '11px', height: '11px', animationDelay: '0s', animationDuration: '3.9s' }}></div>
      <div className="bubble" style={{ left: '48%', width: '24px', height: '24px', animationDelay: '2.8s', animationDuration: '7.5s' }}></div>
      <div className="bubble" style={{ left: '62%', width: '15px', height: '15px', animationDelay: '0.9s', animationDuration: '5.1s' }}></div>
      <div className="bubble" style={{ left: '74%', width: '22px', height: '22px', animationDelay: '1.9s', animationDuration: '6.8s' }}></div>
      <div className="bubble" style={{ left: '86%', width: '12px', height: '12px', animationDelay: '3.2s', animationDuration: '4.3s' }}></div>
      <div className="bubble" style={{ left: '94%', width: '17px', height: '17px', animationDelay: '0.6s', animationDuration: '5.6s' }}></div>
      {/* Foam waves at the very bottom border of the header */}
      <div className="foam-wave layer2"></div>
      <div className="foam-wave"></div>
    </div>
  );
};
