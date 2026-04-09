export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return {
    isValid: minLength && hasUppercase && hasLowercase && hasNumber,
    minLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
  };
};

export const validateUserID = (userid) => {
  // 3-30 characters, alphanumeric and underscores only
  const re = /^[a-zA-Z0-9_]{3,30}$/;
  return re.test(userid);
};

export const validateISBN = (isbn) => {
  // Remove hyphens and spaces
  const cleaned = isbn.replace(/[-\s]/g, '');
  
  // Check if it's ISBN-10 or ISBN-13
  if (cleaned.length === 10) {
    return /^\d{9}[\dX]$/.test(cleaned);
  } else if (cleaned.length === 13) {
    return /^\d{13}$/.test(cleaned);
  }
  
  return false;
};

export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

export const validateFileType = (file, acceptedTypes) => {
  return acceptedTypes.includes(file.type);
};