import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const variants = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-dark-200 dark:bg-dark-800 shimmer ${variants[variant]} ${className}`}
    />
  );
};

export const BookCardSkeleton = () => (
  <div className="card p-0 overflow-hidden">
    <Skeleton className="h-80 rounded-t-2xl rounded-b-none" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-6 w-3/4" variant="text" />
      <Skeleton className="h-4 w-1/2" variant="text" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-4 w-4" variant="circular" />
        <Skeleton className="h-4 w-4" variant="circular" />
        <Skeleton className="h-4 w-4" variant="circular" />
      </div>
    </div>
  </div>
);

export default Skeleton;