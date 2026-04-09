import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Book, BookOpen, Heart, BookCheck, ScrollText, Star } from 'lucide-react';
import Hero from '../components/common/Hero';
import StatsCard from '../components/common/StatsCard';
import BookCard from '../components/books/BookCard';
import SearchBar from '../components/common/SearchBar';
import BookFilters from '../components/books/BookFilters';
import EmptyState from '../components/common/EmptyState';
import { BookCardSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import { toast } from '../components/common/Toast';
import { useBooks } from '../hooks/useBooks';
import { formatRating } from '../utils/formatters';

const Home = () => {
  const { books, stats, loading, fetchBooks, deleteBook, toggleFavorite, fetchStats } = useBooks();
  const [showFilters, setShowFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchBooks({ sort: 'date_desc' }),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadInitialData();
  }, []);

  const handleSearch = async (query) => {
    try {
      await fetchBooks({ ...currentFilters, search: query, sort: sortBy });
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleFilterApply = async (filters) => {
    setCurrentFilters(filters);
    try {
      await fetchBooks({ ...filters, sort: sortBy });
    } catch (error) {
      toast.error('Failed to apply filters');
    }
  };

  const handleSortChange = async (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    try {
      await fetchBooks({ ...currentFilters, sort: newSort });
    } catch (error) {
      toast.error('Failed to sort books');
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await deleteBook(bookId);
      toast.success('Book deleted successfully');
      await fetchStats();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handleFavoriteToggle = async (bookId) => {
    try {
      await toggleFavorite(bookId);
      await fetchStats();
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  // Extract books array from paginated response
  const bookList = Array.isArray(books) ? books : (books?.books || []);

  return (
    <div className="min-h-screen pt-4 pb-12 bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      {/* Hero Section */}
      <Hero
        title="My Reading Journey"
        subtitle="Track, organize, and celebrate every book you read"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Row 1: Reading Progress Stats (4 cards) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6"
        >
          <StatsCard
            title="Total Books"
            value={stats?.total_books || 0}
            icon={Book}
            color="primary"
            index={0}
          />
          <StatsCard
            title="Currently Reading"
            value={stats?.books_reading || 0}
            icon={BookOpen}
            color="info"
            index={1}
          />
          <StatsCard
            title="Books Finished"
            value={stats?.books_finished || 0}
            icon={BookCheck}
            color="success"
            index={2}
          />
          <StatsCard
            title="Total Pages"
            value={stats?.total_pages || 0}
            icon={Book}
            color="primary"
            index={3}
          />
        </motion.div>

        {/* Row 2: Highlights (3 cards — Favorites, Average Rating, Wishlist) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12"
        >
          {/* Average Rating — custom card since it's not a simple integer */}
          <Link to="/favorites" className="block">
            <StatsCard
              title="My Favorites"
              value={stats?.favorite_books || 0}
              icon={Heart}
              color="favorite"
              index={5}
            />
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="card p-6 hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-xl text-dark-600 dark:text-dark-400 mb-2">
                  Average Rating
                </p>
                <h3 className="text-4xl font-bold text-gradient">
                  {stats?.average_rating > 0 ? formatRating(stats.average_rating) : '—'}
                </h3>
                {stats?.books_rated_count > 0 && (
                  <p className="mt-1 text-sm text-dark-500 dark:text-dark-400">
                    {stats.books_rated_count} rated {stats.books_rated_count === 1 ? 'book' : 'books'}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Star className="text-white" size={24} />
              </div>
            </div>
          </motion.div>

          <Link to="/wishlist" className="block">
            <StatsCard
              title="Wishlist"
              value={stats?.wishlist_count || 0}
              icon={ScrollText}
              color="warning"
              index={6}
            />
          </Link>
        </motion.div>

        {/* Search & Filters */}
        <div className="mt-8 mb-8">
          <SearchBar
            onSearch={handleSearch}
            onFilterToggle={() => setShowFilters(true)}
            placeholder="Search by title, author, or genre..."
            showFilters
          />
        </div>

        {/* Books Grid */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-4xl text-primary-500">
              My Library
              {bookList.length > 0 && (
                <span className="ml-3 text-lg font-normal text-dark-600 dark:text-dark-400">
                  has <span className="font-bold text-dark-700 dark:text-dark-200">{bookList.length}</span> {bookList.length === 1 ? 'book' : 'books'}!
                </span>
              )}
            </h2>

            {bookList.length > 0 && (
              <div className="flex gap-2">
                <select
                  className="input-field text-sm py-2"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="date_desc">Recently Added</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="author_asc">Author (A-Z)</option>
                  <option value="author_desc">Author (Z-A)</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <BookCardSkeleton key={i} />
              ))}
            </div>
          ) : bookList.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No books yet"
              description="Start building your library by adding your first book"
              action={
                <Link to="/add-book">
                  <Button variant="primary" icon={Plus}>
                    Add Your First Book
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10 pt-2">
              {bookList.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={index}
                  onDelete={handleDelete}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <BookFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
        initialFilters={currentFilters}
      />
    </div>
  );
};

export default Home;
