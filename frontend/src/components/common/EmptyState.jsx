import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = BookOpen,
  title = 'No items found',
  description = 'Get started by creating your first item',
  action,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center py-16 ${className}`}
    >
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="inline-flex"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl"
            />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 
                          dark:from-primary-900/30 dark:to-primary-800/30 
                          rounded-3xl flex items-center justify-center">
              <Icon className="text-primary-600 dark:text-primary-400" size={48} />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
            {title}
          </h3>
          <p className="text-dark-600 dark:text-dark-400">
            {description}
          </p>
        </div>

        {/* Action button */}
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {action}
          </motion.div>
        )}

        {/* Decorative elements */}
        <div className="flex justify-center gap-2 pt-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-8 bg-primary-400 dark:bg-primary-700/30 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyState;