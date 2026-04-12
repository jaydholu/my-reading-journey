import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit, Text, DollarSign,
  ExternalLink, ArrowRight, Sparkles,
} from 'lucide-react';
import Hero from '../components/common/Hero';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import { BookCardSkeleton } from '../components/common/Skeleton';
import { toast } from '../components/common/Toast';
import api from '../api/axios';
import { PRIORITIES } from '../utils/constants';


const WishlistForm = ({ formData, setFormData, onSubmit, onCancel, submitLabel }) => {
  const handleChange = useCallback((field) => (e) => {
    const value = field === 'priority' ? parseInt(e.target.value) : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Book Title"
        name="title"
        value={formData.title}
        onChange={handleChange('title')}
        placeholder="Enter book title"
        required
        autoFocus
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Author"
          name="author"
          value={formData.author}
          onChange={handleChange('author')}
          placeholder="Author name"
        />

        <Input
          label="Genre"
          name="genre"
          value={formData.genre}
          onChange={handleChange('genre')}
          placeholder="e.g., Fiction, Mystery"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ISBN (optional)"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange('isbn')}
          placeholder="ISBN-10 or ISBN-13"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={handleChange('priority')}
            className="input-field"
          >
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Price (optional)"
          name="price"
          type="number"
          step="0.01"
          min="0"
          icon={DollarSign}
          value={formData.price}
          onChange={handleChange('price')}
          placeholder="0.00"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
            How will you get this book?
          </label>
          <select
            value={formData.acquisition_type}
            onChange={handleChange('acquisition_type')}
            className="input-field"
          >
            <option value="buy_online">Buy Online</option>
            <option value="already_purchased">Already Purchased</option>
            <option value="borrowed">Borrowed / Will Borrow</option>
          </select>
        </div>
      </div>

      {/* Conditional fields based on acquisition type */}
      {formData.acquisition_type === 'buy_online' && (
        <Input
          label="Where to Buy"
          name="where_to_buy"
          value={formData.where_to_buy}
          onChange={handleChange('where_to_buy')}
          placeholder="amazon.com, flipkart.com, local bookstore, etc."
        />
      )}

      {formData.acquisition_type === 'borrowed' && (
        <Input
          label="Borrowed From"
          name="borrowed_from"
          value={formData.borrowed_from}
          onChange={handleChange('borrowed_from')}
          placeholder="Library, friend's name, sibling, etc."
        />
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={handleChange('notes')}
          rows={2}
          placeholder="Why you want to read this book..."
          className="input-field resize-none"
        />
      </div>

      <div className="flex gap-3 pt-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

const ITEMS_PER_PAGE_KEY = 'wishlist_items_per_page';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [sortBy, setSortBy] = useState('priority_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem(ITEMS_PER_PAGE_KEY);
    return saved ? Number(saved) : 12;
  });
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    priority: 3,
    notes: '',
    price: '',
    acquisition_type: 'buy_online',
    where_to_buy: '',
    borrowed_from: '',
  });

  useEffect(() => {
    loadWishlist(currentPage, itemsPerPage, sortBy);
  }, [sortBy]);

  const loadWishlist = async (page = 1, limit = itemsPerPage, sort = sortBy) => {
    setLoading(true);
    try {
      const response = await api.get('/wishlist', {
        params: { sort, page, limit }
      });
      const data = response.data;
      setWishlist(data.wishlist || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.pages || 1);
      setCurrentPage(data.page || 1);
    } catch (error) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      priority: 3,
      notes: '',
      price: '',
      acquisition_type: 'buy_online',
      where_to_buy: '',
      borrowed_from: '',
    });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/wishlist', {
        ...formData,
        price: formData.price !== '' && formData.price !== null && formData.price !== undefined 
          ? parseFloat(formData.price) 
          : null,
      });
      
      toast.success('Added to wishlist!');
      setShowAddModal(false);
      resetForm();
      // Reload to keep pagination consistent
      loadWishlist(1, itemsPerPage, sortBy);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add item');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.put(`/wishlist/${editingItem.id}`, {
        ...formData,
        price: formData.price !== '' && formData.price !== null && formData.price !== undefined 
          ? parseFloat(formData.price) 
          : null,
      });
      
      setWishlist(prev => prev.map(item => 
        item.id === editingItem.id ? response.data : item
      ));
      toast.success('Wishlist item updated!');
      setShowEditModal(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update item');
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    
    try {
      await api.delete(`/wishlist/${deletingItem.id}`);
      toast.success('Removed from wishlist');
      setShowDeleteDialog(false);
      setDeletingItem(null);
      // Reload — if last item on page, go back a page
      const newTotal = totalItems - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      loadWishlist(targetPage, itemsPerPage, sortBy);
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleMoveToLibrary = async (item) => {
    try {
      await api.post(`/wishlist/${item.id}/move-to-library`);
      toast.success('Book moved to your library!');
      const newTotal = totalItems - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      loadWishlist(targetPage, itemsPerPage, sortBy);
    } catch (error) {
      toast.error('Failed to move book');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      author: item.author || '',
      isbn: item.isbn || '',
      genre: item.genre || '',
      priority: item.priority || 3,
      notes: item.notes || '',
      price: item.price != null ? item.price : '',
      acquisition_type: item.acquisition_type || 'buy_online',
      where_to_buy: item.where_to_buy || '',
      borrowed_from: item.borrowed_from || '',
    });
    setShowEditModal(true);
  };

  const handleCancelAdd = useCallback(() => {
    setShowAddModal(false);
    resetForm();
  }, [resetForm]);

  const handleCancelEdit = useCallback(() => {
    setShowEditModal(false);
    setEditingItem(null);
    resetForm();
  }, [resetForm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadWishlist(page, itemsPerPage, sortBy);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (perPage) => {
    setItemsPerPage(perPage);
    localStorage.setItem(ITEMS_PER_PAGE_KEY, String(perPage));
    setCurrentPage(1);
    loadWishlist(1, perPage, sortBy);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: 'text-dark-400 bg-dark-100 dark:bg-dark-800',
      2: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      3: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      4: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      5: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    };
    return colors[priority] || colors[3];
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      1: 'Low',
      2: 'Medium-Low',
      3: 'Medium',
      4: 'High',
      5: 'Very High',
    };
    return labels[priority] || 'Medium';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 
                  dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      
      {/* Hero Section */}
      <Hero
        title="My Wishlist"
        subtitle="Books you're excited to read next"
        gradient={false}
        className="pb-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-6 py-3 glass-strong rounded-full"
        >
          <Sparkles className="text-primary-500" size={24} />
          <span className="text-2xl font-bold text-dark-900 dark:text-dark-50">
            {totalItems} {totalItems === 1 ? 'Book' : 'Books'}
          </span>
        </motion.div>
      </Hero>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {totalItems != 0
            ? (
              <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              Add to Wishlist
            </Button>
            )
            : ""}
          </div>

          {wishlist.length > 0 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field text-sm py-2 w-full sm:w-auto"
            >
              <option value="priority_desc">Highest Priority</option>
              <option value="priority_asc">Lowest Priority</option>
              <option value="date_desc">Recently Added</option>
              <option value="date_asc">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(Math.min(itemsPerPage, 6))].map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : wishlist.length === 0 && totalItems === 0 ? (
          <EmptyState
            icon={Text}
            title="Your wishlist is empty"
            description="Start adding books you want to read"
            action={
              <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
                Add First Book
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-hover p-6 flex flex-col"
                >
                  {/* Priority Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {getPriorityLabel(item.priority)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 
                                 flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingItem(item);
                          setShowDeleteDialog(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 
                                 flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Card content - grows to fill available space */}
                  <div className="flex-1 space-y-4">
                    {/* Title & Author */}
                    <div>
                      <h3 className="font-bold text-lg text-dark-900 dark:text-dark-50 line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      {item.author && (
                        <p className="text-sm text-dark-600 dark:text-dark-400 italic">
                          by {item.author}
                        </p>
                      )}
                    </div>

                    {/* Genre */}
                    {item.genre && (
                      <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 
                                     text-primary-700 dark:text-primary-300 rounded-full text-xs">
                        {item.genre}
                      </span>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <p className="text-sm text-dark-600 dark:text-dark-400 line-clamp-2">
                        {item.notes}
                      </p>
                    )}

                    {/* Price & Acquisition Info */}
                    <div className="flex items-center justify-between text-sm">
                      {item.price != null && (
                        <span className="text-dark-700 dark:text-dark-300 font-medium">
                          {parseFloat(item.price) === 0 ? 'Free' : `$${parseFloat(item.price).toFixed(2)}`}
                        </span>
                      )}
                      {item.acquisition_type === 'buy_online' && item.where_to_buy && (
                        <a
                          href={item.where_to_buy.startsWith('http') ? item.where_to_buy : `https://${item.where_to_buy}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                        >
                          Buy <ExternalLink size={12} />
                        </a>
                      )}
                      {item.acquisition_type === 'already_purchased' && (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                          ✓ Purchased
                        </span>
                      )}
                      {item.acquisition_type === 'borrowed' && (
                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          Borrowed{item.borrowed_from ? ` from ${item.borrowed_from}` : ''}
                        </span>
                      )}
                      {/* Fallback for old data that only has where_to_buy */}
                      {!item.acquisition_type && item.where_to_buy && (
                        <a
                          href={item.where_to_buy.startsWith('http') ? item.where_to_buy : `https://${item.where_to_buy}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                        >
                          Buy <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Action Button - always sticks to bottom */}
                  <Button
                    variant="primary"
                    icon={ArrowRight}
                    onClick={() => handleMoveToLibrary(item)}
                    className="w-full mt-4"
                    size="sm"
                  >
                    Move to Library
                  </Button>
                </motion.div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemLabel="books"
            />
          </>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCancelAdd}
        title="Add to Wishlist"
        size="md"
      >
        <WishlistForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          onCancel={handleCancelAdd}
          submitLabel="Add to Wishlist"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCancelEdit}
        title="Edit Wishlist Item"
        size="md"
      >
        <WishlistForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          onCancel={handleCancelEdit}
          submitLabel="Save Changes"
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingItem(null);
        }}
        onConfirm={handleDelete}
        title="Remove from Wishlist?"
        message={
          <>
            Are you sure you want to remove <strong>"{deletingItem?.title}"</strong> from your wishlist?
          </>
        }
        confirmText="Remove"
        cancelText="Cancel"
        danger
      />
    </div>
  );
};

export default Wishlist;
