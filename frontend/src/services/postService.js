import axiosInstance from './axiosInstance';

export const postService = {
  createPost(userId, post) {
    return axiosInstance.post(`/users/${userId}/posts/`, post).then((response) => response.data);
  },
  getPosts(skip = 0, limit = 10) {
    return axiosInstance.get(`/users/posts/?skip=${skip}&limit=${limit}`).then((response) => response.data);
  },
  getPostsByUser(userId) {
    return axiosInstance.get(`/users/${userId}/posts/`).then((response) => response.data);
  },
  getPost(postId) {
    return axiosInstance.get(`/users/posts/${postId}`).then((response) => response.data);
  },
  updatePost(postId, post) {
    return axiosInstance.put(`/users/posts/${postId}`, post).then((response) => response.data);
  },
  deletePost(postId) {
    return axiosInstance.delete(`/users/posts/${postId}`).then((response) => response.data);
  },
  likePost(postId) {
    return axiosInstance.post(`/users/posts/${postId}/like/`).then((response) => response.data);
  },
  unlikePost(postId) {
    return axiosInstance.delete(`/users/posts/${postId}/like/`).then((response) => response.data);
  },
};