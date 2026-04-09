import api from './axios';

export const dataApi = {
  // Import books
  importBooks: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/data/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Export books as JSON
  exportJSON: async () => {
    const response = await api.get('/data/export/json', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Export books as CSV
  exportCSV: async () => {
    const response = await api.get('/data/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get CSV template
  getCSVTemplate: async () => {
    const response = await api.get('/data/template/csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default dataApi;