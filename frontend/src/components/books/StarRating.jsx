import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  onChange, 
  readonly = false, 
  size = 'md',
  showValue = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  const starSize = sizes[size];
  const displayRating = hoverRating || rating;

  const handleClick = (starIndex, offsetX, starWidth) => {
    if (!readonly && onChange) {
      const position = offsetX / starWidth;
      const decimalPart = Math.round(position * 10) / 10;
      const newRating = starIndex - 1 + decimalPart;
      
      const clampedRating = Math.max(0, Math.min(5, Math.round(newRating * 10) / 10));
      onChange(clampedRating);
    }
  };

  const handleMouseMove = (starIndex, e) => {
    if (readonly || !onChange) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = x / rect.width;
    const decimalPart = Math.round(position * 10) / 10;
    const newHoverRating = starIndex - 1 + decimalPart;
    
    setHoverRating(Math.max(0, Math.min(5, Math.round(newHoverRating * 10) / 10)));
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const renderStar = (index) => {
    const starStart = index - 1;
    const starEnd = index;
    const fillAmount = Math.max(0, Math.min(1, displayRating - starStart));
    
    const filled = fillAmount === 1;
    const partial = fillAmount > 0 && fillAmount < 1;

    return (
      <motion.button
        key={index}
        type="button"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          handleClick(index, offsetX, rect.width);
        }}
        onMouseMove={(e) => handleMouseMove(index, e)}
        onMouseLeave={handleMouseLeave}
        disabled={readonly}
        whileHover={!readonly ? { scale: 1.2 } : {}}
        whileTap={!readonly ? { scale: 0.9 } : {}}
        className={`relative transition-colors ${
          readonly ? 'cursor-default' : 'cursor-pointer'
        }`}
      >
        {/* Background star */}
        <Star
          size={starSize}
          className="text-dark-300 dark:text-dark-600"
          fill="currentColor"
        />

        {/* Filled/Partial star */}
        {(filled || partial) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillAmount * 100}%` }}
          >
            <Star
              size={starSize}
              className="text-primary-500"
              fill="currentColor"
            />
          </motion.div>
        )}

        {/* Hover effect */}
        {!readonly && hoverRating >= starStart && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -inset-1 bg-yellow-400/20 rounded-full blur-md -z-10"
          />
        )}
      </motion.button>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
      </div>
      
      {showValue && (
        <span className="ml-2 text-sm font-medium text-dark-600 dark:text-dark-400">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;