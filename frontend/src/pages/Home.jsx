import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Book, BookOpen, Heart, BookCheck, ScrollText, Star, ChartColumn } from 'lucide-react';
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
        await Promise.all([fetchBooks({ sort: 'date_desc' }), fetchStats()]);
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
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => {
          if (value === '' || value === null || value === undefined) return false;
          if (key === 'rating_min' && value === 0) return false;
          if (key === 'rating_max' && value === 5) return false;
          if (key === 'favorite' && value === false) return false;
          return true;
        })
      );
      await fetchBooks({ ...cleanFilters, sort: sortBy });
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

  const bookList = Array.isArray(books) ? books : (books?.books || []);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-dark-50 dark:bg-dark-950">
      <Hero
        title="My Reading Journey"
        subtitle="Track, organize, and celebrate every book you read"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            onFilterToggle={() => setShowFilters(true)}
            placeholder="Search by title, author, or genre..."
            showFilters
          />
        </div>

        {/* Books Grid */}
        <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <div className="accent-rule mb-3" />
              <h2 className="font-serif font-semibold text-3xl tracking-wide sm:text-4xl text-dark-900 dark:text-dark-50">
                My Library
                {bookList.length > 0 && (
                  <span className="ml-2 text-base sm:text-lg font-sans font-normal text-dark-500 dark:text-dark-400">
                    — {bookList.length} {bookList.length === 1 ? 'book' : 'books'}
                  </span>
                )}
              </h2>
            </div>

            {bookList.length > 0 && (
              <select
                className="input-field text-sm py-2 w-full sm:w-auto"
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
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 gap-y-8 pt-2">
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

        {/* Stats heading */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 border-t border-dark-200 dark:border-dark-700 mt-10 sm:mt-12 pt-10 sm:pt-12">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 flex items-center justify-center">
            <ChartColumn className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="font-serif font-semibold text-3xl sm:text-4xl text-dark-900 dark:text-dark-50">Quick Stats</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 mt-8 sm:mt-10"
        >
          <StatsCard title="Total Books" value={stats?.total_books || 0} icon={Book} color="primary" index={0}
            trend={stats?.trends?.total_books?.direction} trendValue={stats?.trends?.total_books?.value} />
          <StatsCard title="Currently Reading" value={stats?.books_reading || 0} icon={BookOpen} color="info" index={1} />
          <StatsCard title="Books Finished" value={stats?.books_finished || 0} icon={BookCheck} color="success" index={2}
            trend={stats?.trends?.books_finished?.direction} trendValue={stats?.trends?.books_finished?.value} />
          <StatsCard title="Total Pages" value={stats?.total_pages || 0} icon={Book} color="primary" index={3}
            trend={stats?.trends?.total_pages?.direction} trendValue={stats?.trends?.total_pages?.value} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-10 sm:mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="card-hover p-5 sm:p-6 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base text-dark-500 dark:text-dark-400 mb-2">Average Rating</p>
                <h3 className="text-3xl sm:text-4xl font-serif font-semibold text-primary-600 dark:text-primary-400">
                  {stats?.average_rating > 0 ? formatRating(stats.average_rating) : '—'}
                </h3>
                {stats?.books_rated_count > 0 && (
                  <p className="mt-1 text-xs sm:text-sm text-dark-500 dark:text-dark-400">
                    across {stats.books_rated_count} rated {stats.books_rated_count === 1 ? 'book' : 'books'}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 flex items-center justify-center flex-shrink-0">
                <Star className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
            </div>
          </motion.div>

          <Link to="/favorites" className="block">
            <StatsCard title="My Favorites" value={stats?.favorite_books || 0} icon={Heart} color="favorite" index={5} />
          </Link>

          <Link to="/wishlist" className="block">
            <StatsCard title="Wishlist" value={stats?.wishlist_count || 0} icon={ScrollText} color="warning" index={6}
              trend={stats?.trends?.wishlist?.direction} trendValue={stats?.trends?.wishlist?.value} />
          </Link>
        </motion.div>
      </div>

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
