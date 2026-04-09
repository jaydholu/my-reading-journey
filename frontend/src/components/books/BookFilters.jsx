import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';
import Button from '../common/Button';
import StarRating from './StarRating';
import { FORMATS } from '../../utils/constants';

const BookFilters = ({ isOpen, onClose, onApply, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    genre: initialFilters.genre || '',
    author: initialFilters.author || '',
    rating_min: initialFilters.rating_min || 0,
    rating_max: initialFilters.rating_max || 5,
    year: initialFilters.year || '',
    format: initialFilters.format || '',
    favorite: initialFilters.favorite || false,
  });

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      genre: '',
      author: '',
      rating_min: 0,
      rating_max: 5,
      year: '',
      format: '',
      favorite: false,
    };
    setFilters(resetFilters);
    onApply(resetFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-dark-900 
                     shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 z-10 glass-strong border-b border-dark-200 dark:border-dark-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 
                                flex items-center justify-center">
                    <SlidersHorizontal className="text-primary-600 dark:text-primary-400" size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                    Filters
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-dark-100 dark:bg-dark-800 
                           flex items-center justify-center hover:bg-dark-200 dark:hover:bg-dark-700
                           transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Genre */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                  Genre
                </label>
                <input
                  type="text"
                  value={filters.genre}
                  onChange={(e) => handleChange('genre', e.target.value)}
                  placeholder="e.g., Fiction, Mystery"
                  className="input-field"
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                  Author
                </label>
                <input
                  type="text"
                  value={filters.author}
                  onChange={(e) => handleChange('author', e.target.value)}
                  placeholder="Author name"
                  className="input-field"
                />
              </div>

              {/* Rating Range */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                  Rating Range
                </label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-600 dark:text-dark-400">Minimum</span>
                      <span className="font-medium text-dark-900 dark:text-dark-50">
                        {filters.rating_min.toFixed(1)}
                      </span>
                    </div>
                    <StarRating
                      rating={filters.rating_min}
                      onChange={(value) => handleChange('rating_min', value)}
                      size="lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-600 dark:text-dark-400">Maximum</span>
                      <span className="font-medium text-dark-900 dark:text-dark-50">
                        {filters.rating_max.toFixed(1)}
                      </span>
                    </div>
                    <StarRating
                      rating={filters.rating_max}
                      onChange={(value) => handleChange('rating_max', value)}
                      size="lg"
                    />
                  </div>
                </div>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                  Year Read
                </label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  placeholder="YYYY"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="input-field"
                />
              </div>

              {/* Format */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
                  Format
                </label>
                <select
                  value={filters.format}
                  onChange={(e) => handleChange('format', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Formats</option>
                  {FORMATS.map(fmt => (
                    <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                  ))}
                </select>
              </div>

              {/* Favorites Only */}
              <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dark-200 dark:border-dark-700
                              hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer
                              transition-colors">
                <input
                  type="checkbox"
                  checked={filters.favorite}
                  onChange={(e) => handleChange('favorite', e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-dark-900 dark:text-dark-50">
                    Favorites Only
                  </p>
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    Show only books marked as favorites
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 glass-strong border-t border-dark-200 dark:border-dark-800 p-6">
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApply}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookFilters;