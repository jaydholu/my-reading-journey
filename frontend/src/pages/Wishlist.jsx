import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Text, DollarSign, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
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
      <Input label="Book Title" name="title" value={formData.title} onChange={handleChange('title')} placeholder="Enter book title" required autoFocus />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Author" name="author" value={formData.author} onChange={handleChange('author')} placeholder="Author name" />
        <Input label="Genre" name="genre" value={formData.genre} onChange={handleChange('genre')} placeholder="e.g., Fiction, Mystery" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="ISBN (optional)" name="isbn" value={formData.isbn} onChange={handleChange('isbn')} placeholder="ISBN-10 or ISBN-13" />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Priority</label>
          <select value={formData.priority} onChange={handleChange('priority')} className="input-field">
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Price (optional)" name="price" type="number" step="0.01" min="0" icon={DollarSign} value={formData.price} onChange={handleChange('price')} placeholder="0.00" />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">How will you get this book?</label>
          <select value={formData.acquisition_type} onChange={handleChange('acquisition_type')} className="input-field">
            <option value="buy_online">Buy Online</option>
            <option value="already_purchased">Already Purchased</option>
            <option value="borrowed">Borrowed / Will Borrow</option>
          </select>
        </div>
      </div>
      {formData.acquisition_type === 'buy_online' && (
        <Input label="Where to Buy" name="where_to_buy" value={formData.where_to_buy} onChange={handleChange('where_to_buy')} placeholder="amazon.com, flipkart.com, local bookstore…" />
      )}
      {formData.acquisition_type === 'borrowed' && (
        <Input label="Borrowed From" name="borrowed_from" value={formData.borrowed_from} onChange={handleChange('borrowed_from')} placeholder="Library, friend's name…" />
      )}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Notes</label>
        <textarea value={formData.notes} onChange={handleChange('notes')} rows={2} placeholder="Why you want to read this book..." className="input-field resize-none" />
      </div>
      <div className="flex gap-3 pt-3">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" variant="primary" className="flex-1">{submitLabel}</Button>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem(ITEMS_PER_PAGE_KEY);
    return saved ? Number(saved) : 12;
  });

  const emptyForm = {
    title: '', author: '', isbn: '', genre: '', priority: 3,
    notes: '', price: '', acquisition_type: 'buy_online', where_to_buy: '', borrowed_from: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { loadWishlist(currentPage, itemsPerPage, sortBy); }, [sortBy]);

  const loadWishlist = async (page = 1, limit = itemsPerPage, sort = sortBy) => {
    setLoading(true);
    try {
      const response = await api.get('/wishlist', { params: { sort, page, limit } });
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

  const resetForm = useCallback(() => setFormData(emptyForm), []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wishlist', {
        ...formData,
        price: formData.price !== '' && formData.price != null ? parseFloat(formData.price) : null,
      });
      toast.success('Added to wishlist!');
      setShowAddModal(false);
      resetForm();
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
        price: formData.price !== '' && formData.price != null ? parseFloat(formData.price) : null,
      });
      setWishlist(prev => prev.map(item => item.id === editingItem.id ? response.data : item));
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
      const newTotal = totalItems - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / itemsPerPage));
      loadWishlist(currentPage > maxPage ? maxPage : currentPage, itemsPerPage, sortBy);
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
      loadWishlist(currentPage > maxPage ? maxPage : currentPage, itemsPerPage, sortBy);
    } catch (error) {
      toast.error('Failed to move book');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '', author: item.author || '', isbn: item.isbn || '',
      genre: item.genre || '', priority: item.priority || 3, notes: item.notes || '',
      price: item.price != null ? item.price : '', acquisition_type: item.acquisition_type || 'buy_online',
      where_to_buy: item.where_to_buy || '', borrowed_from: item.borrowed_from || '',
    });
    setShowEditModal(true);
  };

  const handleCancelAdd = useCallback(() => { setShowAddModal(false); resetForm(); }, [resetForm]);
  const handleCancelEdit = useCallback(() => { setShowEditModal(false); setEditingItem(null); resetForm(); }, [resetForm]);

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

  const getPriorityStyle = (p) => ({
    1: 'text-dark-400 dark:text-dark-500 border-dark-200 dark:border-dark-700',
    2: 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    3: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    4: 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    5: 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  }[p] || 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800');

  const getPriorityLabel = (p) => ({ 1: 'Low', 2: 'Medium-Low', 3: 'Medium', 4: 'High', 5: 'Very High' }[p] || 'Medium');

  return (
    // REDESIGN: plain cream background
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      <Hero title="My Wishlist" subtitle="Books you're excited to read next" gradient={false}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-700 rounded-2xl shadow-sm">
          <Sparkles className="text-primary-500 dark:text-primary-400" size={18} />
          <span className="font-serif font-semibold text-xl sm:text-2xl text-dark-900 dark:text-dark-50">
            {totalItems} {totalItems === 1 ? 'Book' : 'Books'}
          </span>
        </motion.div>
      </Hero>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 border-t border-dark-200 dark:border-dark-700">

        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            {totalItems > 0 && (
              <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
                Add to Wishlist
              </Button>
            )}
          </div>
          {wishlist.length > 0 && (
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field text-sm py-2 w-full sm:w-auto">
              <option value="priority_desc">Highest Priority</option>
              <option value="priority_asc">Lowest Priority</option>
              <option value="date_desc">Recently Added</option>
              <option value="date_asc">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(Math.min(itemsPerPage, 6))].map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : wishlist.length === 0 && totalItems === 0 ? (
          <EmptyState icon={Text} title="Your wishlist is empty" description="Start adding books you want to read"
            action={<Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>Add First Book</Button>} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {wishlist.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }} className="card-hover p-4 sm:p-6 flex flex-col">

                  {/* Card header: priority pill + action buttons */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold tracking-wide ${getPriorityStyle(item.priority)}`}>
                      {getPriorityLabel(item.priority)}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(item)}
                        className="w-8 h-8 rounded-lg border border-dark-200 dark:border-dark-700 text-dark-400 dark:text-dark-500 flex items-center justify-center hover:border-primary-300 hover:text-primary-600 dark:hover:border-primary-700 dark:hover:text-primary-400 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => { setDeletingItem(item); setShowDeleteDialog(true); }}
                        className="w-8 h-8 rounded-lg border border-dark-200 dark:border-dark-700 text-dark-400 dark:text-dark-500 flex items-center justify-center hover:border-red-300 hover:text-red-600 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-serif font-semibold text-base sm:text-lg text-dark-900 dark:text-dark-50 line-clamp-2 mb-1">{item.title}</h3>
                      {item.author && <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 italic">by {item.author}</p>}
                    </div>
                    {item.genre && (
                      <span className="inline-block px-2.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium">
                        {item.genre}
                      </span>
                    )}
                    {item.notes && (
                      <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 line-clamp-2 border-l-2 border-dark-200 dark:border-dark-700 pl-3 italic">
                        {item.notes}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-1">
                      {item.price != null && (
                        <span className="text-dark-700 dark:text-dark-300 font-medium">
                          {parseFloat(item.price) === 0 ? 'Free' : `$${parseFloat(item.price).toFixed(2)}`}
                        </span>
                      )}
                      {item.acquisition_type === 'buy_online' && item.where_to_buy && (
                        <a href={item.where_to_buy.startsWith('http') ? item.where_to_buy : `https://${item.where_to_buy}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                          Buy <ExternalLink size={11} />
                        </a>
                      )}
                      {item.acquisition_type === 'already_purchased' && (
                        <span className="text-sage-600 dark:text-sage-400 font-medium">✓ Purchased</span>
                      )}
                      {item.acquisition_type === 'borrowed' && (
                        <span className="text-blue-600 dark:text-blue-400">
                          Borrowed{item.borrowed_from ? ` from ${item.borrowed_from}` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button variant="primary" icon={ArrowRight} onClick={() => handleMoveToLibrary(item)} className="w-full mt-4" size="sm">
                    Move to Library
                  </Button>
                </motion.div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage} totalPages={totalPages} totalItems={totalItems}
              itemsPerPage={itemsPerPage} onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange} itemLabel="books"
            />
          </>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={handleCancelAdd} title="Add to Wishlist" size="md">
        <WishlistForm formData={formData} setFormData={setFormData} onSubmit={handleAdd} onCancel={handleCancelAdd} submitLabel="Add to Wishlist" />
      </Modal>

      <Modal isOpen={showEditModal} onClose={handleCancelEdit} title="Edit Wishlist Item" size="md">
        <WishlistForm formData={formData} setFormData={setFormData} onSubmit={handleEdit} onCancel={handleCancelEdit} submitLabel="Save Changes" />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeletingItem(null); }}
        onConfirm={handleDelete}
        title="Remove from Wishlist?"
        message={<>Are you sure you want to remove <strong>"{deletingItem?.title}"</strong> from your wishlist?</>}
        confirmText="Remove" cancelText="Cancel" danger
      />
    </div>
  );
};

export default Wishlist;
