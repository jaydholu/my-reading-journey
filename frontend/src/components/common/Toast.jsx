import React from 'react';
import { Toaster, toast as hotToast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  );
};

const CustomToast = ({ t, message, type }) => {
  const icons = {
    success: { Icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
    error: { Icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
    warning: { Icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
    info: { Icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  };

  const { Icon, color, bg, border } = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`glass-strong ${bg} ${border} border rounded-2xl p-4 shadow-xl max-w-md`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${color} flex-shrink-0`} size={20} />
        <p className="flex-1 text-sm font-medium text-dark-900 dark:text-dark-50">
          {message}
        </p>
        <button
          onClick={() => hotToast.dismiss(t.id)}
          className="flex-shrink-0 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export const toast = {
  success: (message) => {
    hotToast.custom((t) => <CustomToast t={t} message={message} type="success" />);
  },
  error: (message) => {
    hotToast.custom((t) => <CustomToast t={t} message={message} type="error" />);
  },
  warning: (message) => {
    hotToast.custom((t) => <CustomToast t={t} message={message} type="warning" />);
  },
  info: (message) => {
    hotToast.custom((t) => <CustomToast t={t} message={message} type="info" />);
  },
};