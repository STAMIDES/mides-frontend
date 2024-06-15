import React, { createContext, useState, useEffect, useContext } from 'react';
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

  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('refresh_token');
  });

  const login = (newToken, newRefreshToken) => {
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('refresh_token', newRefreshToken);
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token'); 
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
