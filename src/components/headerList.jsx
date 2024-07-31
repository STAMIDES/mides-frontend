import React, { useState, useCallback, useRef } from "react";
import { AppBar, Toolbar, Button, Box, InputBase } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";

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
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useRef(
    debounce((value) => {
      onSearch(value);
    }, 500)
  ).current;

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        {createLink && (
        <Link to={createLink}>
          <Button variant="contained" size="small">
            {createMessage}
          </Button>
        </Link>
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