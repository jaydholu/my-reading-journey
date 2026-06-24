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
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">

        <PageHeader
          title="Import Data"
          description="Upload your book collection or a previous export to restore data"
          icon={Upload}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Import Data' }]}
        />

        {/* Two-column layout: info left, uploader right */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Left column */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Format Selection */}
            <div className="card p-5 sm:p-6">
              <h3 className="font-serif font-semibold text-base sm:text-lg text-dark-900 dark:text-dark-50 mb-1">Choose Format</h3>
              <div className="accent-rule mb-4" />
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { fmt: 'json', Icon: FileJson, label: 'JSON', desc: 'Books + wishlist from an export file' },
                  { fmt: 'csv', Icon: FileSpreadsheet, label: 'CSV', desc: 'Books only — from Excel or Sheets' },
                ].map(({ fmt, Icon, label, desc }) => (
                  // REDESIGN: selected format = solid primary-50 bg + primary border; not border-2 everywhere
                  <button key={fmt} onClick={() => setFormat(fmt)}
                    className={`p-4 sm:p-5 rounded-xl border transition-all text-left ${
                      format === fmt
                        ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <Icon className={`mb-2 ${format === fmt ? 'text-primary-600 dark:text-primary-400' : 'text-dark-400 dark:text-dark-500'}`} size={22} />
                    <p className="font-semibold text-dark-900 dark:text-dark-50 text-sm sm:text-base">{label}</p>
                    <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 mt-1 hidden sm:block">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Download */}
            <div className="card p-4 sm:p-5 bg-dark-50 dark:bg-dark-900">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Info className="text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5" size={17} />
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-dark-50 text-sm sm:text-base">Need a template?</p>
                    <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 mt-0.5">
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
            <div className="card p-4 sm:p-5">
              <p className="font-serif font-semibold text-dark-900 dark:text-dark-50 text-sm sm:text-base mb-3">How import works</p>
              <ul className="space-y-2 text-xs sm:text-sm text-dark-600 dark:text-dark-400">
                <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span><span><strong className="text-dark-800 dark:text-dark-200">JSON files</strong> can contain books, wishlist, or both — the importer auto-detects</span></li>
                <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span><span><strong className="text-dark-800 dark:text-dark-200">CSV files</strong> import library books only</span></li>
                <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span><span>Duplicates (same title + author) are automatically skipped</span></li>
                <li className="flex items-start gap-2"><span className="text-primary-500 mt-0.5">•</span><span>Profile data from exports is not imported (for security)</span></li>
              </ul>
            </div>

            {/* Results */}
            {renderResults()}
          </div>

          {/* Right column — Upload + actions */}
          <div className="flex-1 lg:max-w-md flex flex-col gap-4 sm:gap-6">

            <div className="card p-5 sm:p-6">
              <h3 className="font-serif font-semibold text-base sm:text-lg text-dark-900 dark:text-dark-50 mb-1">Upload File</h3>
              <div className="accent-rule mb-4" />
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : file ? 'border-sage-400 dark:border-sage-600 bg-sage-50/50 dark:bg-sage-700/10'
                    : 'border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 hover:border-primary-400 dark:hover:border-primary-600'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-3">
                    <div className="w-14 h-14 mx-auto flex items-center justify-center">
                      <CheckCircle className="text-sage-600 dark:text-sage-400" size={32} />
                    </div>
                    <p className="font-semibold text-dark-900 dark:text-dark-50 text-sm sm:text-base break-all">{file.name}</p>
                    <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400">
                      {(file.size / 1024).toFixed(1)} KB · {format.toUpperCase()}
                    </p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                      className="text-xs sm:text-sm text-dark-400 dark:text-dark-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      Remove file
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="w-12 h-12 mx-auto flex items-center justify-center">
                      <Upload className="text-dark-300 dark:text-dark-600" size={26} />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-dark-900 dark:text-dark-50">
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
  const borderColor = allSuccess
    ? 'border-l-sage-500 dark:border-l-sage-400'
    : nothingImported
    ? 'border-l-amber-500 dark:border-l-amber-400'
    : 'border-l-primary-500 dark:border-l-primary-400';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`card p-4 sm:p-5 border-l-4 ${borderColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={allSuccess ? 'text-sage-600 dark:text-sage-400' : 'text-amber-600 dark:text-amber-400'} size={18} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-dark-900 dark:text-dark-50 mb-1 text-sm sm:text-base">{label}</p>
          <p className="text-xs sm:text-sm text-dark-600 dark:text-dark-400 flex flex-wrap gap-x-3">
            <span>Total: {stats.total}</span>
            <span className="text-sage-600 dark:text-sage-400 font-medium">Imported: {stats.imported}</span>
            {stats.skipped_duplicates > 0 && <span className="text-amber-600 dark:text-amber-400 font-medium">Skipped: {stats.skipped_duplicates}</span>}
            {stats.failed > 0 && <span className="text-red-600 dark:text-red-400 font-medium">Failed: {stats.failed}</span>}
          </p>
          {stats.errors?.length > 0 && (
            <div className="mt-2 max-h-28 overflow-y-auto space-y-1">
              {stats.errors.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">Row {err.row}: {err.error}</p>
              ))}
            </div>
          )}
          {allSuccess && <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 mt-2">Redirecting to home in a few seconds…</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default ImportBooks;
