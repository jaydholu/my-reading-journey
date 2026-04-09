export const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Horror',
  'Biography',
  'History',
  'Self-Help',
  'Poetry',
  'Drama',
  'Adventure',
  'Crime',
  'Young Adult',
  'Children',
  'Graphic Novel',
  'Memoir',
  'Philosophy',
];

export const FORMATS = [
  { value: 'paperback', label: 'Paperback' },
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'ebook', label: 'E-book' },
  { value: 'audiobook', label: 'Audiobook' },
  { value: 'pdf', label: 'PDF' },
  { value: 'other', label: 'Other' },
];

export const LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Russian',
  'Other',
];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const PRIORITIES = [
  { value: 1, label: '⭐ Low' },
  { value: 2, label: '⭐⭐ Medium-Low' },
  { value: 3, label: '⭐⭐⭐ Medium' },
  { value: 4, label: '⭐⭐⭐⭐ High' },
  { value: 5, label: '⭐⭐⭐⭐⭐ Very High' },
];

export const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const ACCEPTED_IMPORT_TYPES = [
  'application/json',
  'text/csv',
  'application/vnd.ms-excel',
];
