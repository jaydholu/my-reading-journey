import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  description, 
  icon: Icon,
  breadcrumbs = [],
  actions 
}) => {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4 text-sm"
        >
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight size={16} className="text-dark-400" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-dark-900 dark:text-dark-50 font-medium">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </motion.nav>
      )}

      {/* Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center
                            shadow-lg shadow-primary-500/30">
                <Icon className="text-white" size={24} />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-dark-900 dark:text-dark-50">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-dark-600 dark:text-dark-400 max-w-2xl">
              {description}
            </p>
          )}
        </motion.div>

        {/* Actions */}
        {actions && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;