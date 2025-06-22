import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  cors: true
});

const publicEndPoint = [
  '/usuarios/login',
  '/usuarios/forgot-password',
  '/usuarios/validate-reset-token',
  '/usuarios/reset-password',
  '/usuarios/registro'
];
const publicPath = [
  '/cuenta/*'
];

const isPublicEndPoint = (url) => {
  console.log(url);
  return publicEndPoint.some(route => url.includes(route));
};

export const isPublicPath = (url) => {
  console.log(url);
  return publicPath.some(route => {
    // For wildcards, we need to split and check differently
    if (route.includes('*')) {
      // Split the route at "*" and check if the URL starts with the part before "*"
      const routePrefix = route.split('*')[0];
      return url.startsWith(routePrefix);
    }
    // For routes without wildcards, continue using includes
    return url.includes(route);
  });
};

// Store the logout function to use in interceptors
let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Set up interceptors immediately
api.interceptors.request.use(
  async (config) => {
    if (isPublicEndPoint(config.url)) {
      console.log('Public route, skipping token check');
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

    // Don't try to refresh for public endpoints or if we're already retrying
    if (isPublicEndPoint(originalRequest.url) || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh endpoint itself
    if (originalRequest.url.includes('/usuarios/logout/refresh')) {
      return Promise.reject(error);
    }

    // Only try to refresh for 401/403 errors on protected endpoints
    if (error.response?.status === 401 || error.response?.status === 403) {
      originalRequest._retry = true;
      
      try {
        console.log('Attempting to refresh token...');
        const refreshResponse = await api.post('/usuarios/logout/refresh', {}, { 
          withCredentials: true,
          _skipInterceptor: true // Add flag to avoid intercepting this request
        });
        console.log('Token refreshed successfully, retrying original request');
        // Token refreshed successfully, retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        
        // If refresh failed due to no refresh token or 401, logout immediately
        if (refreshError.response?.status === 401) {
          console.log("Refresh token invalid or missing, logging out");
          if (logoutCallback) {
            logoutCallback();
          }
        }
        
        // Don't retry the original request, just reject
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

const useApi = () => {
  return api;
};

export default useApi;
export { api };