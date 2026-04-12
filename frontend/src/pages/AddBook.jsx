import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookPlus, Sparkles, BookCopy, Star, Camera } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import BookForm from '../components/books/BookForm';
import { toast } from '../components/common/Toast';
import { useBooks } from '../hooks/useBooks';

const AddBook = () => {
  const navigate = useNavigate();
  const { createBook } = useBooks();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await createBook(formData);
      toast.success('Book added successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 
                  dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12">
        
        <PageHeader
          title="Add New Book"
          description="Add a book to your reading collection"
          icon={BookPlus}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Add Book' }
          ]}
        />

        {/* Motivational Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-8 bg-gradient-to-r from-primary-500/10 to-primary-600/10 
                   border-2 border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center 
                          shadow-lg shadow-primary-500/50 flex-shrink-0">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-1">
                Great choice!
              </h3>
              <p className="text-sm text-dark-600 dark:text-dark-400">
                Every book you add is a step in your reading journey. Fill in as much detail as 
                you'd like – you can always come back and update it later.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BookForm onSubmit={handleSubmit} loading={loading} />
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              icon: BookCopy,
              title: 'Title & Date',
              desc: 'Only title and reading start date are required'
            },
            {
              icon: Star,
              title: 'Rate It',
              desc: 'Add your rating to track your favorites'
            },
            {
              icon: Camera,
              title: 'Cover Image',
              desc: 'Upload a cover to make your library visually appealing'
            }
          ].map(({icon: Icon, title, desc}, i) => (
            <div
              key={i}
              className="glass-strong p-4 rounded-xl text-center"
            >
              <Icon className="text-2xl mb-2 mx-auto text-primary-600" />
              <h4 className="font-semibold text-dark-900 dark:text-dark-50 mb-1">
                {title}
              </h4>
              <p className="text-sm text-dark-600 dark:text-dark-400">
                {desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AddBook;