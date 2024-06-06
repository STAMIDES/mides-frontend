import React, { useState } from "react";
import { Box, Typography, Avatar, Button, Collapse, List, ListItem, ListItemText } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const SideNavBar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleAdminMouseEnter = () => {
    setAdminMenuOpen(true);
  };

  const handleAdminMouseLeave = () => {
    setAdminMenuOpen(false);
  };

  const menuItems = [
    "Clientes",
    "Pedidos",
    "Planificaciones"
  ];

  const adminSubItems = [
    "Usuarios",
    "Choferes",
    "Camionetas",
    "Lugares Comunes"
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      bgcolor="grey.900"
      p={2}
      height="100vh"
      width="200px" // Ajustar el ancho del menú
    >
      <Box display="flex" flexDirection="column" alignItems="center" width="100%">
        <Avatar
          src="src/imgs/logo_mides.png"
          alt="Logo"
          sx={{ width: 56, height: 56, cursor: "pointer", mb: 4 }}
          onClick={handleLogoClick}
        />
        {menuItems.map((item) => (
          <Link key={item} to={item.toLowerCase()} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
            <Box
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
        <Box
          onMouseEnter={handleAdminMouseEnter}
          onMouseLeave={handleAdminMouseLeave}
          width="100%"
        >
          <Box
            textAlign="left"
            py={1}
            px={2}
            mb={2}
            color="white"
            borderRadius={1}
            transition="background-color 0.3s"
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)"
              },
              "&:active": {
                backgroundColor: "rgba(255, 255, 255, 0.2)"
              }
            }}
          >
            <Typography variant="h6">Administración</Typography>
          </Box>
          <Collapse in={adminMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {adminSubItems.map((subItem) => (
                <Link key={subItem} to={subItem.toLowerCase().replace(' ', '-')} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                  <ListItem button sx={{ pl: 4 }}>
                    <ListItemText primary={subItem} />
                  </ListItem>
                </Link>
              ))}
            </List>
          </Collapse>
        </Box>
      </Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={logout}
        sx={{ mt: 2 }}
      >
        Cerrar Sesión
      </Button>
    </Box>
  );
};

export default SideNavBar;