import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center space-y-6">
        
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="inline-flex"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            danger 
              ? 'bg-red-100 dark:bg-red-900/20' 
              : 'bg-primary-100 dark:bg-primary-900/20'
          }`}>
            <AlertTriangle 
              className={danger ? 'text-red-600 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'} 
              size={32} 
            />
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50">
            {title}
          </h3>
          <p className="text-dark-600 dark:text-dark-400">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;