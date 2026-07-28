import React, { useState } from 'react';

interface StarRatingProps {
  rating?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: number; // font size in px
  showText?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onRate,
  readOnly = false,
  size = 20,
  showText = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const currentDisplay = hoverRating !== null ? hoverRating : rating;

  const handleStarClick = (starValue: number) => {
    if (readOnly || !onRate) return;
    onRate(starValue);
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        userSelect: 'none',
      }}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= currentDisplay;
        return (
          <span
            key={starIndex}
            className="material-symbols-outlined"
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => !readOnly && setHoverRating(starIndex)}
            onMouseLeave={() => !readOnly && setHoverRating(null)}
            style={{
              fontSize: `${size}px`,
              color: isFilled ? '#F59E0B' : '#CBD5E1', // Gold vs Light Gray
              cursor: readOnly || !onRate ? 'default' : 'pointer',
              transition: 'transform 0.15s ease, color 0.15s ease',
              transform: !readOnly && hoverRating === starIndex ? 'scale(1.2)' : 'scale(1)',
              fontVariationSettings: isFilled ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400",
            }}
          >
            {isFilled ? 'star' : 'star'}
          </span>
        );
      })}

      {showText && (
        <span
          style={{
            fontSize: `${Math.max(11, size * 0.65)}px`,
            fontWeight: 'bold',
            color: rating > 0 ? '#B45309' : 'var(--text-muted)',
            marginLeft: '4px',
          }}
        >
          {rating > 0 ? `${rating}/5` : 'Non votata'}
        </span>
      )}
    </div>
  );
};
