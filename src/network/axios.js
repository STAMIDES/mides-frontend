import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicRoutes = [
  '/usuarios/login',
  '/usuarios/registro'
];

const isPublicRoute = (url) => {
  return publicRoutes.some(route => url.includes(route));
};

const setupInterceptors = (getToken, refreshAccessToken, removeAuthContext) => {
  api.interceptors.request.use(
    async (config) => {
      console.log('Request:', config.url)
      if (isPublicRoute(config.url)) {
        console.log('Public route, skipping token check');
        return config;
      }
      try {
        const token = await getToken();
        console.log('[axios] Token:', token)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log('No token available after getToken');
        }
      } catch (error) {
        console.log("No valid token, attempting to refresh");
        try {
          const newToken = await refreshAccessToken();
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          removeAuthContext();
          throw refreshError;
        }
      }
      return config;
    },
    (error) => {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {  
      const originalRequest = error.config;
      if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Error in response interceptor:", refreshError);
          removeAuthContext();
          throw refreshError;
        }
      }
      return Promise.reject(error);
    }
  );
};

const useApi = () => {
  const { getToken, refreshAccessToken, removeAuthContext } = useAuth();

  if (!api.interceptors.request.handlers.length && !api.interceptors.response.handlers.length) {
    console.log('Setting up interceptors')
    setupInterceptors(getToken, refreshAccessToken, removeAuthContext);
  }
  
  return api;
};

export default useApi;