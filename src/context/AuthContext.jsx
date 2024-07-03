import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const isTokenExpired = (token) => {
  if (!token) return true;
  const { exp } = jwtDecode(token);
  if (!exp) return true;
  return Date.now() >= exp * 1000;
};

const AuthContext = createContext();

const refreshAxios = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [refresh_token, setRefreshToken] = useState(null);
  const [email, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const tokenPromiseRef = useRef(null);

  const getStorageToken = useCallback((tokenKey) => {
    const value = localStorage.getItem(tokenKey);
    console.log(`${tokenKey} from storage:`, value);
    if (value && !isTokenExpired(value)) {
      return value;
    } else {
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storageToken = getStorageToken('token');
      const storageRefreshToken = getStorageToken('refresh_token');
      const user = localStorage.getItem('user');

      if (storageToken) {
        setToken(storageToken);
        setIsAuthenticated(true);
      }
      if (storageRefreshToken) {
        setRefreshToken(storageRefreshToken);
      }
      if (user) {
        setUser(user);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [getStorageToken]);

  const setAuthContext = useCallback((newToken, newRefreshToken = null, user = null) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setIsAuthenticated(true);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
      localStorage.setItem('refresh_token', newRefreshToken);
    }
    if (user) {
      setUser(user);
      localStorage.setItem('user', user);
    }
  }, []);

  const removeAuthContext = useCallback(async () => {
    console.log('Removing auth context');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }, []);

  const getToken = useCallback(async () => {
    if (tokenPromiseRef.current) {
      return tokenPromiseRef.current;
    }
    return token || getStorageToken('token');
  }, [token, refresh_token, email, getStorageToken]);

  const refreshAccessToken = useCallback(async () => {
    if (tokenPromiseRef.current) {
      return tokenPromiseRef.current;
    }

    tokenPromiseRef.current = new Promise(async (resolve, reject) => {
      try {
        const refreshStorageToken = refresh_token || localStorage.getItem('refresh_token');
        const emailStorage = email || localStorage.getItem('user');

        if (!refreshStorageToken || !emailStorage) {
          throw new Error('No refresh token available');
        }

        const response = await refreshAxios.post('/usuarios/refresh', {
          refresh_token: refreshStorageToken,
          email: emailStorage
        });
        const { access_token } = response.data;
        setAuthContext(access_token);
        resolve(access_token);
      } catch (error) {
        console.error('Error refreshing token:', error);
        await removeAuthContext();
        reject(error);
      } finally {
        tokenPromiseRef.current = null;
      }
    });

    return tokenPromiseRef.current;
  }, [token, refresh_token, email, setAuthContext, removeAuthContext]);

  const isUserLogged = useCallback(async () => {
    try {
      const token = await getToken();
      if (token && !isTokenExpired(token)) {
        setIsAuthenticated(true);
        return true;
      }
      const newToken = await refreshAccessToken();
      setIsAuthenticated(!!newToken);
      return !!newToken;
    } catch (error) {
      console.error('Error in isUserLogged:', error);
      setIsAuthenticated(false);
      return false;
    }
  }, [getToken, refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ 
      email, 
      token, 
      refresh_token, 
      isUserLogged, 
      setUser, 
      setAuthContext, 
      removeAuthContext, 
      getToken, 
      refreshAccessToken,
      isTokenExpired,
      isAuthenticated,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);