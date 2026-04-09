import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, User } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { toast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or userid
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email or User ID is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await login(formData.identifier, formData.password);
      toast.success(`${formData.identifier.split('@')[0]}, Welcome back!`);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-dark-950">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
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
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </motion.div>
            
            <h1 className="text-4xl font-bold font-serif text-dark-900 dark:text-dark-50">
              Welcome Back
            </h1>
            <p className="mt-2 text-dark-600 dark:text-dark-400">
              Sign in to continue your reading journey
            </p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6 font-ui"
          >
            
            <Input
              label="Email or username"
              name="identifier"
              type="text"
              icon={Mail}
              value={formData.identifier}
              onChange={handleChange}
              error={errors.identifier}
              placeholder="you@example.com or username"
              autoComplete="username"
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-dark-400 hover:text-dark-600 
                         dark:hover:text-dark-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-dark-600 dark:text-dark-400">
                  Remember me
                </span>
              </label>
              
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 
                         hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
              icon={ArrowRight}
            >
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-200 dark:border-dark-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-dark-950 text-dark-500 dark:text-dark-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <Link to="/signup">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
              >
                Create Account
              </Button>
            </Link>
          </motion.form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-dark-500 dark:text-dark-500"
          >
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Right Side - Hero */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 
                 items-center justify-center p-12 relative overflow-hidden"
      >
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.3, 0],
                scale: [1, 2, 1],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-white text-center space-y-8 max-w-lg">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <svg className="w-32 h-32 mx-auto mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </motion.div>
          
          <h2 className="text-5xl font-bold font-serif leading-tight">
            Your Personal Library Awaits
          </h2>
          
          <p className="text-xl text-white/90">
            Track your reading journey, discover new books, and organize your literary adventures.
          </p>

          <div className="flex justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-4xl font-bold">10K+</div>
              <div className="text-white/80 text-sm mt-1">Books Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">5K+</div>
              <div className="text-white/80 text-sm mt-1">Active Readers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">4.9</div>
              <div className="text-white/80 text-sm mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;