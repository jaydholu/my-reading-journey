import { useState, useCallback } from 'react';
import { booksApi } from '../api/books';

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all books
  const fetchBooks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.getBooks(params);
      setBooks(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single book
  const getBook = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.getBook(id);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create book
  const createBook = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.createBook(formData);
      setBooks(prev => {
        if (Array.isArray(prev)) {
          return [data, ...prev];
        } else if (prev?.books) {
          return { ...prev, books: [data, ...prev.books], total: prev.total + 1 };
        }
        return [data];
      });
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update book
  const updateBook = useCallback(async (id, formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.updateBook(id, formData);
      setBooks(prev => {
        if (Array.isArray(prev)) {
          return prev.map(book => book.id === id ? data : book);
        } else if (prev?.books) {
          return {
            ...prev,
            books: prev.books.map(book => book.id === id ? data : book)
          };
        }
        return prev;
      });
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete book
  const deleteBook = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await booksApi.deleteBook(id);
      setBooks(prev => {
        if (!prev) return prev;
        
        if (prev?.books && Array.isArray(prev.books)) {
          return {
            ...prev,
            books: prev.books.filter(book => book.id !== id),
            total: Math.max(0, (prev.total || 0) - 1)
          };
        }
        
        if (Array.isArray(prev)) {
          return prev.filter(book => book.id !== id);
        }
        
        return prev;
      });
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id) => {
    try {
      const data = await booksApi.toggleFavorite(id);
      setBooks(prev => {
        if (Array.isArray(prev)) {
          return prev.map(book => 
            book.id === id ? { ...book, is_favorite: data.is_favorite } : book
          );
        } else if (prev?.books) {
          return {
            ...prev,
            books: prev.books.map(book => 
              book.id === id ? { ...book, is_favorite: data.is_favorite } : book
            )
          };
        }
        return prev;
      });
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  // Get favorites
  const getFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.getFavorites();
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get stats
  const fetchStats = useCallback(async () => {
    setError(null);
    try {
      const data = await booksApi.getStats();
      setStats(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  // Search books
  const searchBooks = useCallback(async (filters) => {
    return fetchBooks(filters);
  }, [fetchBooks]);

  return {
    books,
    stats,
    loading,
    error,
    fetchBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook,
    toggleFavorite,
    getFavorites,
    fetchStats,
    searchBooks,
  };
};

export default useBooks;