import api from './axios';

export const booksApi = {
  // Get all books with filters
  getBooks: async (params = {}) => {
    const response = await api.get('/books', { params });
    return response.data;
  },

  // Get single book
  getBook: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  // Create book
  createBook: async (formData) => {
    // Convert FormData to a plain JSON object
    const data = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'cover_image') {
        data[key] = value === '' ? null : value;
      }
    }
    // Convert numeric fields from string to number
    if (data.rating !== null && data.rating !== undefined)
      data.rating = parseFloat(data.rating) || 0;

    if (data.page_count)
      data.page_count = parseInt(data.page_count);

    if (data.publication_year)
      data.publication_year = parseInt(data.publication_year);

    if (data.reading_started)
      data.reading_started = new Date(`${data.reading_started}T00:00:00Z`).toISOString();

    if (data.reading_finished)
      data.reading_finished = new Date(`${data.reading_finished}T00:00:00Z`).toISOString();


    const response = await api.post('/books', data);

    // If there's a cover image, upload it separately
    const coverImage = formData.get('cover_image');
    if (coverImage && coverImage.size > 0 && response.data?.id) {
      try {
        await booksApi.uploadCover(response.data.id, coverImage);
      } catch (e) {
        console.warn('Cover upload failed, but book was created:', e);
      }
    }

    return response.data;
  },

  // Update book
  updateBook: async (id, formData) => {
    const data = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'cover_image') {
        if (value !== '' && value !== null && value !== undefined) {
          data[key] = value;
        }
      }
    }

    if (data.rating !== undefined)
      data.rating = parseFloat(data.rating);

    if (data.page_count !== undefined)
      data.page_count = parseInt(data.page_count);

    if (data.publication_year !== undefined)
      data.publication_year = parseInt(data.publication_year);

    if (data.reading_started)
      data.reading_started = new Date(`${data.reading_started}T00:00:00Z`).toISOString();

    if (data.reading_finished)
      data.reading_finished = new Date(`${data.reading_finished}T00:00:00Z`).toISOString();

    const response = await api.put(`/books/${id}`, data);

    // If there's a cover image, upload it separately
    const coverImage = formData.get('cover_image');
    if (coverImage && coverImage.size > 0) {
      try {
        await booksApi.uploadCover(id, coverImage);
      } catch (e) {
        console.warn('Cover upload failed, but book was updated:', e);
      }
    }

    return response.data;
  },

  // Delete book
  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async (id) => {
    const response = await api.patch(`/books/${id}/favorite`);
    return response.data;
  },

  // Get favorites
  getFavorites: async () => {
    const response = await api.get('/books/favorites');
    return response.data;
  },

  // Get stats
  getStats: async () => {
    const response = await api.get('/books/stats');
    return response.data;
  },

  // Upload cover image
  uploadCover: async (id, file) => {
    const coverFormData = new FormData();
    coverFormData.append('file', file);

    const response = await api.post(`/books/${id}/cover-image`, coverFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default booksApi;