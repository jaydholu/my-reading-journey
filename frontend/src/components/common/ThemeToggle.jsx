import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative w-10 h-10 rounded-xl bg-dark-200/60 dark:bg-dark-800 
                flex items-center justify-center overflow-hidden
                hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors
                group ${className}`}
      aria-label="Toggle theme"
    >
      {/* Sun Icon */}
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? 90 : 0,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun 
          size={20} 
          className="text-yellow-500 group-hover:text-yellow-600 transition-colors" 
        />
      </motion.div>

      {/* Moon Icon */}
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : -90,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon 
          size={20} 
          className="text-dark-50 group-hover:text-dark-100 transition-colors" 
        />
      </motion.div>

      {/* Glow effect */}
      <motion.div
        animate={{
          opacity: isDark ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-0 rounded-xl blur-md -z-10 ${
          isDark ? 'bg-dark-800' : 'bg-yellow-400'
        }`}
      />
    </motion.button>
  );
};

export default ThemeToggle;