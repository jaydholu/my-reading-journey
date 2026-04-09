import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import Button from '../components/common/Button';

const Error = ({ type = '404' }) => {
  const location = useLocation();
  const errorType = type || location.state?.errorType || '404';

  const errorConfig = {
    '404': {
      code: '404',
      title: 'Page Not Found',
      description: "Sorry, we couldn't find the page you're looking for.",
      emoji: '📚',
      suggestions: [
        'Check if the URL is correct',
        'The page may have been moved or deleted',
        'Try searching from the home page'
      ]
    },
    '500': {
      code: '500',
      title: 'Server Error',
      description: 'Oops! Something went wrong on our end.',
      emoji: '🔧',
      suggestions: [
        'Try refreshing the page',
        'Check back in a few minutes',
        'Contact support if the problem persists'
      ]
    },
    '401': {
      code: '401',
      title: 'Unauthorized',
      description: 'You need to be logged in to access this page.',
      emoji: '🔒',
      suggestions: [
        'Log in to your account',
        'Check if your session has expired',
        'Verify your credentials'
      ]
    },
    '413': {
      code: '413',
      title: 'File Too Large',
      description: 'The file you tried to upload is too large.',
      emoji: '📦',
      suggestions: [
        'Maximum file size is 50MB',
        'Try compressing your file',
        'Split into smaller files'
      ]
    }
  };

  const config = errorConfig[errorType] || errorConfig['404'];

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br 
                  from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          
          {/* Error Code with Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative inline-block"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-primary-500 rounded-full blur-3xl"
            />
            <div className="relative text-9xl font-bold text-gradient">
              {config.code}
            </div>
          </motion.div>

          {/* Emoji */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-8xl"
          >
            {config.emoji}
          </motion.div>

          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-dark-900 dark:text-dark-50">
              {config.title}
            </h1>
            <p className="text-xl text-dark-600 dark:text-dark-400">
              {config.description}
            </p>
          </div>

          {/* Suggestions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 
                            flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-dark-900 dark:text-dark-50 mb-3">
                  What you can try:
                </h3>
                <ul className="space-y-2">
                  {config.suggestions.map((suggestion, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-2 text-dark-600 dark:text-dark-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      {suggestion}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 justify-center pt-4"
          >
            <Link to="/">
              <Button variant="primary" icon={Home} size="lg">
                Go Home
              </Button>
            </Link>
            
            <Button 
              variant="secondary" 
              icon={ArrowLeft} 
              size="lg"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>

            {errorType === '500' && (
              <Button 
                variant="ghost" 
                icon={RefreshCw} 
                size="lg"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            )}

            {errorType === '401' && (
              <Link to="/login">
                <Button variant="primary" size="lg">
                  Sign In
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Help Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-dark-500 dark:text-dark-500"
          >
            Need help?{' '}
            <Link to="/support" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Contact Support
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Error;