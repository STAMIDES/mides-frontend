import React, { useState } from "react";
import { Box, Typography, Avatar, Button, List, ListItem, ListItemText, Popper } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const SideNavBar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMouseOverSubmenu, setIsMouseOverSubmenu] = useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleAdminMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
    setAdminMenuOpen(true);
  };

  const handleAdminMouseLeave = () => {
    if (!isMouseOverSubmenu) {
      setAdminMenuOpen(false);
    }
  };
  const handleSubmenuMouseEnter = () => {
    setIsMouseOverSubmenu(true);
  };
  
  const handleSubmenuMouseLeave = () => {
    setIsMouseOverSubmenu(false);
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
          <Popper 
            open={adminMenuOpen} 
            anchorEl={anchorEl} 
            placement="right-start"
            onMouseEnter={handleSubmenuMouseEnter} 
            onMouseLeave={handleSubmenuMouseLeave}
            style={{ zIndex: 1300 }}
          >
            <Box bgcolor="grey.800" color="white" borderRadius={1} p={1} boxShadow={5}>
              <List component="nav">
                {adminSubItems.map((subItem) => (
                  <Link key={subItem} to={subItem.toLowerCase().replace(' ', '-')} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                    <ListItem button>
                      <ListItemText primary={subItem} />
                    </ListItem>
                  </Link>
                ))}
              </List>
            </Box>
          </Popper>
        </Box>
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