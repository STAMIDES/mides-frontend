import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SideNavBar from './components/sideNavBar';
import SolicitudesRutas from './Pedidos';
import UsuariosRutas from './Clientes';
import AdministracionRutas from './administracion';
import CuentaRutas from './account';
import PlanificacionesRutas from './planificaciones';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/privateRoute';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Path checks
  const pathCuenta = location.pathname.includes('/cuenta');
  const pathVuePlanification = location.pathname.includes('/planificaciones') && 
    (location.pathname.split('/')[2] === 'crear' || /^\d+$/.test(location.pathname.split('/')[2]));

  const rootElement = document.getElementById('root');

  useEffect(() => {
    // Dispatch custom event for route changes
    const event = new CustomEvent('vueRouteChange', { detail: location.pathname });
    window.dispatchEvent(event);
    
    // Adjust root element height based on the current route
    if (pathVuePlanification) {
      rootElement.style.height = '0%';
    } else {
      rootElement.style.height = '100%';
    }
  }, [pathVuePlanification, location.pathname, rootElement]);

  // Handler for sidebar toggle state
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Calculate main content margin based on sidebar state
  const getContentStyles = () => {
    if (pathCuenta || pathVuePlanification) {
      return { 
        width: '100%',
        transition: 'margin-left 0.3s ease-in-out'
      };
    } 
    
    return { 
      marginLeft: sidebarCollapsed ? '0' : '220px', // 14rem = 220px
      width: '100%',
      transition: 'margin-left 0.3s ease-in-out',
      padding: '1rem 1.5rem'
    };
  };

  // Show loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        bgcolor="#f5f5f9"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: '#f5f5f9',
        overflow: 'auto'
      }}
    >
      {isAuthenticated && !pathCuenta && (
        <SideNavBar onToggle={handleSidebarToggle} />
      )}
      
      <Box style={getContentStyles()}> 
        <Routes>
          <Route path="/cuenta/*" element={<CuentaRutas />} />
          <Route path="/usuarios/*" element={
            <PrivateRoute>
              <Box sx={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minHeight: pathVuePlanification ? 'auto' : 'calc(100vh - 2rem)'
              }}>
                <UsuariosRutas />
              </Box>
            </PrivateRoute>
          } />
          <Route path="/solicitudes/*" element={
            <PrivateRoute>
              <Box sx={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minHeight: pathVuePlanification ? 'auto' : 'calc(100vh - 2rem)'
              }}>
                <SolicitudesRutas />
              </Box>
            </PrivateRoute>
          } />
          <Route path="/planificaciones/*" element={
            <PrivateRoute>
              <Box sx={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minHeight: pathVuePlanification ? 'auto' : 'calc(100vh - 2rem)'
              }}>
                <PlanificacionesRutas />
              </Box>
            </PrivateRoute>
          } />
          <Route path="/administracion/*" element={
            <PrivateRoute>
              <Box sx={{ 
                backgroundColor: 'white', 
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                minHeight: pathVuePlanification ? 'auto' : 'calc(100vh - 2rem)'
              }}>
                <AdministracionRutas/>
              </Box>
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/solicitudes" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;