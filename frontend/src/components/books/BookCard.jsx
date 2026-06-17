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

          <div className="relative w-full aspect-[2/3] overflow-hidden bg-gradient-to-br from-dark-100 to-dark-200 dark:from-dark-800 dark:to-dark-900">
            {book.cover_image ? (
              <>
                <img
                  src={book.cover_image}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => { e.target.src = '/placeholder-book.png'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white p-4">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-3 opacity-80 text-dark-500 dark:text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </motion.div>
                <p className="font-semibold text-dark-500 dark:text-dark-300 text-sm sm:text-base text-center line-clamp-2">
                  {book.title}
                </p>
              </div>
            )}

            {/* Quick View — hidden on mobile to reduce clutter, shown on hover for larger screens */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
              <Link
                to={`/books/${book.id}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm rounded-xl text-sm font-medium text-dark-900 dark:text-dark-50 hover:bg-white dark:hover:bg-dark-900 transition-colors"
              >
                <Eye size={16} />
                Quick View
              </Link>
            </div>
          </div>

          {/* Book Info Section */}
          <div className="flex flex-col flex-1 p-3 sm:p-5">
            <div className="flex-1 space-y-1 mb-1">
              <h3 className="font-bold text-base sm:text-lg leading-tight line-clamp-2 text-dark-900 dark:text-dark-50 mb-1">
                <Link to={`/books/${book.id}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {book.title}
                </Link>
              </h3>
              {book.author && (
                <p className="text-xs sm:text-sm text-dark-700 dark:text-dark-300 flex items-center gap-1">
                  <span className="text-dark-500">by</span>
                  <span className="italic truncate">{book.author}</span>
                </p>
              )}
            </div>

            {/* Rating */}
            <div className="h-6 sm:h-7 flex items-center justify-center mb-2 sm:mb-3">
              {book.rating > 0 ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <StarRating rating={book.rating} size="sm" readonly />
                  <span className="text-xs sm:text-sm font-medium text-dark-700 dark:text-dark-300">
                    {book.rating.toFixed(1)}
                  </span>
                </div>
              ) : (
                <span className="text-xs italic text-dark-600 dark:text-dark-400">
                  (Not rated yet)
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 sm:pt-3 mt-auto border-t border-dark-200 dark:border-dark-800">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <FavoriteButton isFavorite={book.is_favorite} onToggle={() => onFavoriteToggle(book.id)} size="sm" />

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={`/books/${book.id}`}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={`/books/${book.id}/edit`}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                    title="Edit Book"
                  >
                    <Edit size={16} />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
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
