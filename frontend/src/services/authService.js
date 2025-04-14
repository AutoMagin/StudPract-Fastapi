import { userService } from './userService';

export const authService = {
  login: async (credentials) => {
    const response = await userService.create(credentials);
    localStorage.setItem('user', JSON.stringify(response));
    localStorage.setItem('token', response.token);
    return response;
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user') || 'null');
  },
};