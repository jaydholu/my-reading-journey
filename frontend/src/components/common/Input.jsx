import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 dark:text-dark-500">
            <Icon size={20} />
          </div>
        )}
        
        <input
          ref={ref}
          className={`input-field ${Icon ? 'pl-12' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;