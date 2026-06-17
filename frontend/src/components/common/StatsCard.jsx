import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', trend, trendValue, index = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(value);

  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-green-500 to-green-600',
    info: 'from-blue-500 to-blue-600',
    warning: 'from-orange-500 to-orange-600',
    favorite: 'from-red-500 to-red-600',
  };

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
      className="card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* RESPONSIVE FIX: smaller title text on mobile to prevent overflow */}
          <p className="font-bold text-sm sm:text-base lg:text-xl text-dark-600 dark:text-dark-400 mb-1 sm:mb-2 truncate">
            {title}
          </p>
          {/* RESPONSIVE FIX: smaller number on mobile */}
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-900 dark:text-dark-50">
            {Math.round(displayValue).toLocaleString()}
          </h3>
          <div className="mt-1 sm:mt-2 text-xs sm:text-sm h-4 sm:h-5">
            {trend && trendValue && (
              <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <span>{trend === 'up' ? '↑' : '↓'}</span>
                <span className="truncate">{trendValue}</span>
              </div>
            )}
          </div>
        </div>

        {/* RESPONSIVE FIX: smaller icon on mobile */}
        <div className={`w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
          <Icon className="text-white" size={18} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
