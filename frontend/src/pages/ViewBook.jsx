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
    if (nextBook) navigate(`/books/${nextBook.id}`);
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading book details..." />;
  if (!book) return null;

  const InfoItem = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-3 border-b border-dark-100 dark:border-dark-700">
        <Icon className="text-primary-500 dark:text-primary-400 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-dark-400 dark:text-dark-500 mb-0.5 uppercase tracking-wide font-medium">{label}</div>
          <div className="font-medium text-sm sm:text-base text-dark-900 dark:text-dark-50 break-words">{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">

        {/* Back / Next nav */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-row justify-between gap-3 mb-6 mt-14 sm:mt-12"
        >
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)} className="flex-1 sm:flex-none bg-dark-100 dark:bg-dark-800">
            Back
          </Button>
          <Button
            variant="primary"
            icon={ArrowRight}
            onClick={handleNextBook}
            disabled={!nextBook || loadingNext}
            loading={loadingNext}
            className="flex-1 sm:flex-none"
          >
            {loadingNext ? 'Loading...' : nextBook ? 'Next' : 'No More'}
          </Button>
        </motion.div>

        {/* 3-column layout: details left, cover right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Left — Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1"
          >
            {/* Title & Meta */}
            <div className="card p-5 sm:p-8">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  {book.genre && (
                    <span className="inline-block px-3 py-1 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold tracking-wide uppercase mb-3">
                      {book.genre}
                    </span>
                  )}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-dark-900 dark:text-dark-50 leading-tight">
                    {book.title}
                  </h1>
                </div>

                {book.author && (
                  <p className="text-base sm:text-xl text-dark-500 dark:text-dark-400 flex items-center gap-2">
                    <User size={16} className="text-dark-400 dark:text-dark-500" />
                    <span className="italic">by {book.author}</span>
                  </p>
                )}

                {book.rating > 0 && (
                  <div className="flex items-center gap-3 sm:gap-4 pt-1">
                    <StarRating rating={book.rating} size="md" readonly />
                    <span className="text-xl sm:text-2xl font-serif font-semibold text-dark-900 dark:text-dark-50">
                      {formatRating(book.rating)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reading Info */}
            <div className="card p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-serif font-semibold text-dark-900 dark:text-dark-50 mb-1">
                Reading Timeline
              </h2>
              <div className="accent-rule mt-2 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                <InfoItem icon={CalendarDays} label="Reading Started"
                  value={book.reading_started ? formatDate(book.reading_started, 'MMMM dd, yyyy') : null} />
                <InfoItem icon={CalendarDays} label="Reading Finished"
                  value={book.reading_finished ? formatDate(book.reading_finished, 'MMMM dd, yyyy') : 'Currently Reading'} />
              </div>
            </div>

            {/* Book Details */}
            <div className="card p-5 sm:p-8">
              <h2 className="text-lg sm:text-xl font-serif font-semibold text-dark-900 dark:text-dark-50 mb-1">
                Book Details
              </h2>
              <div className="accent-rule mt-2 mb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                <InfoItem icon={Hash} label="ISBN" value={book.isbn} />
                <InfoItem icon={CalendarDays} label="Publication Year" value={book.publication_year} />
                <InfoItem icon={Building} label="Publisher" value={book.publisher} />
                <InfoItem icon={Globe} label="Language" value={book.language} />
                <InfoItem icon={BookOpen} label="Page Count" value={book.page_count ? `${book.page_count} pages` : null} />
                <InfoItem icon={Package} label="Format" value={book.format ? book.format.charAt(0).toUpperCase() + book.format.slice(1) : null} />
              </div>
            </div>

            {/* Description / Review */}
            {book.description && (
              <div className="card p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <NotebookText size={22} className="text-primary-600 dark:text-primary-400" />
                  <h2 className="text-lg sm:text-xl font-serif font-semibold text-dark-900 dark:text-dark-50">
                    Your Review
                  </h2>
                </div>
                <p className="text-dark-700 dark:text-dark-300 whitespace-pre-wrap text-sm sm:text-base leading-relaxed border-l-2 border-primary-300 dark:border-primary-700 pl-4">
                  {book.description}
                </p>
              </div>
            )}
          </motion.div>

          {/* Right — Cover & Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3 sm:space-y-4 order-1 lg:order-2"
          >
            {/* Cover Image */}
            <div className="card p-0 overflow-hidden">
              <div className="relative bg-dark-100 dark:bg-dark-800">
                {book.cover_image ? (
                  <img
                    src={book.cover_image}
                    alt={`${book.title} cover`}
                    className="w-full object-contain"
                    style={{ maxHeight: '420px', height: 'auto' }}
                  />
                ) : (
                  <div className="w-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center"
                    style={{ minHeight: '280px' }}>
                    <BookOpen className="w-20 h-20 sm:w-28 sm:h-28 text-dark-300 dark:text-dark-600" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <FavoriteButton isFavorite={book.is_favorite} onToggle={handleFavoriteToggle} size="lg" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card p-4 sm:p-5 space-y-2.5">
              <Link to={`/books/${id}/edit`}>
                <Button variant="primary" icon={Edit} className="w-full">Edit Book</Button>
              </Link>
              <Button variant="danger" icon={Trash2} onClick={() => setShowDeleteDialog(true)} className="w-full">
                Delete Book
              </Button>
            </div>

            {/* Next Book Preview */}
            {nextBook && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-hover p-3 sm:p-4 cursor-pointer"
                onClick={handleNextBook}
              >
                <p className="eyebrow mb-2">Up Next</p>
                <div className="flex items-center gap-3">
                  {nextBook.cover_image ? (
                    <img src={nextBook.cover_image} alt={nextBook.title} className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-14 sm:w-12 sm:h-16 bg-dark-100 dark:bg-dark-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} className="text-dark-400 dark:text-dark-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-semibold text-dark-900 dark:text-dark-50 truncate text-sm sm:text-base">{nextBook.title}</p>
                    {nextBook.author && (
                      <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 italic truncate">by {nextBook.author}</p>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-primary-500 flex-shrink-0" />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

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
    </div>
  );
};

export default ViewBook;
