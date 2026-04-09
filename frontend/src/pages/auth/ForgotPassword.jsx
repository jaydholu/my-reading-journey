import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from '../../components/common/Toast';
import api from '../../api/axios';
import { validateEmail } from '../../utils/validators';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent!');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to send reset link';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br 
                    from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="card text-center p-8 space-y-6">
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex w-20 h-20 items-center justify-center rounded-full 
                       bg-green-100 dark:bg-green-900/30 mx-auto"
            >
              <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-serif text-dark-900 dark:text-dark-50">
                Check Your Email
              </h2>
              <p className="text-dark-600 dark:text-dark-400">
                We've sent a password reset link to
              </p>
              <p className="font-medium text-primary-600 dark:text-primary-400">
                {email}
              </p>
            </div>

            <div className="glass-strong p-4 rounded-xl text-sm text-dark-600 dark:text-dark-400 text-left space-y-2">
              <p className="font-medium text-dark-900 dark:text-dark-50">Next steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your email inbox</li>
                <li>Click the reset link (valid for 30 minutes)</li>
                <li>Create a new password</li>
              </ol>
            </div>

            <div className="space-y-3 pt-4">
              <Link to="/login">
                <Button variant="primary" className="w-full" icon={ArrowLeft}>
                  Back to Login
                </Button>
              </Link>
              
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br 
                  from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        
        {/* Logo */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex w-16 h-16 items-center justify-center rounded-2xl 
                     bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl 
                     shadow-primary-500/50 mb-4"
          >
            <Mail className="text-white" size={32} />
          </motion.div>
          
          <h1 className="text-4xl font-bold font-serif text-dark-900 dark:text-dark-50">
            Forgot Password?
          </h1>
          <p className="mt-2 text-dark-600 dark:text-dark-400">
            No worries, we'll send you reset instructions
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <Input
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={error}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
              icon={Send}
            >
              Send Reset Link
            </Button>

            <Link to="/login">
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                icon={ArrowLeft}
              >
                Back to Login
              </Button>
            </Link>
          </form>
        </motion.div>

        {/* Help text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-strong p-4 rounded-2xl text-center text-sm text-dark-600 dark:text-dark-400"
        >
          <p>
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;