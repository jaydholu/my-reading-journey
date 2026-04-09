import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Button from './Button';

const SearchBar = ({ 
  onSearch, 
  onFilterToggle,
  placeholder = 'Search...',
  showFilters = false 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-3">
      <div className="flex-1 relative">
        <motion.div
          animate={{ 
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused 
              ? '0 0 0 4px rgba(235, 157, 68, 0.1)' 
              : '0 0 0 0px rgba(235, 157, 68, 0)'
          }}
          className="relative"
        >
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500" 
            size={20} 
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-dark-200 dark:border-dark-700 
                     bg-white dark:bg-dark-900 text-dark-900 dark:text-dark-50
                     focus:border-primary-500 transition-all duration-200 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 
                       dark:hover:text-dark-200 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </motion.div>
      </div>

      <Button type="submit" variant="primary">
        Search
      </Button>

      {showFilters && (
        <Button
          type="button"
          variant="secondary"
          icon={SlidersHorizontal}
          onClick={onFilterToggle}
        >
          Filters
        </Button>
      )}
    </form>
  );
};

export default SearchBar;