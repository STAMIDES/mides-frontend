import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { api, isPublicPath, setLogoutCallback } from '../network/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Called when user logs out
  const removeAuthContext = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  }, []);

  // Set up the logout callback for axios interceptors
  useEffect(() => {
    setLogoutCallback(removeAuthContext);
  }, [removeAuthContext]);

  const checkSession = useCallback(async () => {
    try {
      if (isPublicPath(window.location.pathname)) {
        return;
      }
      await api.get('/usuarios/check', { withCredentials: true });
      setIsAuthenticated(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Optionally restore "user" from localStorage,
    // but the tokens themselves should now be in cookies only.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(storedUser);
    }
    checkSession();
  }, [checkSession]);

  // Called when user logs in successfully
  const setAuthContext = (username) => {
    setUser(username);
    localStorage.setItem('user', username);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setAuthContext,
        removeAuthContext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);