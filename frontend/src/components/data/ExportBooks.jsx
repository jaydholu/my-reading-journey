import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileJson, FileSpreadsheet, Heart, ArrowLeft } from 'lucide-react';
import PageHeader from '../common/PageHeader';
import Button from '../common/Button';
import { toast } from '../common/Toast';
import api from '../../api/axios';

const ExportBooks = () => {
  const navigate = useNavigate();
  const [format, setFormat] = useState('json');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get(
        `/data/export/${format}?include_favorites_only=${favoritesOnly}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `books_backup_export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Books exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      const msg = error.response?.data?.detail || 'Export failed. You may have no books to export.';
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-10">
        <PageHeader
          title="Export Books"
          description="Download your entire book collection as a file"
          icon={Download}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Export Books' }
          ]}
        />

        <div className="flex flex-row gap-6">
          <div className="flex flex-col gap-4 flex-1">
            {/* Format Selection */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">Export Format</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormat('json')}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${format === 'json'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                >
                  <FileJson className="text-primary-600 dark:text-primary-400 mb-3" size={32} />
                  <p className="font-bold text-dark-900 dark:text-dark-50">JSON</p>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                    All fields including cover image URLs. Best for re-importing.
                  </p>
                </button>

                <button
                  onClick={() => setFormat('csv')}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${format === 'csv'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                >
                  <FileSpreadsheet className="text-primary-600 dark:text-primary-400 mb-3" size={32} />
                  <p className="font-bold text-dark-900 dark:text-dark-50">CSV</p>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                    Compatible with Excel & Google Sheets.
                  </p>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">Options</h3>
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${favoritesOnly
                ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                : 'border-dark-200 dark:border-dark-700 hover:border-red-300 dark:hover:border-red-700'
                }`}>
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="w-5 h-5 text-red-500 rounded focus:ring-red-400"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Heart className={`${favoritesOnly ? 'text-red-500 fill-red-500' : 'text-dark-400'} transition-colors`} size={20} />
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-dark-50">Favorites only</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                      Only export books marked as favorites
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            {/* Info */}
            <div className="card p-5 space-y-2 text-sm text-dark-600 dark:text-dark-400">
              <p className="font-semibold text-dark-900 dark:text-dark-50">Export notes:</p>
              <p>• JSON format preserves cover image URLs and all metadata</p>
              <p>• CSV format is Excel-compatible (UTF-8 BOM encoded)</p>
              <p>• All dates are exported in ISO 8601 format</p>
              <p>• You can re-import JSON exports back into the app</p>
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-row gap-4 ">
              <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)} className="basis-1/2">
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={Download}
                onClick={handleExport}
                loading={exporting}
                className="basis-1/2"
              >
                Export {format.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportBooks;