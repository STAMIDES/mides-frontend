import React, {useEffect} from 'react';
import { Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SideNavBar from './components/sideNavBar';
import PedidosRutas from './Pedidos';
import ClientesRutas from './Clientes';
import UsuariosRutas from './administracion/usuarios';
import CuentaRouter from './account';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/privateRoute';

function App() {
  const {  isUserLogged } = useAuth();
  const location = useLocation();
  const pathCuenta = location.pathname.includes('/cuenta');
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await isUserLogged();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [isUserLogged]);
  console.log('logged:', isAuthenticated, 'pathCuenta:', pathCuenta)
  return (
    <div className="app">
      <Box display="flex" >
        {isAuthenticated && !pathCuenta && <SideNavBar/>}
        <Box style={pathCuenta ? { width: '100%' } : { marginLeft: '12rem', width: '100%' }}> 
          <Routes>
            <Route path="/cuenta/*" element={<CuentaRouter />} />
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