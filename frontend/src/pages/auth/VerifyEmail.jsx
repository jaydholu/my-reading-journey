import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { toast } from '../../components/common/Toast';
import api from '../../api/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      await api.post(`/auth/verify-email/${verificationToken}`);
      setVerified(true);
      toast.success('Email verified successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Verification failed');
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    // Get email from localStorage or prompt user
    const email = prompt('Please enter your email address:');

    if (!email) {
      toast.error('Email is required');
      return;
    }

    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br 
                    from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-flex w-20 h-20 items-center justify-center rounded-full 
                     bg-primary-100 dark:bg-primary-900/30"
          >
            <Mail className="text-primary-600 dark:text-primary-400" size={40} />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
              Verifying Email...
            </h2>
            <p className="mt-2 text-dark-600 dark:text-dark-400">
              Please wait while we verify your email address
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br 
                    from-green-50 via-white to-green-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
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
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 0.6 }}
                className="inline-flex w-24 h-24 items-center justify-center rounded-full 
                         bg-green-100 dark:bg-green-900/30"
              >
                <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
              </motion.div>
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-serif text-dark-900 dark:text-dark-50">
                Email Verified!
              </h2>
              <p className="text-dark-600 dark:text-dark-400">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
            </div>

            <div className="glass-strong p-4 rounded-xl">
              <p className="text-sm text-dark-600 dark:text-dark-400">
                Redirecting you to login page in a few seconds...
              </p>
            </div>

            <Link to="/login">
              <Button variant="primary" className="w-full">
                Sign In Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state or default state
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br 
                  from-primary-50 via-white to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >

        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className={`inline-flex w-20 h-20 items-center justify-center rounded-full mb-4 ${error
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-primary-100 dark:bg-primary-900/30'
              }`}
          >
            {error ? (
              <XCircle className="text-red-600 dark:text-red-400" size={40} />
            ) : (
              <Mail className="text-primary-600 dark:text-primary-400" size={40} />
            )}
          </motion.div>

          <h1 className="text-4xl font-bold font-serif text-dark-900 dark:text-dark-50">
            {error ? 'Verification Failed' : 'Verify Your Email'}
          </h1>
          <p className="mt-2 text-dark-600 dark:text-dark-400">
            {error || 'Check your inbox for the verification link'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 space-y-6"
        >

          {error ? (
            <div className="space-y-4">
              <div className="glass-strong bg-red-50 dark:bg-red-900/20 p-4 rounded-xl 
                            border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleResend}
                loading={resending}
                className="w-full"
                icon={RefreshCw}
              >
                Resend Verification Email
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-strong p-4 rounded-xl text-sm text-dark-600 dark:text-dark-400 
                            text-left space-y-2">
                <p className="font-medium text-dark-900 dark:text-dark-50">
                  What to do next:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your email inbox</li>
                  <li>Look for our verification email</li>
                  <li>Click the verification link</li>
                  <li>You'll be redirected automatically</li>
                </ol>
              </div>

              <div className="pt-2">
                <p className="text-sm text-dark-600 dark:text-dark-400 text-center mb-3">
                  Didn't receive the email?
                </p>
                <Button
                  variant="secondary"
                  onClick={handleResend}
                  loading={resending}
                  className="w-full"
                  icon={RefreshCw}
                >
                  Resend Email
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-dark-200 dark:border-dark-800">
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-strong p-4 rounded-2xl text-center text-sm text-dark-600 dark:text-dark-400"
        >
          <p>
            Need help?{' '}
            <Link to="/support" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;