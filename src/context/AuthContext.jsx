import React, { createContext, useState, useEffect, useContext, useRef, useCallback  } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const isTokenExpired = (token) => {
  if (!token) return true;
  const { exp } = jwtDecode(token);
  if (!exp) return true;
  console.log(Date.now(), exp * 1000, Date.now() >= exp * 1000);
  return Date.now() >= exp * 1000;
};

const AuthContext = createContext();

// Create a separate axios instance for refresh requests
const refreshAxios = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const getStorageToken = (tokenKey) => {
    const value = localStorage.getItem(tokenKey);
    console.log('Token from storage:', value);
    if (value && !isTokenExpired(value)){
      return value;
    }else{
      return null;
    }
  };
  const [token, setToken] = useState(null);
  const [refresh_token, setRefreshToken] = useState(null);
  const [email, setUser] = useState(null);
  const tokenPromiseRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    console.log("Initializing auth context")
    const initializeToken = async () => {
      const storageToken = getStorageToken('token');
      console.log('Token from storage1:', storageToken);
      if (isMounted && storageToken) {
        setToken(storageToken);
      }
      const storageRefreshToken = getStorageToken('refresh_token');
      console.log('Token from storage2:', storageToken);
      if (isMounted && storageRefreshToken) {
      setRefreshToken(storageRefreshToken);
      }
      const user = localStorage.getItem('user');
      console.log('User from storage:', user);
      if (isMounted && user) {
        setUser(user);
      }
    };
    initializeToken();
    return () => {
      isMounted = false;
    };
  }, []);

  const setAuthContext = (newToken, newRefreshToken = null, user = null) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
      localStorage.setItem('refresh_token', newRefreshToken);
    }
    if (user) {
      setUser(user);
      localStorage.setItem('user', user);
    }
  };

  const removeAuthContext = async () => {
    console.log('Removing auth context');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  const getToken = useCallback(async () => {
    console.log('Token:', token, 'Refresh Token:', refresh_token, 'Email:', email);
    if (tokenPromiseRef.current) {
      return tokenPromiseRef.current;
    }
    return token || getStorageToken('token');
  }, [token, refresh_token, email]);

  const refreshAccessToken = useCallback(async () => {
    if (tokenPromiseRef.current) {
      return tokenPromiseRef.current;
    }

    tokenPromiseRef.current = new Promise(async (resolve, reject) => {
      try {
        console.log('Token:', token, 'Refresh Token:', refresh_token, 'Email:', email);
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
        console.log('Error refreshing token:', error);
        removeAuthContext();
        reject(error);
      } finally {
        tokenPromiseRef.current = null;
      }
    });

    return tokenPromiseRef.current;
  }, [token, refresh_token, email]);

  const isUserLogged = useCallback(async () => {
    try {
      debugger
      const token = await getToken();
      console.log("[isUserLogged] token:", token)
      if (token) return;
      return await refreshAccessToken();
    } catch (error) {
      console.error('Error in isUserLogged:', error);
      throw error;
    }
  }, [token, refresh_token, email]);

  return (
    <AuthContext.Provider value={{ email, token, refresh_token, isUserLogged, setUser, setAuthContext, removeAuthContext, getToken, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};