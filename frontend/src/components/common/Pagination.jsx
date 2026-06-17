import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage, totalPages, totalItems, itemsPerPage,
  onPageChange, onItemsPerPageChange, itemLabel = 'items',
  perPageOptions = [12, 20, 40, 60],
}) => {
  if (totalPages <= 1 && !onItemsPerPageChange) return null;

  const getPageNumbers = () => {
    const pages = [];
    /* RESPONSIVE FIX: show fewer page buttons on small screens (handled via CSS) */
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) end = Math.min(totalPages - 1, 4);
      else if (currentPage >= totalPages - 2) start = Math.max(2, totalPages - 3);
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-6 sm:pt-8 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4"
    >
      {/* RESPONSIVE FIX: summary + per-page stacked on mobile */}
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-dark-500 dark:text-dark-400">
        <span>
          Showing <span className="font-semibold text-dark-700 dark:text-dark-200">{startItem}–{endItem}</span> of{' '}
          <span className="font-semibold text-dark-700 dark:text-dark-200">{totalItems}</span> {itemLabel}
        </span>
        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-xs sm:text-sm text-dark-700 dark:text-dark-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all w-full xs:w-auto"
          >
            {perPageOptions.map((opt) => <option key={opt} value={opt}>{opt} / page</option>)}
          </select>
        )}
      </div>

      {/* Page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {/* First & Prev — hide "First" on mobile */}
          <PageButton onClick={() => onPageChange(1)} disabled={currentPage === 1} aria-label="First page" className="hidden sm:flex">
            <ChevronsLeft size={15} />
          </PageButton>
          <PageButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">
            <ChevronLeft size={15} />
          </PageButton>

          {/* Page numbers — hide ellipsis items on very small screens */}
          {pageNumbers.map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center text-dark-400 text-xs sm:text-sm select-none hidden xs:flex">···</span>
            ) : (
              <PageButton
                key={page}
                active={page === currentPage}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </PageButton>
            )
          )}

          <PageButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">
            <ChevronRight size={15} />
          </PageButton>
          <PageButton onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} aria-label="Last page" className="hidden sm:flex">
            <ChevronsRight size={15} />
          </PageButton>
        </div>
      )}
    </motion.div>
  );
};

const PageButton = ({ children, active = false, disabled = false, className = '', ...props }) => (
  <motion.button
    whileHover={!disabled && !active ? { scale: 1.08 } : {}}
    whileTap={!disabled && !active ? { scale: 0.95 } : {}}
    disabled={disabled}
    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
      active ? 'gradient-primary text-white shadow-md shadow-primary-500/30'
        : disabled ? 'text-dark-300 dark:text-dark-600 cursor-not-allowed'
        : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-dark-100'
    } ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

export default Pagination;
