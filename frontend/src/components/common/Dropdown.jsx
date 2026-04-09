import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ 
  trigger, 
  children, 
  align = 'left',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${alignments[align]} top-full mt-2 z-50 min-w-[200px] ${className}`}
          >
            <div className="glass-strong rounded-2xl shadow-xl p-2 border border-dark-200 dark:border-dark-700">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({ 
  icon: Icon, 
  children, 
  onClick, 
  danger = false,
  className = '' 
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
      transition-all duration-200 font-medium
      ${danger 
        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
        : 'text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
      }
      ${className}
    `}
  >
    {Icon && <Icon size={18} />}
    <span>{children}</span>
  </button>
);

export const DropdownDivider = () => (
  <div className="my-2 border-t border-dark-200 dark:border-dark-700" />
);

export default Dropdown;