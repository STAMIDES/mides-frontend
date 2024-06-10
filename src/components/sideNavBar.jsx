import React from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const SideNavBar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogoClick = () => {
    navigate("/");
  };

  const menuItems = [
    "Pedidos",
    "Planificaciones",
    "Clientes",
    "Camionetas"
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      bgcolor="grey.900"
      width="12rem"
      height="100vh"
      position="fixed"
      top='0'
      left='0'
    >
      <Box display="flex" flexDirection="column" alignItems="center" style={{ marginTop: '2rem'}}>
        <Avatar
          src="src/imgs/logo_mides.png"
          alt="Logo"
          sx={{ width: 56, height: 56, cursor: "pointer", mb: 4 }}
          onClick={handleLogoClick}
        />
        {menuItems.map((item) => (
          <Link key={item} to={item.toLowerCase()} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
            <Box
              key={item}
              textAlign="left"
              py={1}
              px={2}
              mb={2}
              color="white"
              borderRadius={1}
              transition="background-color 0.3s"
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                },
                "&:active": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)"
                }
              }}
            >
              <Typography variant="h6">{item}</Typography>
            </Box>
          </Link>
        ))}
      </Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={logout}
        sx={{ mt: 2 }}
        style={{    padding: '0.5rem',
          marginBottom: '2rem'}}
      >
        Cerrar Sesión
      </Button>
    </Box>
  );
};

export default SideNavBar;
