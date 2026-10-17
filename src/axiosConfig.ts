import axios from 'axios';
import { clearAdminSession } from './adminSession';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,  
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    if ((status === 401 || status === 403) && !requestUrl.includes('/admin/login')) {
      clearAdminSession();
      if (window.location.pathname !== '/admin/login') {
        window.location.replace('/admin/login');
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
