import React from 'react';
import LoginComponent from './Login';
import {Box} from "@mui/material";
import SideNavBar from './components/sideNavBar';
import { Route, Routes } from 'react-router-dom';
import Requests from './components/requests';
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
            <Route path="/pedidos*" element={<Requests />} />
            <Route path="/clientes*" element={<ClientesRutas />} />
            <Route path="/" element={<Requests />} />
          </Routes>
      </Box>
    </Box>}
    </div>
  );
}

export default App