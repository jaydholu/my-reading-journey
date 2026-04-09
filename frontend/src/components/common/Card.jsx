import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  hover = false, 
  glass = false,
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${glass ? 'glass' : 'card'} 
        ${hover ? 'card-hover' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;