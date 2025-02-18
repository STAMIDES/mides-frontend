import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  cors: true
});

const publicRoutes = [
  '/usuarios/login',
  '/usuarios/registro'
];

const isPublicRoute = (url) => {
  return publicRoutes.some(route => url.includes(route));
};

const setupInterceptors = (removeAuthContext) => {
  // Intercept requests
  api.interceptors.request.use(
    async (config) => {
      if (isPublicRoute(config.url)) {
        console.log('Public route, skipping token check');
      }
      // Because we rely on HttpOnly cookies for authentication,
      // no need to manually attach tokens in headers here.
      return config;
    },
    (error) => {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  );

  // Intercept responses (for refresh logic)
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If we get a 401/403, attempt to refresh once
      if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Ask server to refresh the tokens (again via HttpOnly cookies)
          await api.post('/usuarios/logout/refresh', {}, { withCredentials: true });
          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          removeAuthContext();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

const useApi = () => {
  const { removeAuthContext } = useAuth();

  // Make sure interceptors are only set once
  if (!api.interceptors.request.handlers.length && !api.interceptors.response.handlers.length) {
    console.log('Setting up interceptors...');
    setupInterceptors(removeAuthContext);
  }

  return api;
};

export default useApi;
export { api };