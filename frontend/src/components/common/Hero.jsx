import React from 'react';
import { motion } from 'framer-motion';

const Hero = ({ 
  title, 
  subtitle, 
  icon: Icon,
  gradient = false,
  children 
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      {gradient && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-primary-200 dark:bg-dark-900"/>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: Math.random() * 100 + '%',
                  scale: 0 
                }}
                animate={{ 
                  y: [null, Math.random() * 100 + '%'],
                  scale: [0, 1, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
                className="absolute w-1 h-1 rounded-full bg-primary-500/30"
              />
            ))}
          </div>

          {/* Gradient orbs */}
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary-500/10 rounded-full"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"
          />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          
          {/* Icon */}
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="inline-flex"
            >
              <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center
                            shadow-xl shadow-primary-500/30">
                <Icon className="text-white" size={40} />
              </div>
            </motion.div>
          )}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif">
              <span className="text-gradient">{title}</span>
            </h1>
            {subtitle && (
              <p className="text-xl md:text-2xl text-dark-600 dark:text-dark-400 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Children content */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;