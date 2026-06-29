import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import StarRating from './StarRating';
import FavoriteButton from './FavoriteButton';

const BookCard = ({ book, onDelete, onFavoriteToggle, index = 0 }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(book.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete book:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative"
      >
        <div className="card-hover overflow-hidden h-full flex flex-col">

          {/* Cover */}
          <div className="relative w-full aspect-[2/3] overflow-hidden bg-gradient-to-br from-dark-100 to-dark-200 dark:from-dark-800 dark:to-dark-900">
            {book.cover_image ? (
              <>
                <img
                  src={book.cover_image}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <svg className="w-14 h-14 sm:w-16 sm:h-16 mb-3 opacity-70 text-primary-400 dark:text-primary-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </motion.div>
                <p className="font-serif font-medium text-dark-600 dark:text-dark-300 text-sm sm:text-base text-center line-clamp-2">
                  {book.title}
                </p>
              </div>
            )}

            {/* Quick View — refined cream pill instead of frosted-glass */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hidden sm:block">
              <Link
                to={`/books/${book.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 rounded-xl text-sm font-medium text-dark-900 dark:text-dark-50 shadow-sm hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <Eye size={16} className="text-primary-600 dark:text-primary-400" />
                Quick View
              </Link>
            </div>
          </div>

          {/* Book Info Section */}
          <div className="flex flex-col flex-1 p-3 sm:p-5">
            <div className="flex-1 space-y-1 mb-1">
              <h3 className="font-serif font-semibold text-base sm:text-lg leading-snug line-clamp-2 text-dark-900 dark:text-dark-50 mb-1">
                <Link to={`/books/${book.id}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {book.title}
                </Link>
              </h3>
              {book.author && (
                <p className="text-xs sm:text-sm text-dark-600 dark:text-dark-300 flex items-center gap-1 min-w-0">
                  <span className="text-dark-400 dark:text-dark-500 flex-shrink-0">by</span>
                  <span className="italic truncate">{book.author}</span>
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="h-6 sm:h-7 flex items-center justify-center mb-2 sm:mb-3">
              {book.rating > 0 ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <StarRating rating={book.rating} size="sm" readonly />
                  <span className="text-xs sm:text-sm font-medium text-dark-600 dark:text-dark-300">
                    {book.rating.toFixed(1)}
                  </span>
                </div>
              ) : (
                <span className="text-xs italic text-dark-400 dark:text-dark-500">
                  Not rated yet
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 sm:pt-3 mt-auto border-t border-dark-200 dark:border-dark-700">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <FavoriteButton isFavorite={book.is_favorite} onToggle={() => onFavoriteToggle(book.id)} size="sm" />

                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to={`/books/${book.id}`}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40
                    border border-blue-200 dark:border-blue-700 text-blue-500 dark:text-blue-400 flex items-center justify-center
                    hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to={`/books/${book.id}/edit`}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-50 dark:bg-green-900/40
                    border border-green-200 dark:border-green-700 text-green-500 dark:text-green-400 flex items-center justify-center
                    hover:border-green-300 hover:text-green-600 dark:hover:border-green-700 dark:hover:text-green-400 transition-colors"
                    title="Edit Book"
                  >
                    <Edit size={16} />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 dark:bg-red-900/40
                    border border-red-200 dark:border-red-700 text-red-500 dark:text-red-400 flex items-center justify-center
                    hover:border-red-300 hover:text-red-600 dark:hover:border-red-700 dark:hover:text-red-400 transition-colors"
                    title="Delete Book"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.article>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Book?"
        message={<>Are you sure you want to delete <strong>"{book.title}"</strong>? This action cannot be undone.</>}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
      />
    </>
  );
};

export default BookCard;
