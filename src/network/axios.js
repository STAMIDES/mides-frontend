import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const HOST = 'http://localhost:8000';
const api = axios.create({
  baseURL: HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

const setupInterceptors = (token, refreshToken, removeAuthContext, isTokenExpired) => {
  api.interceptors.request.use(
    async (config) => {
      if (token && isTokenExpired(token)) {
        console.log("Token expiredo")
        const newToken = await refreshToken();
        if (newToken) {
          console.log("nuevo token")
          config.headers.Authorization = `Bearer ${newToken}`;
        } else {
          removeAuthContext();
        }
      } else if (token) {
        console.log("Token valido")
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
      if (error.response.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newToken = await refreshToken();

        if (newToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          removeAuthContext();
        }
      }
      
      return Promise.reject(error);
    }
  );
};

const useApi = () => {
  const { token, login, removeAuthContext, isTokenExpired } = useAuth();
  
  const refreshToken = async () => {
    try {
      console.log("Refrescando token")
      const response = await axios.post(HOST+ '/usuarios/refresh', {
        refresh_token: localStorage.getItem('refresh_token'),
      });

      const { access_token } = response.data.access_token;
      console.log("Nuevo token: ", response.data)
      login(access_token);  // Update the context with the new token
      return access_token;
    } catch (error) {
      removeAuthContext();
      return null;
    }
  };
  setupInterceptors(token, refreshToken, removeAuthContext, isTokenExpired);
  return api;
};

export default useApi;
