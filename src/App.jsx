import React, {useEffect} from 'react';
import { Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SideNavBar from './components/sideNavBar';
import SolicitudesRutas from './Pedidos';
import UsuariosRutas from './Clientes';
import AdministracionRutas from './administracion';
import CuentaRutas from './account';
import PlanificacionesRutas from './planificaciones';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/privateRoute';

function App() {
  const {  isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const pathCuenta = location.pathname.includes('/cuenta');
  const pathVuePlanification = location.pathname.includes('/planificaciones/crear');
  const rootElement = document.getElementById('root');

  useEffect(() => {
    const event = new CustomEvent('vueRouteChange', { detail: location.pathname });
    window.dispatchEvent(event);
    if (pathVuePlanification) {
      rootElement.style.height = '0%';
    } else {
      rootElement.style.height = '100%';
    }
  }, [pathVuePlanification]);

  console.log('logged:', isAuthenticated, 'pathCuenta:', pathCuenta)
  return (
    <Box display="flex" style={{ width: '100%', height: '100%' }}>
      {isAuthenticated && !pathCuenta && <SideNavBar/>}
      <Box style={pathCuenta || pathVuePlanification? { width: '100%' } : { marginLeft: '12rem', width: '100%' }}> 
        <Routes>
          <Route path="/cuenta/*" element={<CuentaRutas />} />
          <Route path="/usuarios/*" element={
            <PrivateRoute>
              <UsuariosRutas />
            </PrivateRoute>
          } />
          <Route path="/solicitudes/*" element={
            <PrivateRoute>
              <SolicitudesRutas />
            </PrivateRoute>
          } />
          <Route path="/planificaciones/*" element={
            <PrivateRoute>
              <PlanificacionesRutas />
            </PrivateRoute>
          } />
          <Route path="/administracion/*" element={
            <PrivateRoute>
              <AdministracionRutas/>
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/solicitudes" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;