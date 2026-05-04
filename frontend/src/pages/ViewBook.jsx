import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Edit, Trash2, CalendarDays, User, BookOpen, Globe, Package, Hash, Building, NotebookText
} from 'lucide-react';
import { formatDate, formatRating } from '../utils/formatters';
import Button from '../components/common/Button';
import StarRating from '../components/books/StarRating';
import FavoriteButton from '../components/books/FavoriteButton';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from '../components/common/Toast';
import { useBooks } from '../hooks/useBooks';
import api from '../api/axios';

const ViewBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBook, deleteBook, toggleFavorite } = useBooks();

  const [nextBook, setNextBook] = useState(null);
  const [loadingNext, setLoadingNext] = useState(false);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadBook();
    loadNextBook();
  }, [id]);

  const loadBook = async () => {
    try {
      const data = await getBook(id);
      setBook(data);
    } catch (error) {
      toast.error('Failed to load book');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadNextBook = async () => {
    setLoadingNext(true);
    try {
      const response = await api.get(`/books/${id}/next`);
      setNextBook(response.data);
    } catch (error) {
      // No next book available
      setNextBook(null);
    } finally {
      setLoadingNext(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBook(id);
      toast.success('Book deleted successfully');
      setShowDeleteDialog(false);
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Failed to delete book');
      setDeleting(false);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      await toggleFavorite(id);
      setBook(prev => ({ ...prev, is_favorite: !prev.is_favorite }));
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleNextBook = () => {
    if (nextBook) {
      navigate(`/books/${nextBook.id}`);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading book details..." />;
  }

  if (!book) {
    return null;
  }

  const InfoItem = ({ icon: Icon, label, value }) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-200 dark:bg-primary-900/30 
                      flex items-center justify-center flex-shrink-0">
          <Icon className="text-primary-600 dark:text-primary-400" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-dark-600 dark:text-dark-400">{label}</div>
          <div className="font-medium text-md text-dark-900 dark:text-dark-50 break-words">
            {value}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 
                  dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">

      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-12">

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-row justify-between mb-6 mt-12"
        >
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)}> Back </Button>
          <Button
            variant="primary"
            icon={ArrowRight}
            onClick={handleNextBook}
            disabled={!nextBook || loadingNext}
            loading={loadingNext}
          >
            {loadingNext
              ? 'Loading...'
              : nextBook
                ? `Next`
                : 'No More Books'}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-5xl lg:col-span-2 space-y-6"
          >

            {/* Title & Meta */}
            <div className="card p-8">
              <div className="space-y-4">
                <div>
                  {book.genre && (
                    <span className="inline-block px-4 py-1 bg-primary-200 dark:bg-primary-900/30 
                                   text-primary-700 dark:text-primary-300 rounded-full text-sm 
                                   font-medium mb-3">
                      {book.genre}
                    </span>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold font-serif text-dark-900 dark:text-dark-50">
                    {book.title}
                  </h1>
                </div>

                {book.author && (
                  <p className="text-xl text-dark-600 dark:text-dark-400 flex items-center gap-2">
                    <User size={20} />
                    <span className="italic">by {book.author}</span>
                  </p>
                )}

                {book.rating > 0 && (
                  <div className="flex items-center gap-4">
                    <StarRating rating={book.rating} size="lg" readonly />
                    <span className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                      {formatRating(book.rating)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reading Info */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-6">
                Reading Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={CalendarDays}
                  label="Started Reading"
                  value={book.reading_started ?
                    formatDate(book.reading_started, 'MMMM dd, yyyy') : null}
                />
                <InfoItem
                  icon={CalendarDays}
                  label="Finished Reading"
                  value={book.reading_finished ?
                    formatDate(book.reading_finished, 'MMMM dd, yyyy') : 'Currently Reading'}
                />
              </div>
            </div>

            {/* Book Details */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-6">
                Book Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={Hash} label="ISBN" value={book.isbn} />
                <InfoItem icon={CalendarDays} label="Publication Year" value={book.publication_year} />
                <InfoItem icon={Building} label="Publisher" value={book.publisher} />
                <InfoItem icon={Globe} label="Language" value={book.language} />
                <InfoItem icon={BookOpen} label="Page Count" value={book.page_count ? `${book.page_count} pages` : null} />
                <InfoItem icon={Package} label="Format" value={book.format ? book.format.charAt(0).toUpperCase() + book.format.slice(1) : null} />
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="card p-8">
                <div className="flex flex-row gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-200 dark:bg-primary-900/30 
                      flex items-center justify-center flex-shrink-0">
                    <NotebookText size={24} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-dark-900 dark:text-dark-50 mb-4">
                    Your Review
                  </h2>
                </div>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-dark-700 dark:text-dark-300 whitespace-pre-wrap">
                    {book.description}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column - Cover & Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-3xl space-y-2.5"
          >

            {/* Cover Image */}
            <div className="card p-0 overflow-hidden">
              <div className="relative">
                {book.cover_image ? (
                  <img
                    src={book.cover_image}
                    alt={`${book.title} cover`}
                    className="w-full h-[650px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[600px] bg-gradient-to-br from-dark-100 to-dark-200 
                                dark:from-dark-800 dark:to-dark-900 flex items-center justify-center">
                    <BookOpen className="w-32 h-32 text-dark-400 dark:text-dark-600" />
                  </div>
                )}

                {/* Favorite Button - always visible */}
                <div className="absolute top-4 right-4">
                  <FavoriteButton
                    isFavorite={book.is_favorite}
                    onToggle={handleFavoriteToggle}
                    size="lg"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card p-6 space-y-3">
              <Link to={`/books/${id}/edit`}>
                <Button variant="primary" icon={Edit} className="w-full"> Edit Book </Button>
              </Link>

              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => setShowDeleteDialog(true)}
                className="w-full"
              >
                Delete Book
              </Button>
            </div>

            {/* Next Book Preview */}
            {nextBook && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleNextBook}
              >
                <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-2 uppercase tracking-wide">
                  Up Next
                </p>
                <div className="flex items-center gap-3">
                  {nextBook.cover_image ? (
                    <img
                      src={nextBook.cover_image}
                      alt={nextBook.title}
                      className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gradient-to-br from-dark-100 to-dark-200 
                                  dark:from-dark-800 dark:to-dark-900 rounded-lg flex items-center 
                                  justify-center flex-shrink-0">
                      <BookOpen size={20} className="text-dark-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-dark-900 dark:text-dark-50 truncate">
                      {nextBook.title}
                    </p>
                    {nextBook.author && (
                      <p className="text-sm text-dark-500 dark:text-dark-400 italic truncate">
                        by {nextBook.author}
                      </p>
                    )}
                  </div>
                  <ArrowRight size={18} className="text-primary-500 flex-shrink-0" />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Book?"
        message={
          <>
            Are you sure you want to delete <strong>"{book.title}"</strong>?
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
      />
    </div>
  );
};

export default ViewBook;