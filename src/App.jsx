import React from 'react';
import { Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SideNavBar from './components/sideNavBar';
import PedidosRutas from './Pedidos';
import ClientesRutas from './Clientes';
import LoginComponent from './account/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/privateRoute';

function App() {
  const { token } = useAuth();

  return (
    <div className="app">
      <Box display="flex" height="100vh">
        {token && window.location.pathname !== '/login' && <SideNavBar />}
        <Box flex={1}>
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
            <Route path="/" element={<Navigate to="/pedidos" />} />
          </Routes>
        </Box>
      </Box>
    </div>
  );
}

export default App;