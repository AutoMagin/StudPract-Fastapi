import axiosInstance from './axiosInstance';

export const userService = {
  get: (id) => axiosInstance.get(`/users/${id}`).then(response => response.data),
  getUsers: (skip = 0, limit = 10, sortBy = null, search = null) => {
    let url = `/users/?skip=${skip}&limit=${limit}`;
    if (sortBy) url += `&sort_by=${sortBy}`;
    if (search) url += `&search=${search}`;
    return axiosInstance.get(url).then(response => response.data);
  },
  create: (user) => {
    return axiosInstance.post(`/users/`, user)
      .then(response => {
        const { token } = response.data;
        if (token) {
          localStorage.setItem('token', token);
          console.log('Token saved after registration:', token);
        } else {
          console.log('No token in registration response:', response.data);
        }
        return response.data;
      })
      .catch(error => {
        console.error('Registration error:', error);
        throw error;
      });
  },
  update: (id, user) => axiosInstance.put(`/users/${id}`, user).then(response => response.data),
  delete: (id) => axiosInstance.delete(`/users/${id}`).then(response => response.data),
  login: (credentials) => {
    return axiosInstance.post(`/users/login`, credentials)
      .then(response => {
        const { token } = response.data;
        if (token) {
          localStorage.setItem('token', token);
          console.log('Token saved after login:', token);
        } else {
          console.log('No token in login response:', response.data);
        }
        return response.data;
      })
      .catch(error => {
        console.error('Login error:', error);
        throw error;
      });
  },
};