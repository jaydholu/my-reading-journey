import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileJson, FileSpreadsheet, Info, CheckCircle, XCircle, ArrowLeft, Download, BookOpen, ScrollText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import PageHeader from '../common/PageHeader';
import Button from '../common/Button';
import { toast } from '../common/Toast';
import api from '../../api/axios';
import { MAX_UPLOAD_SIZE } from '../../utils/constants';

const ImportBooks = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('json');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    maxSize: MAX_UPLOAD_SIZE,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        toast.error('Please select a valid JSON or CSV file (max 50MB)');
        return;
      }
      const selectedFile = acceptedFiles[0];
      const ext = selectedFile.name.split('.').pop().toLowerCase();
      setFile(selectedFile);
      setFormat(ext === 'csv' ? 'csv' : 'json');
      setResult(null);
    }
  });

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/data/import?format_type=${format}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);

      // Check if anything was imported
      const data = response.data;
      const totalImported = data.stats
        ? data.stats.imported
        : Object.values(data.sections || {}).reduce((sum, s) => sum + (s.imported || 0), 0);

      if (totalImported > 0) {
        toast.success(`Successfully imported ${totalImported} items!`);
        setTimeout(() => navigate('/'), 5000);
      } else {
        toast.error('No items were imported. Check the details below.');
      }
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Import failed. Please try again.';
      toast.error(errMsg);
      setResult({
        message: 'Import failed',
        stats: {
          total: 0,
          imported: 0,
          skipped_duplicates: 0,
          failed: 1,
          errors: [{ row: 0, error: errMsg }]
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/data/template/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'books_import_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  // Render import results — handles both legacy (stats) and structured (sections) formats
  const renderResults = () => {
    if (!result) return null;

    // Legacy format: { stats: { imported, failed, ... } }
    if (result.stats) {
      return <ResultSection label="Books" icon={BookOpen} stats={result.stats} />;
    }

    // Structured format: { sections: { books: {...}, wishlist: {...} } }
    if (result.sections) {
      return (
        <div className="space-y-4">
          {result.sections.books && (
            <ResultSection label="Books" icon={BookOpen} stats={result.sections.books} />
          )}
          {result.sections.wishlist && (
            <ResultSection label="Wishlist" icon={ScrollText} stats={result.sections.wishlist} />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 
                  dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <PageHeader
          title="Import Data"
          description="Upload your book collection or a previous export to restore data"
          icon={Upload}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Import Data' }
          ]}
        />

        <div className="flex flex-row gap-8 space-around">
          <div className="gap-4 flex-1 flex flex-col">
            {/* Format Selection */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">Choose Format</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormat('json')}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${format === 'json'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                >
                  <FileJson className="text-primary-600 dark:text-primary-400 mb-2" size={28} />
                  <p className="font-semibold text-dark-900 dark:text-dark-50">JSON</p>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                    Books + wishlist from an export file
                  </p>
                </button>

                <button
                  onClick={() => setFormat('csv')}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${format === 'csv'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                >
                  <FileSpreadsheet className="text-primary-600 dark:text-primary-400 mb-2" size={28} />
                  <p className="font-semibold text-dark-900 dark:text-dark-50">CSV</p>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                    Books only — from Excel or Sheets
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Template Download */}
              <div className="card p-5 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">Need a template?</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                        Download our CSV template with sample data and correct column headers
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" icon={Download} onClick={handleDownloadTemplate} size="sm">
                    Template
                  </Button>
                </div>
              </div>

              {/* What gets imported info */}
              <div className="card p-5 space-y-2 text-sm text-dark-600 dark:text-dark-400">
                <p className="font-semibold text-dark-900 dark:text-dark-50">How import works:</p>
                <p>• <strong>JSON files</strong> can contain books, wishlist, or both — the importer auto-detects what's in the file</p>
                <p>• <strong>CSV files</strong> import library books only</p>
                <p>• Duplicates (same title + author) are automatically skipped</p>
                <p>• Profile data from exports is not imported (for security)</p>
              </div>

              {/* Import Results */}
              {renderResults()}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-8">
            {/* File Drop Zone */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">Upload File</h3>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : file
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                    : 'border-dark-300 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-600'
                  }`}
              >
                <input {...getInputProps()} />

                {file ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                    </div>
                    <p className="font-semibold text-dark-900 dark:text-dark-50">{file.name}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                      {(file.size / 1024).toFixed(1)} KB · {format.toUpperCase()}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      Remove file
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-dark-100 dark:bg-dark-800 rounded-full flex items-center justify-center">
                      <Upload className="text-dark-400" size={28} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-dark-900 dark:text-dark-50">
                        {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
                      </p>
                      <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">or click to browse</p>
                    </div>
                    <p className="text-xs text-dark-400 dark:text-dark-500">
                      Supports .json and .csv files up to 50MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-row items-center gap-3 justify-between">
              <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)} className="basis-1/2">
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={Upload}
                onClick={handleImport}
                loading={uploading}
                disabled={!file}
                className="basis-1/2"
              >
                Import Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ─── Result section for a single data type ───────────────────────────────────
const ResultSection = ({ label, icon: Icon, stats }) => {
  const hasErrors = stats.failed > 0;
  const allSuccess = stats.failed === 0 && stats.imported > 0;
  const nothingImported = stats.imported === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-5 ${
        allSuccess
          ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
          : nothingImported
            ? 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
            : 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
          ${allSuccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}
        >
          <Icon className={allSuccess ? 'text-green-600' : 'text-yellow-600'} size={20} />
        </div>

        <div className="flex-1">
          <p className="font-bold text-dark-900 dark:text-dark-50 mb-1">{label}</p>
          <p className="text-sm text-dark-700 dark:text-dark-300">
            Total: {stats.total}
            {' · '}
            <span className="text-green-600 dark:text-green-400 font-medium">
              Imported: {stats.imported}
            </span>
            {stats.skipped_duplicates > 0 && (
              <>
                {' · '}
                <span className="text-yellow-500 dark:text-yellow-300 font-medium">
                  Duplicates skipped: {stats.skipped_duplicates}
                </span>
              </>
            )}
            {stats.failed > 0 && (
              <>
                {' · '}
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Failed: {stats.failed}
                </span>
              </>
            )}
          </p>

          {stats.errors?.length > 0 && (
            <div className="mt-2 max-h-28 overflow-y-auto space-y-1">
              <p className="text-xs font-semibold text-dark-700 dark:text-dark-300">Details:</p>
              {stats.errors.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                  Row {err.row}: {err.error}
                </p>
              ))}
            </div>
          )}

          {allSuccess && (
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-2">
              Redirecting to home in a few seconds...
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ImportBooks;
