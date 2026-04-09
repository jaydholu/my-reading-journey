import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', fullScreen = false, text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const Spinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="relative"
    >
      <div className={`${sizes[size]} spinner`} />
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark-950/80 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <Spinner />
          {text && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-dark-600 dark:text-dark-400 font-medium"
            >
              {text}
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <Spinner />
        {text && (
          <p className="text-sm text-dark-600 dark:text-dark-400">{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;