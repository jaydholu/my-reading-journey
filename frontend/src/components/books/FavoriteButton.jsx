import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const FavoriteButton = ({ isFavorite, onToggle, size = 'md' }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // sm matches the other action buttons exactly (w-10 h-10)
  const sizes = {
    sm: { button: 'w-10 h-10', icon: 18, rounded: 'rounded-xl' },
    md: { button: 'w-10 h-10', icon: 20, rounded: 'rounded-full' },
    lg: { button: 'w-12 h-12', icon: 24, rounded: 'rounded-full' },
  };

  const { button, icon, rounded } = sizes[size];

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 600);
  };

  // In the action row (sm), use the same pill style as other buttons
  if (size === 'sm') {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`${button} ${rounded} relative overflow-hidden
                  flex items-center justify-center transition-colors duration-200
                  ${isFavorite
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-500'
                    : 'bg-dark-100 dark:bg-dark-800 text-dark-400 dark:text-dark-500 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-500'
                  }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {/* Ripple */}
        {isAnimating && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-red-400/30 rounded-xl"
          />
        )}
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Heart
            size={icon}
            className="transition-colors duration-200"
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </motion.div>
      </motion.button>
    );
  }

  // md/lg — original floating glass style (used on cover image in ViewBook etc.)
  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`${button} ${rounded} glass-strong backdrop-blur-xl 
                flex items-center justify-center shadow-lg
                transition-all duration-200 relative overflow-hidden group`}
    >
      {isAnimating && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-red-500/30 rounded-full"
        />
      )}

      <motion.div
        animate={isAnimating ? {
          scale: [1, 1.3, 1],
          rotate: [0, -10, 10, 0]
        } : {}}
        transition={{ duration: 0.6 }}
      >
        <Heart
          size={icon}
          className={`transition-colors duration-200 ${
            isFavorite
              ? 'text-red-500 fill-red-500'
              : 'text-dark-400 dark:text-dark-500 group-hover:text-red-500'
          }`}
        />
      </motion.div>

      {isAnimating && isFavorite && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 8) * 30,
                y: Math.sin((i * Math.PI * 2) / 8) * 30,
                scale: 0,
                opacity: 0
              }}
              transition={{ duration: 0.6 }}
              className="absolute w-1 h-1 bg-red-500 rounded-full"
              style={{ left: '50%', top: '50%' }}
            />
          ))}
        </>
      )}
    </motion.button>
  );
};

export default FavoriteButton;