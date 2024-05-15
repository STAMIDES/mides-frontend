import React from 'react';
import LoginComponent from './Login';
import UserList from './components/userList';
import {Box} from "@mui/material";
import SideNavBar from './components/sideNavBar';
import { Route, Routes } from 'react-router-dom';
import Requests from './components/requests';

function App() {
  let loggedIn = true;
  return (
    <div className="app">
      {!loggedIn ? <LoginComponent />
      :<Box display="flex" height="100vh">
      <SideNavBar />
      <Box flex={1}>
          <Routes>
            <Route path="/requests" element={<Requests />} />
            <Route path="/account/login" element={<LoginComponent />} />
            <Route path="/users" element={<UserList/>} />
            //add default route /requests
            <Route path="/" element={<Requests />} />
          </Routes>
      </Box>
    </Box>}
    </div>
  );
}

export default App