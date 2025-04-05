// src/api-client/core/AxiosInstance.ts
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://54.180.2.79:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
