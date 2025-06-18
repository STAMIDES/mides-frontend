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

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post('/usuarios/logout/refresh', {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        if (logoutCallback) {
          logoutCallback();
        }
        return Promise.reject(refreshError);
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