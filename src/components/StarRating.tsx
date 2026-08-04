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

  const calculateStarValue = (e: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    return isLeftHalf ? starIndex - 0.5 : starIndex;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
    if (readOnly || !onRate) return;
    setHoverRating(calculateStarValue(e, starIndex));
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
    if (readOnly || !onRate) return;
    onRate(calculateStarValue(e, starIndex));
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
        const diff = currentDisplay - (starIndex - 1);
        let iconName = 'star';
        let isFilled = false;

        if (diff >= 0.75) {
          iconName = 'star';
          isFilled = true;
        } else if (diff >= 0.25) {
          iconName = 'star_half';
          isFilled = true;
        } else {
          iconName = 'star';
          isFilled = false;
        }

        return (
          <span
            key={starIndex}
            className="material-symbols-outlined"
            onClick={(e) => handleClick(e, starIndex)}
            onMouseMove={(e) => handleMouseMove(e, starIndex)}
            onMouseLeave={() => !readOnly && setHoverRating(null)}
            style={{
              fontSize: `${size}px`,
              color: isFilled ? '#F59E0B' : '#CBD5E1', // Gold vs Light Gray
              cursor: readOnly || !onRate ? 'default' : 'pointer',
              transition: 'transform 0.15s ease, color 0.15s ease',
              transform: !readOnly && hoverRating !== null && Math.ceil(hoverRating) === starIndex ? 'scale(1.18)' : 'scale(1)',
              fontVariationSettings: isFilled ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400",
            }}
          >
            {iconName}
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
          {rating > 0 ? `${rating.toFixed(rating % 1 === 0 ? 0 : 1)}/5` : 'Non votata'}
        </span>
      )}
    </div>
  );
};
