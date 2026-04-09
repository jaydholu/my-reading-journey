import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit3 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import BookForm from '../components/books/BookForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from '../components/common/Toast';
import { useBooks } from '../hooks/useBooks';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBook, updateBook } = useBooks();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      const data = await getBook(id);
      setBook(data);
    } catch (error) {
      toast.error('Failed to load book');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await updateBook(id, formData);
      toast.success('Book updated successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update book');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading book..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 
                  dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <PageHeader
          title="Edit Book"
          description="Update your book information"
          icon={Edit3}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: book?.title || 'Book', href: `/books/${id}` },
            { label: 'Edit' }
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BookForm 
            initialData={book} 
            onSubmit={handleSubmit} 
            loading={submitting} 
          />
        </motion.div>
      </div>
    </div>
  );
};

export default EditBook;