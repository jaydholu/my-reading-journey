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
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(prev => prev + increment);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="card p-6 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-bold text-xl text-dark-600 dark:text-dark-400 mb-2">{title}</p>
          <h3 className="text-4xl font-bold text-dark-900 dark:text-dark-50">
            {Math.round(displayValue)}
          </h3>
          {trend && trendValue && (
            <div className={`mt-2 text-sm flex items-center gap-1 ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg transform 
                        group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;