import api from './axios';

export const usersApi = {
  // Get profile
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (formData) => {
    const response = await api.put('/users/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    const response = await api.post('/users/me/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    const response = await api.delete('/users/me/picture');
    return response.data;
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await api.delete('/users/me/delete');
    return response.data;
  },
};

export default usersApi;