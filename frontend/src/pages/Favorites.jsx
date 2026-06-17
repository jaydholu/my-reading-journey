import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import Hero from '../components/common/Hero';
import BookCard from '../components/books/BookCard';
import EmptyState from '../components/common/EmptyState';
import { BookCardSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import { toast } from '../components/common/Toast';
import api from '../api/axios';

const ITEMS_PER_PAGE_KEY = 'favorites_items_per_page';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem(ITEMS_PER_PAGE_KEY);
    return saved ? Number(saved) : 12;
  });

  useEffect(() => { loadFavorites(1, itemsPerPage); }, []);

  const loadFavorites = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    try {
      const response = await api.get('/books/favorites', { params: { page, limit } });
      const data = response.data;
      setFavorites(data?.books || []);
      setTotalItems(data?.total || 0);
      setTotalPages(data?.pages || 1);
      setCurrentPage(data?.page || 1);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await api.delete(`/books/${bookId}`);
      toast.success('Book deleted successfully');
      const newTotal = totalItems - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
      loadFavorites(currentPage > maxPage ? maxPage : currentPage, itemsPerPage);
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handleFavoriteToggle = async (bookId) => {
    try {
      await api.patch(`/books/${bookId}/favorite`);
      const newTotal = totalItems - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
      loadFavorites(currentPage > maxPage ? maxPage : currentPage, itemsPerPage);
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadFavorites(page, itemsPerPage);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (perPage) => {
    setItemsPerPage(perPage);
    localStorage.setItem(ITEMS_PER_PAGE_KEY, String(perPage));
    setCurrentPage(1);
    loadFavorites(1, perPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <Hero title="Your Favorites" subtitle="Books that hold a special place in your heart" gradient={false}>
        {/* RESPONSIVE FIX: flex-wrap so badge doesn't overflow narrow screens */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="inline-flex flex-wrap items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 glass-strong rounded-full">
          <Heart className="text-red-500 fill-red-500" size={20} />
          <span className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-dark-50">
            {totalItems} Favorite{totalItems !== 1 ? 's' : ''}
          </span>
        </motion.div>
      </Hero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 border-t border-dark-600 dark:border-dark-400">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(Math.min(itemsPerPage, 8))].map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : favorites.length === 0 && totalItems === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Start marking books as favorites to see them here"
            action={
              <Link to="/">
                <Button variant="primary" icon={Plus}>Browse Your Library</Button>
              </Link>
            }
          />
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-dark-50">
                My Favorites
                <span className="ml-2 sm:ml-3 text-sm sm:text-lg font-normal text-dark-600 dark:text-dark-400">
                  has <span className="font-bold text-dark-700 dark:text-dark-200">{totalItems}</span> {totalItems === 1 ? 'book' : 'books'}!
                </span>
              </h2>
            </motion.div>

            {/* RESPONSIVE FIX: proper grid breakpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {favorites.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} onDelete={handleDelete} onFavoriteToggle={handleFavoriteToggle} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage} totalPages={totalPages} totalItems={totalItems}
              itemsPerPage={itemsPerPage} onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange} itemLabel="favorites"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
