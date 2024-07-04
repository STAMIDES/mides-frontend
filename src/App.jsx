import React, {useEffect} from 'react';
import { Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SideNavBar from './components/sideNavBar';
import PedidosRutas from './Pedidos';
import ClientesRutas from './Clientes';
import AdministracionRutas from './administracion';
import CuentaRutas from './account';
import PlanificacionesRutas from './planificaciones';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/privateRoute';

function App() {
  const {  isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const pathCuenta = location.pathname.includes('/cuenta');
  console.log('logged:', isAuthenticated, 'pathCuenta:', pathCuenta)
  return (
    <div className="app">
      <Box display="flex" >
        {isAuthenticated && !pathCuenta && <SideNavBar/>}
        <Box style={pathCuenta ? { width: '100%' } : { marginLeft: '12rem', width: '100%' }}> 
          <Routes>
            <Route path="/cuenta/*" element={<CuentaRutas />} />
            <Route path="/clientes/*" element={
              <PrivateRoute>
                <ClientesRutas />
              </PrivateRoute>
            } />
            <Route path="/pedidos/*" element={
              <PrivateRoute>
                <PedidosRutas />
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
            <Route path="/" element={<Navigate to="/pedidos" />} />
          </Routes>
        </Box>
      </Box>
    </div>
  );
}

export default App;