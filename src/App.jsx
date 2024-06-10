import React from 'react';
import { Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SideNavBar from './components/sideNavBar';
import PedidosRutas from './Pedidos';
import ClientesRutas from './Clientes';
import UsuariosRutas from './administracion/usuarios';
import LoginComponent from './account/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/privateRoute';

function App() {
  const { token } = useAuth();
  const location = useLocation();
  return (
    <div className="app">
      <Box display="flex" >
        {token && location.pathname !== '/login' && <SideNavBar/>}
        <Box style={{marginLeft:"12rem", width: '100%'}}>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/pedidos/*" element={
              <PrivateRoute>
                <PedidosRutas />
              </PrivateRoute>
            } />
            <Route path="/clientes/*" element={
              <PrivateRoute>
                <ClientesRutas />
              </PrivateRoute>
            } />
            <Route path="/usuarios/*" element={
              <PrivateRoute>
                <UsuariosRutas/>
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