import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import {jwtDecode} from 'jwt-decode';

const isTokenExpired = (token) => {
  if (!token) return true;

  const { exp } = jwtDecode(token);
  if (!exp) return true;
  console.log(Date.now(), exp * 1000, Date.now() >= exp * 1000);
  return Date.now() >= exp * 1000;
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const token = localStorage.getItem('token');
    return isTokenExpired(token) ? null : token;
  });

  const [refresh_token, setRefreshToken] = useState(() => {
    return localStorage.getItem('refresh_token');
  });
  const [email, setUser] = useState(null);
  const callbackRef = useRef(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ email: decoded.sub }); 
      } catch (error) {
        console.error('Error decoding user info from token:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken, refresh_token=null, callback=null) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    if (refresh_token) {
      setRefreshToken(refresh_token);
      localStorage.setItem('refresh_token', refresh_token);
    }
    if (callback) {
      callbackRef.current = callback;
    }
  };
  useEffect(() => {
    if (token && (refresh_token || !refresh_token) && callbackRef.current) {
      callbackRef.current();
      callbackRef.current = null; // Clear the callback after invocation
    }
  }, [token, refresh_token]);

  const removeAuthContext = async () => {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem('token'); 
      localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ email, token, refresh_token, isTokenExpired, login, removeAuthContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
