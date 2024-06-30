import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
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
  const getStorageToken = async (tokenKey) => {
    const token = localStorage.getItem(tokenKey);
    console.log('Token from storage:', token);
    return isTokenExpired(token) ? null : token;
  };
  const [token, setToken] = useState(null);
  const [refresh_token, setRefreshToken] = useState(null);
  const [email, setUser] = useState(null);
  const tokenPromiseRef = useRef(null);

  // useEffect(() => {
  //   if (token) {
  //     try {
  //       const decoded = jwtDecode(token);
  //       console.log('Decoded token:', decoded);
  //       setUser(decoded.sub);
  //     } catch (error) {
  //       console.error('Error decoding user info from token:', error);
  //       setUser(null);
  //     }
  //   } 
  // }, [token]);

  console.log("Token:", token)

  useEffect(() => {
    const initializeToken = async () => {
      const storageToken = await getStorageToken('token');
      console.log('Token from storage1:', storageToken);
      setToken(storageToken);
      const storageRefreshToken = await getStorageToken('refresh_token');
      console.log('Token from storage2:', storageToken);
      setRefreshToken(storageRefreshToken);
    };
    initializeToken();
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
  };

  const getToken = async () => {
    console.log('Token:', token, 'Refresh Token:', refresh_token, 'Email:', email)
    if (tokenPromiseRef.current) {
      return tokenPromiseRef.current;
    }
    if (!token) {
    const storageToken = await getStorageToken('token');
    if (storageToken) {
      setToken(storageToken);
      return storageToken;
    }
      return Promise.reject(new Error('No valid token available'));
    }
    if (!isTokenExpired(token)) {
      return Promise.resolve(token);
    } else {
      return Promise.reject(new Error('No valid token available'));
    }
  };
  const refreshAccessToken = async () => {
    if (tokenPromiseRef.current) {
      return tokenPromiseRef.current;
    }

    tokenPromiseRef.current = new Promise(async (resolve, reject) => {
      try {
        console.log('Token:', token, 'Refresh Token:', refresh_token, 'Email:', email)
        if (!refresh_token) {
          const refreshStorageToken = await getStorageToken('refresh_token');
          const emailStorage = localStorage.getItem('user');
          if (refreshStorageToken) {  
            setRefreshToken(refreshStorageToken);
            const response = await refreshAxios.post('/usuarios/refresh', {
              refresh_token: refreshStorageToken,
              email: emailStorage
            });
            const { access_token } = response.data;
          
            setAuthContext(access_token);
            resolve(access_token);
          }else{
            removeAuthContext();
            reject(new Error('No refresh token available'));
            return;
          }
        }else{
          let emailStorage= '';
          if (!email) {
            let emailStorage = localStorage.getItem('user');
            setUser(emailStorage);
          }
          const response = await refreshAxios.post('/usuarios/refresh', {
            refresh_token: refresh_token,
            email: email? email : emailStorage
          });
          
          const { access_token } = response.data;
          
          setAuthContext(access_token);
          resolve(access_token);
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        removeAuthContext();
        reject(error);
      } finally {
        tokenPromiseRef.current = null;
      }
    });

    return tokenPromiseRef.current;
  };

  return (
    <AuthContext.Provider value={{ email, token, refresh_token, setUser, setAuthContext, removeAuthContext, getToken, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};