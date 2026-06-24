import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, description, icon: Icon, breadcrumbs = [], actions }) => {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 text-xs sm:text-sm flex-wrap"
        >
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={13} className="text-dark-300 dark:text-dark-600 flex-shrink-0" />}
              {crumb.href ? (
                <Link to={crumb.href}
                  className="text-dark-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate max-w-[120px] sm:max-w-none">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-dark-800 dark:text-dark-200 font-medium truncate max-w-[160px] sm:max-w-none">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </motion.nav>
      )}

      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {Icon && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
            )}
            <div>
              {!Icon && <div className="accent-rule mb-2" />}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-dark-900 dark:text-dark-50 leading-tight">
                {title}
              </h1>
            </div>
          </div>
          {description && (
            <p className="text-sm sm:text-base text-dark-500 dark:text-dark-400 max-w-2xl">
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
