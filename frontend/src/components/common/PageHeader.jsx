import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, description, icon: Icon, breadcrumbs = [], actions }) => {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Breadcrumbs — RESPONSIVE FIX: truncate long crumbs on small screens */}
      {breadcrumbs.length > 0 && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 text-xs sm:text-sm flex-wrap"
        >
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={14} className="text-dark-400 flex-shrink-0" />}
              {crumb.href ? (
                <Link to={crumb.href}
                  className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate max-w-[120px] sm:max-w-none">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-dark-900 dark:text-dark-50 font-medium truncate max-w-[160px] sm:max-w-none">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </motion.nav>
      )}

      {/* Header content — RESPONSIVE FIX: stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1 sm:space-y-2 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {Icon && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
                <Icon className="text-white" size={20} />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-dark-900 dark:text-dark-50 leading-tight">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-sm sm:text-base text-dark-600 dark:text-dark-400 max-w-2xl">
              {description}
            </p>
          )}
        </motion.div>

        {actions && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
