import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Sending request with token:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;