import axiosInstance from './axiosInstance';

export const postService = {
  getPosts: () => axiosInstance.get(`/users/posts/?skip=0&limit=10`).then(response => response.data),
  getPostsByUser: (userId) => axiosInstance.get(`/users/${userId}/posts/`).then(response => response.data),
  getPost: (postId) => axiosInstance.get(`/users/posts/${postId}`).then(response => response.data),
  createPost: (userId, post) => axiosInstance.post(`/users/${userId}/posts/`, post).then(response => response.data),
  updatePost: (postId, post) => axiosInstance.put(`/users/posts/${postId}`, post).then(response => response.data),
  deletePost: (postId) => axiosInstance.delete(`/users/posts/${postId}`).then(response => response.data),
  likePost: (postId) => axiosInstance.post(`/users/posts/${postId}/like`).then(response => response.data),
  unlikePost: (postId) => axiosInstance.delete(`/users/posts/${postId}/like`).then(response => response.data),
};