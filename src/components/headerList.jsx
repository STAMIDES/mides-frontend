import React from "react";
import { AppBar, Toolbar, Button, Box, InputBase } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Header = (
  { createLink }
) => {
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Link to={createLink}>
        <Button variant="contained" size="small">
          Crear Nuevo
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
                color: "grey",
              }}
            />
            <InputBase
              placeholder="Buscar..."
              fullWidth
              style={{ paddingLeft: 40, backgroundColor: "white", borderRadius: 4 }}
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;