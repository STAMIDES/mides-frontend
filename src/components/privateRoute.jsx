import React, {useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { isUserLogged } = useAuth();
  
  let  isAuthenticated = false;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[PrivateRoute] Checking auth')
        await isUserLogged();
        isAuthenticated = true;
      } catch (error) {
        isAuthenticated = false;
      } 
    };
    
    checkAuth();
  }, [isUserLogged]);

  console.log('[PrivateRoute] isAuthenticated:', isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/cuenta/login" />;
};

export default PrivateRoute;