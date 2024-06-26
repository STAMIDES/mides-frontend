import React from "react";
import { AppBar, Toolbar, Button, Box, InputBase } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Header = (
  { createLink, createMessage = "Crear Nuevo"}
) => {
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Link to={createLink}>
        <Button variant="contained" size="small">
          {createMessage}
        </Button>
        </Link>
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
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;