import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { toast } from '../../components/common/Toast';
import api from '../../api/axios';
import { PASSWORD_REQUIREMENTS } from '../../utils/constants';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordRequirements = PASSWORD_REQUIREMENTS;

  useEffect(() => {
    // Validate token on mount
    const validateToken = async () => {
      try {
        await api.get(`/auth/validate-reset-token/${token}`);
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        toast.error('Invalid or expired reset link');
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setValidating(false);
      setTokenValid(false);
    }
  }, [token]);

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
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRequirements.every(req => req.test(formData.password))) {
      newErrors.password = 'Password does not meet requirements';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: formData.password,
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to reset password';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 mb-4" />
          <p className="text-dark-600 dark:text-dark-400">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br 
                    from-red-50 via-white to-red-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950">
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
                       bg-red-100 dark:bg-red-900/30 mx-auto"
            >
              <AlertCircle className="text-red-600 dark:text-red-400" size={40} />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-serif text-dark-900 dark:text-dark-50">
                Invalid Reset Link
              </h2>
              <p className="text-dark-600 dark:text-dark-400">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <Link to="/forgot-password">
                <Button variant="primary" className="w-full">
                  Request New Link
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
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
            <Lock className="text-white" size={32} />
          </motion.div>
          
          <h1 className="text-4xl font-bold font-serif text-dark-900 dark:text-dark-50">
            Reset Password
          </h1>
          <p className="mt-2 text-dark-600 dark:text-dark-400">
            Create a new password for your account
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
            
            <div className="relative">
              <Input
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter new password"
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
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Re-enter new password"
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
              Reset Password
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;