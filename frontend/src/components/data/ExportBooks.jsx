import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileJson, Heart, ArrowLeft, BookOpen, ScrollText, User } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Button from '../common/Button';
import { toast } from '../common/Toast';
import api from '../../api/axios';

const EXPORT_SECTIONS = [
  {
    id: 'profile',
    label: 'Profile Info',
    description: 'Name, email, reading goal, preferences',
    icon: User,
    color: 'blue',
    param: 'include_profile',
  },
  {
    id: 'books',
    label: 'Library Books',
    description: 'All books in your reading library',
    icon: BookOpen,
    color: 'primary',
    param: 'include_books',
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    description: 'Books you want to read next',
    icon: ScrollText,
    color: 'orange',
    param: 'include_wishlist',
  },
];

const ExportBooks = () => {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  // Checkbox state
  const [selected, setSelected] = useState({
    profile: false,
    books: true,
    wishlist: true,
  });
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const anySelected = Object.values(selected).some(Boolean);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // If books is unchecked, also uncheck favorites-only
      if (id === 'books' && !next.books) setFavoritesOnly(false);
      return next;
    });
  };

  const handleExport = async () => {
    if (!anySelected) {
      toast.error('Select at least one data category');
      return;
    }

    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set('include_profile', selected.profile);
      params.set('include_books', selected.books);
      params.set('include_favorites_only', selected.books && favoritesOnly);
      params.set('include_wishlist', selected.wishlist);

      const response = await api.get(`/data/export/selective?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Build a meaningful filename
      const parts = [];
      if (selected.profile) parts.push('profile');
      if (selected.books) parts.push(favoritesOnly ? 'favorites' : 'books');
      if (selected.wishlist) parts.push('wishlist');
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `reading_journey_${parts.join('_')}_${dateStr}.json`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      const msg = error.response?.data?.detail || 'Export failed. You may have no data to export.';
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-10">
        <PageHeader
          title="Export Data"
          description="Choose what to include in your export"
          icon={Download}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Export Data' },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: checkboxes */}
          <div className="flex-1 flex flex-col gap-4">

            <div className="card p-6">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">
                What to Export
              </h3>

              <div className="space-y-3">
                {EXPORT_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isChecked = selected[section.id];
                  return (
                    <label
                      key={section.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                          : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(section.id)}
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-400"
                      />
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                        ${isChecked
                          ? 'bg-primary-100 dark:bg-primary-900/30'
                          : 'bg-dark-100 dark:bg-dark-800'
                        } transition-colors`}
                      >
                        <Icon
                          className={isChecked ? 'text-primary-600 dark:text-primary-400' : 'text-dark-400'}
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-dark-900 dark:text-dark-50">{section.label}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{section.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sub-option: favorites only (only if books is checked) */}
            {selected.books && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">Book Options</h3>
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    favoritesOnly
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                      : 'border-dark-200 dark:border-dark-700 hover:border-red-300 dark:hover:border-red-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={favoritesOnly}
                    onChange={(e) => setFavoritesOnly(e.target.checked)}
                    className="w-5 h-5 text-red-500 rounded focus:ring-red-400"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <Heart
                      className={`${favoritesOnly ? 'text-red-500 fill-red-500' : 'text-dark-400'} transition-colors`}
                      size={20}
                    />
                    <div>
                      <p className="font-semibold text-dark-900 dark:text-dark-50">Favorites only</p>
                      <p className="text-sm text-dark-500 dark:text-dark-400">
                        Only export books you've marked as favorites
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Right column: info + actions */}
          <div className="lg:w-80 flex flex-col justify-between gap-6">
            <div className="card p-5 space-y-3 text-sm text-dark-600 dark:text-dark-400">
              <div className="flex items-center gap-2 mb-1">
                <FileJson className="text-primary-500" size={20} />
                <p className="font-semibold text-dark-900 dark:text-dark-50">Export Info</p>
              </div>
              <p>• Exports as a single JSON file with clearly labeled sections</p>
              <p>• You can re-import this file to restore your data</p>
              <p>• All dates are in ISO 8601 format</p>
              <p>• Cover image URLs are included for books</p>
              <p>• Wishlist includes priority, acquisition info, and notes</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                icon={Download}
                onClick={handleExport}
                loading={exporting}
                disabled={!anySelected}
                size="lg"
                className="w-full"
              >
                Export Selected Data
              </Button>
              <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)} className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportBooks;
