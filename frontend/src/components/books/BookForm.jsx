import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Calendar } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import StarRating from './StarRating';
import { toast } from '../common/Toast';
import { FORMATS, LANGUAGES, MAX_FILE_SIZE } from '../../utils/constants';

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BookForm = ({ initialData, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    author: initialData?.author || '',
    isbn: initialData?.isbn || '',
    genre: initialData?.genre || '',
    rating: initialData?.rating || 0,
    description: initialData?.description || '',
    reading_started: formatDateForInput(initialData?.reading_started),
    reading_finished: formatDateForInput(initialData?.reading_finished),
    page_count: initialData?.page_count || '',
    publisher: initialData?.publisher || '',
    publication_year: initialData?.publication_year || '',
    language: initialData?.language || 'English',
    format: initialData?.format || '',
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initialData?.cover_image || null);
  const [errors, setErrors] = useState({});

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) { toast.error('File must be an image under 10MB'); return; }
      const file = acceptedFiles[0];
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.reading_started) newErrors.reading_started = 'Start date is required';
    if (formData.reading_finished && formData.reading_started &&
      new Date(formData.reading_finished) < new Date(formData.reading_started)) {
      newErrors.reading_finished = 'Finish date cannot be before start date';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }
    const submitData = new FormData();
    Object.keys(formData).forEach(key => { if (formData[key]) submitData.append(key, formData[key]); });
    if (coverImage) submitData.append('cover_image', coverImage);
    await onSubmit(submitData);
  };

  const removeCoverImage = () => { setCoverImage(null); setCoverPreview(null); };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

      {/* Cover Image Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Cover Image</label>
        {coverPreview ? (
          /* RESPONSIVE FIX: cap max-height on mobile so it doesn't dominate the screen */
          <div className="relative w-full max-w-xs sm:max-w-sm mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-2xl overflow-hidden shadow-lg">
              <img src={coverPreview} alt="Cover preview" className="w-full object-cover" style={{ maxHeight: '360px' }} />
              <button type="button" onClick={removeCoverImage}
                className="absolute top-3 right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg">
                <X size={18} />
              </button>
            </motion.div>
          </div>
        ) : (
          <div {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-dark-300 dark:border-dark-700 hover:border-primary-500 dark:hover:border-primary-500'}`}>
            <input {...getInputProps()} />
            <motion.div animate={{ y: isDragActive ? -10 : 0 }} className="space-y-3 sm:space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                {isDragActive
                  ? <Upload className="text-primary-600 dark:text-primary-400" size={28} />
                  : <ImageIcon className="text-primary-600 dark:text-primary-400" size={28} />}
              </div>
              <div>
                <p className="text-base sm:text-lg font-medium text-dark-900 dark:text-dark-50">
                  {isDragActive ? 'Drop the image here' : 'Upload book cover'}
                </p>
                <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 mt-1">Drag & drop or click to browse</p>
                <p className="text-xs text-dark-400 dark:text-dark-500 mt-1.5">PNG, JPG, GIF up to 10MB</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="card p-4 sm:p-6 space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-dark-900 dark:text-dark-50">Basic Information</h3>
        <Input label="Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} required placeholder="Enter book title" />
        {/* RESPONSIVE FIX: single col on mobile, two on md */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Author" name="author" value={formData.author} onChange={handleChange} placeholder="Author name" />
          <Input label="ISBN" name="isbn" value={formData.isbn} onChange={handleChange} placeholder="ISBN-10 or ISBN-13" />
          <Input label="Genre" name="genre" value={formData.genre} onChange={handleChange} placeholder="e.g., Fiction, Mystery" />
          <Input label="Publisher" name="publisher" value={formData.publisher} onChange={handleChange} placeholder="Publisher name" />
          <Input label="Page Count" name="page_count" type="number" min="1" value={formData.page_count} onChange={handleChange} placeholder="Number of pages" />
          <Input label="Publication Year" name="publication_year" type="number" min="1000" max={new Date().getFullYear()} value={formData.publication_year} onChange={handleChange} placeholder="YYYY" />
        </div>
      </div>

      {/* Reading Details */}
      <div className="card p-4 sm:p-6 space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-dark-900 dark:text-dark-50">Reading Details</h3>
        {/* RESPONSIVE FIX: single col on mobile for date inputs (they're wide) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Date Started" name="reading_started" type="date" icon={Calendar}
            value={formData.reading_started} onChange={handleChange} error={errors.reading_started} required />
          <Input label="Date Finished" name="reading_finished" type="date" icon={Calendar}
            value={formData.reading_finished} onChange={handleChange} error={errors.reading_finished} />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Language</label>
            <select name="language" value={formData.language} onChange={handleChange} className="input-field">
              {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Format</label>
            <select name="format" value={formData.format} onChange={handleChange} className="input-field">
              <option value="">Select format</option>
              {FORMATS.map(fmt => <option key={fmt.value} value={fmt.value}>{fmt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Your Rating</label>
          <div className="flex items-center gap-4">
            <StarRating
              rating={formData.rating}
              onChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
              size="xl"
              showValue
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card p-4 sm:p-6 space-y-4">
        <h3 className="text-lg sm:text-xl font-bold text-dark-900 dark:text-dark-50">Review & Notes</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={5}
            placeholder="Share your thoughts about this book..." className="input-field resize-none" />
          <p className="text-xs text-dark-500 dark:text-dark-400 text-right">{formData.description.length} / 2000</p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => window.history.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">
          {initialData ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
};

export default BookForm;
