import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { PASSWORD_REQUIREMENTS } from '../../utils/constants';
import { validateEmail, validateUserID } from '../../utils/validators';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    user_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordRequirements = PASSWORD_REQUIREMENTS;

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

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.user_name.trim()) {
      newErrors.user_name = 'User name is required';
    } else if (formData.user_name.length < 3) {
      newErrors.user_name = 'User name must be at least 3 characters';
    } else if (!validateUserID(formData.user_name)) {
      newErrors.user_name = 'User name can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRequirements.every(req => req.test(formData.password))) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await signup({
        full_name: formData.full_name,
        user_name: formData.user_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });
      toast.success('Account created! Please check your email to verify.');
      navigate('/verify-email');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Signup failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Side - Hero */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 
                 items-center justify-center p-12 relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 text-white text-center space-y-6 max-w-lg">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <svg className="w-24 h-24 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.div>

          <h2 className="text-5xl font-bold font-serif leading-tight">
            Start Your Reading Adventure
          </h2>

          <p className="text-xl text-white/90">
            Join thousands of book lovers tracking their literary journey
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            {[
              { icon: '📚', text: 'Track Books' },
              { icon: '⭐', text: 'Rate & Review' },
              { icon: '📊', text: 'View Stats' },
              { icon: '❤️', text: 'Create Lists' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-strong p-4 rounded-2xl text-center"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium text-dark-700 dark:text-dark-300">{item.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-dark-950 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8 my-8"
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
              Create Account
            </h1>
            <p className="mt-2 text-dark-600 dark:text-dark-400">
              Start organizing your reading life today
            </p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <Input
              label="Full Name"
              name="full_name"
              type="text"
              icon={User}
              value={formData.full_name}
              onChange={handleChange}
              error={errors.full_name}
              placeholder="John Doe"
              autoComplete="name"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <Input
              label="User Name"
              name="user_name"
              type="text"
              icon={User}
              value={formData.user_name}
              onChange={handleChange}
              error={errors.user_name}
              placeholder="johndoe123"
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
                placeholder="Create a strong password"
                autoComplete="new-password"
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

            {/* Password Requirements */}
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                {passwordRequirements.map((req, i) => {
                  const met = req.test(formData.password);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle
                        size={16}
                        className={met ? 'text-green-500' : 'text-dark-300 dark:text-dark-700'}
                      />
                      <span className={met ? 'text-green-600 dark:text-green-400' : 'text-dark-500'}>
                        {req.label}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                icon={Lock}
                value={formData.confirm_password}
                onChange={handleChange}
                error={errors.confirm_password}
                placeholder="Re-enter your password to confirm"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-dark-400 hover:text-dark-600 
                         dark:hover:text-dark-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full"
              icon={ArrowRight}
            >
              Create Account
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-200 dark:border-dark-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-dark-950 text-dark-500 dark:text-dark-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link to="/login">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
              >
                Sign In
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
            By creating an account, you agree to our{' '}
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
    </div>
  );
};

export default Signup;