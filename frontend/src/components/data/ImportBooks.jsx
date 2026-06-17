import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileJson, FileSpreadsheet, Info, CheckCircle, ArrowLeft, Download, BookOpen, ScrollText } from 'lucide-react';
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
    if (!file) { toast.error('Please select a file first'); return; }
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/data/import?format_type=${format}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
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
      setResult({ message: 'Import failed', stats: { total: 0, imported: 0, skipped_duplicates: 0, failed: 1, errors: [{ row: 0, error: errMsg }] } });
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

  const renderResults = () => {
    if (!result) return null;
    if (result.stats) return <ResultSection label="Books" icon={BookOpen} stats={result.stats} />;
    if (result.sections) return (
      <div className="space-y-4">
        {result.sections.books && <ResultSection label="Books" icon={BookOpen} stats={result.sections.books} />}
        {result.sections.wishlist && <ResultSection label="Wishlist" icon={ScrollText} stats={result.sections.wishlist} />}
      </div>
    );
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">

        <PageHeader
          title="Import Data"
          description="Upload your book collection or a previous export to restore data"
          icon={Upload}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Import Data' }]}
        />

        {/* RESPONSIVE FIX: stack on mobile, side-by-side on lg */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Left column */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Format Selection */}
            <div className="card p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">Choose Format</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { fmt: 'json', Icon: FileJson, label: 'JSON', desc: 'Books + wishlist from an export file' },
                  { fmt: 'csv', Icon: FileSpreadsheet, label: 'CSV', desc: 'Books only — from Excel or Sheets' },
                ].map(({ fmt, Icon, label, desc }) => (
                  <button key={fmt} onClick={() => setFormat(fmt)}
                    className={`p-4 sm:p-5 rounded-xl border-2 transition-all text-left ${format === fmt
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'}`}
                  >
                    <Icon className="text-primary-600 dark:text-primary-400 mb-2" size={24} />
                    <p className="font-semibold text-dark-900 dark:text-dark-50 text-sm sm:text-base">{label}</p>
                    <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 mt-1 hidden sm:block">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Download */}
            <div className="card p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">Need a template?</p>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                      Download our CSV template with sample data and correct column headers
                    </p>
                  </div>
                </div>
                <Button variant="secondary" icon={Download} onClick={handleDownloadTemplate} size="sm" className="w-full sm:w-auto flex-shrink-0">
                  Template
                </Button>
              </div>
            </div>

            {/* How import works */}
            <div className="card p-4 sm:p-5 space-y-2 text-xs sm:text-sm text-dark-600 dark:text-dark-400">
              <p className="font-semibold text-dark-900 dark:text-dark-50 text-sm sm:text-base">How import works:</p>
              <p>• <strong>JSON files</strong> can contain books, wishlist, or both — the importer auto-detects</p>
              <p>• <strong>CSV files</strong> import library books only</p>
              <p>• Duplicates (same title + author) are automatically skipped</p>
              <p>• Profile data from exports is not imported (for security)</p>
            </div>

            {/* Results */}
            {renderResults()}
          </div>

          {/* Right column */}
          <div className="flex-1 lg:max-w-md flex flex-col gap-4 sm:gap-6">

            {/* Drop Zone */}
            <div className="card p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-dark-900 dark:text-dark-50 mb-4">Upload File</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : file ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                    : 'border-dark-300 dark:border-dark-700 hover:border-primary-400 dark:hover:border-primary-600'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={28} />
                    </div>
                    <p className="font-semibold text-dark-900 dark:text-dark-50 text-sm sm:text-base break-all">{file.name}</p>
                    <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400">
                      {(file.size / 1024).toFixed(1)} KB · {format.toUpperCase()}
                    </p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                      className="text-xs sm:text-sm text-red-500 hover:text-red-600 transition-colors">
                      Remove file
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-dark-100 dark:bg-dark-800 rounded-full flex items-center justify-center">
                      <Upload className="text-dark-400" size={24} />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-medium text-dark-900 dark:text-dark-50">
                        {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
                      </p>
                      <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 mt-1">or click to browse</p>
                    </div>
                    <p className="text-xs text-dark-400 dark:text-dark-500">Supports .json and .csv files up to 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" icon={Upload} onClick={handleImport} loading={uploading} disabled={!file} className="flex-1">
                Import Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultSection = ({ label, icon: Icon, stats }) => {
  const allSuccess = stats.failed === 0 && stats.imported > 0;
  const nothingImported = stats.imported === 0;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`card p-4 sm:p-5 ${allSuccess ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
        : nothingImported ? 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
        : 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${allSuccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
          <Icon className={allSuccess ? 'text-green-600' : 'text-yellow-600'} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-dark-900 dark:text-dark-50 mb-1 text-sm sm:text-base">{label}</p>
          <p className="text-xs sm:text-sm text-dark-700 dark:text-dark-300 flex flex-wrap gap-x-2">
            <span>Total: {stats.total}</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Imported: {stats.imported}</span>
            {stats.skipped_duplicates > 0 && <span className="text-yellow-500 font-medium">Skipped: {stats.skipped_duplicates}</span>}
            {stats.failed > 0 && <span className="text-red-600 font-medium">Failed: {stats.failed}</span>}
          </p>
          {stats.errors?.length > 0 && (
            <div className="mt-2 max-h-28 overflow-y-auto space-y-1">
              {stats.errors.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">Row {err.row}: {err.error}</p>
              ))}
            </div>
          )}
          {allSuccess && <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 mt-2">Redirecting to home in a few seconds...</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default ImportBooks;
