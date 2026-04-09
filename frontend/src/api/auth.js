import api from './axios';

export const authApi = {
  // Sign up
  signup: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', {
      login: identifier,  // Changed from 'identifier'
      password,
    });
    
    // Store access token
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    return response.data;
  },

  // Get current user
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Refresh token
  refresh: async () => {
    const response = await api.post('/auth/refresh');
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { 
      password,
      confirm_password: password 
    });
    return response.data;
  },
};

export default authApi;