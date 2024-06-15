import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

const setupInterceptors = (token, refreshToken, logout) => {
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newToken = await refreshToken();

        if (newToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          logout();
        }
      }
      
      return Promise.reject(error);
    }
  );
};

const useApi = () => {
  const { token, login, logout } = useAuth();
  
  const refreshToken = async () => {
    try {
      const response = await axios.post('auth/refresh', {
        token: localStorage.getItem('refresh_token'),
      });

      const { accessToken } = response.data;
      login(accessToken);  // Update the context with the new token
      return accessToken;
    } catch (error) {
      logout();
      return null;
    }
  };

  setupInterceptors(token, refreshToken, logout);
  return api;
};

export default useApi;
