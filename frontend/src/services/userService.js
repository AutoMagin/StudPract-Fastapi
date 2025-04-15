import axiosInstance from './axiosInstance';

export const userService = {
  get: (id) => axiosInstance.get(`/users/${id}`).then(response => response.data),
  getUsers: (skip = 0, limit = 10, sortBy = null, search = null) => {
    let url = `/users/?skip=${skip}&limit=${limit}`;
    if (sortBy) url += `&sort_by=${sortBy}`;
    if (search) url += `&search=${search}`;
    return axiosInstance.get(url).then(response => response.data);
  },
  create: (user) => axiosInstance.post(`/users/`, user).then(response => response.data),
  update: (id, user) => axiosInstance.put(`/users/${id}`, user).then(response => response.data),
  delete: (id) => axiosInstance.delete(`/users/${id}`).then(response => response.data),
  login: (credentials) => axiosInstance.post(`/users/login`, credentials).then(response => response.data),
};