import axiosInstance from './axiosInstance';

export const userService = {
  register(user) {
    return axiosInstance.post('/users/', user).then((response) => response.data);
  },
  login(user) {
    return axiosInstance.post('/users/login', user).then((response) => response.data);
  },
  get(userId) {
    return axiosInstance.get(`/users/${userId}`).then((response) => response.data);
  },
  getAll() {
    return axiosInstance.get('/users/').then((response) => response.data);
  },
  update(userId, user) {
    return axiosInstance.put(`/users/${userId}`, user).then((response) => response.data);
  },
  delete(userId) {
    return axiosInstance.delete(`/users/${userId}`).then((response) => response.data);
  },
};