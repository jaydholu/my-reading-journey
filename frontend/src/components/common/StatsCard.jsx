import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', trend, trendValue, index = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(value);

  const colorClasses = {
    primary:  { bg: 'bg-primary-50 dark:bg-primary-900/20', border: 'border-primary-200 dark:border-primary-800', icon: 'text-primary-600 dark:text-primary-400' },
    success:  { bg: 'bg-sage-50 dark:bg-sage-700/15',       border: 'border-sage-200 dark:border-sage-700/40',     icon: 'text-sage-600 dark:text-sage-400' },
    info:     { bg: 'bg-blue-50 dark:bg-blue-900/20',       border: 'border-blue-200 dark:border-blue-800',        icon: 'text-blue-600 dark:text-blue-400' },
    warning:  { bg: 'bg-amber-50 dark:bg-amber-900/20',     border: 'border-amber-200 dark:border-amber-800',      icon: 'text-amber-600 dark:text-amber-400' },
    favorite: { bg: 'bg-rose-50 dark:bg-rose-900/20',       border: 'border-rose-200 dark:border-rose-800',        icon: 'text-rose-600 dark:text-rose-400' },
  };
  const tile = colorClasses[color] || colorClasses.primary;

  useEffect(() => {
    if (value === previousValue.current) return;
    const startValue = previousValue.current ?? 0;
    previousValue.current = value;
    const duration = 800;
    const steps = 40;
    const stepDuration = duration / steps;
    const increment = (value - startValue) / steps;
    let currentStep = 0;
    setDisplayValue(startValue);
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) { setDisplayValue(value); clearInterval(timer); }
      else setDisplayValue(prev => prev + increment);
    }, stepDuration);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="card-hover p-4 sm:p-6 group"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm sm:text-base lg:text-lg text-dark-500 dark:text-dark-400 mb-1 sm:mb-2 truncate">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold text-dark-900 dark:text-dark-50">
            {Math.round(displayValue).toLocaleString()}
          </h3>
          <div className="mt-1 sm:mt-2 text-xs sm:text-sm h-4 sm:h-5">
            {trend && trendValue && (
              <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-sage-600 dark:text-sage-400' : 'text-red-600 dark:text-red-400'}`}>
                <span>{trend === 'up' ? '↑' : '↓'}</span>
                <span className="truncate">{trendValue}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl ${tile.bg} border ${tile.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={tile.icon} size={18} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
