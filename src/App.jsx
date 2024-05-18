import React from 'react';
import LoginComponent from './account/Login';
import {Box} from "@mui/material";
import SideNavBar from './components/sideNavBar';
import { Route, Routes } from 'react-router-dom';
import PedidosRutas from './Pedidos';
import ClientesRutas from './Clientes';

function App() {
  let loggedIn = true;
  return (
    <div className="app">
      {!loggedIn ? <LoginComponent />
      :<Box display="flex" height="100vh">
      <SideNavBar />
      <Box flex={1}>
          <Routes>
            <Route path="/account*" element={<LoginComponent />} />
            <Route path="/pedidos*" element={<PedidosRutas />} />
            <Route path="/clientes*" element={<ClientesRutas />} />
            <Route path="/" element={<PedidosRutas />} />
          </Routes>
      </Box>
    </Box>}
    </div>
  );
}

export default App