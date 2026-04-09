import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import Hero from '../components/common/Hero';
import BookCard from '../components/books/BookCard';
import EmptyState from '../components/common/EmptyState';
import { BookCardSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import { toast } from '../components/common/Toast';
import { useBooks } from '../hooks/useBooks';

const Favorites = () => {
  const { loading, deleteBook, toggleFavorite, getFavorites } = useBooks();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getFavorites();
      // API returns paginated response: { books: [], total, page, ... }
      setFavorites(data?.books || []);
    } catch (error) {
      toast.error('Failed to load favorites');
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await deleteBook(bookId);
      setFavorites(prev => prev.filter(book => book.id !== bookId));
      toast.success('Book deleted successfully');
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handleFavoriteToggle = async (bookId) => {
    try {
      await toggleFavorite(bookId);
      setFavorites(prev => prev.filter(book => book.id !== bookId));
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-primary-100 
                  dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      
      {/* Hero Section */}
      <Hero
        title="Your Favorites"
        subtitle="Books that hold a special place in your heart"
        gradient={false}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-6 py-3 glass-strong rounded-full"
        >
          <Heart className="text-red-500 fill-red-500" size={24} />
          <span className="text-2xl font-bold text-dark-900 dark:text-dark-50">
            {favorites.length} Favorite{favorites.length !== 1 ? 's' : ''}
          </span>
        </motion.div>
      </Hero>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-dark-600 dark:border-dark-400">
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Start marking books as favorites to see them here"
            action={
              <Link to="/">
                <Button variant="primary" icon={Plus}>
                  Browse Your Library
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
                My Favorites
                <span className="ml-3 text-lg font-normal text-dark-600 dark:text-dark-400">
                  has <span className="font-bold text-dark-700 dark:text-dark-200">{favorites.length}</span> {favorites.length === 1 ? 'book' : 'books'}!
                </span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((book, index) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={index}
                  onDelete={handleDelete}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;