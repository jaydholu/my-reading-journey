import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'items',
  perPageOptions = [12, 20, 40, 60],
}) => {
  if (totalPages <= 1 && !onItemsPerPageChange) return null;

  // Build the visible page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Max page buttons to show (excluding first/last)

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range to always show at least 3 middle pages
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      // Always show last page
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
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
    >
      {/* Left: Item count summary */}
      <div className="flex items-center gap-3 text-sm text-dark-500 dark:text-dark-400">
        <span>
          Showing <span className="font-semibold text-dark-700 dark:text-dark-200">{startItem}–{endItem}</span> of{' '}
          <span className="font-semibold text-dark-700 dark:text-dark-200">{totalItems}</span> {itemLabel}
        </span>

        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="ml-2 px-2 py-1 rounded-lg border border-dark-200 dark:border-dark-700 
                       bg-white dark:bg-dark-900 text-sm text-dark-700 dark:text-dark-300
                       focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none
                       transition-all duration-200"
          >
            {perPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Right: Page buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page */}
          <PageButton
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            <ChevronsLeft size={16} />
          </PageButton>

          {/* Previous */}
          <PageButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </PageButton>

          {/* Page numbers */}
          {pageNumbers.map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-dark-400 dark:text-dark-500 text-sm select-none"
              >
                ···
              </span>
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

          {/* Next */}
          <PageButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </PageButton>

          {/* Last page */}
          <PageButton
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            <ChevronsRight size={16} />
          </PageButton>
        </div>
      )}
    </motion.div>
  );
};


const PageButton = ({ children, active = false, disabled = false, ...props }) => (
  <motion.button
    whileHover={!disabled && !active ? { scale: 1.08 } : {}}
    whileTap={!disabled && !active ? { scale: 0.95 } : {}}
    disabled={disabled}
    className={`
      w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium
      transition-all duration-200
      ${active
        ? 'gradient-primary text-white shadow-md shadow-primary-500/30'
        : disabled
          ? 'text-dark-300 dark:text-dark-600 cursor-not-allowed'
          : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 hover:text-dark-900 dark:hover:text-dark-100'
      }
    `}
    {...props}
  >
    {children}
  </motion.button>
);


export default Pagination;
