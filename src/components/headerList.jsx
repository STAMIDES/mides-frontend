import React, { useState, useCallback, useRef } from "react";
import { AppBar, Toolbar, Button, Box, InputBase } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import {useNavigate, useLocation} from 'react-router-dom';


// Custom debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const Header = ({ createLink = null,
  createMessage = "Crear Nuevo", onSearch }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useRef(
    debounce((value) => {
      onSearch(value);
    }, 500)
  ).current;

  const navigate = useNavigate();


  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleNavigation = () => {
    debugger
    if ( location.pathname.includes('planificaciones')) {
      console.log('planificaciones');
      const event = new CustomEvent('vueRouteChange', { detail: '/planificaciones/crear' });
      window.dispatchEvent(event);
    }
    navigate(createLink);
  };

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        {createLink && (
          <Button variant="contained" size="small" onClick={handleNavigation}>
            {createMessage}
          </Button>
        )}
        <Box flex={1} display="flex" justifyContent="flex-end">
          <Box position="relative" width="100%" maxWidth="400px">
            <SearchIcon
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "black"
              }}
            />
            <InputBase
              placeholder="Buscar..."
              fullWidth
              style={{ paddingLeft: 40, backgroundColor: "#b9c1c087", borderRadius: 4 }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;