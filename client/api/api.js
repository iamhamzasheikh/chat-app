import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: backendUrl,
});

// Axios interceptor to attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.token = token; // matching your backend header
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
