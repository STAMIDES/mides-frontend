import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Button, List, ListItem, ListItemText, Popper, IconButton } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import useApi from '../network/axios';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardArrowLeftOutlined';
const SideNavBar = () => {
  const navigate = useNavigate();
  const { refresh_token, email, removeAuthContext } = useAuth();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMouseOverSubmenu, setIsMouseOverSubmenu] = useState(false);
  const [hideSideBar, setHideSideBar] = useState(false);

  const api = useApi();
  const location = useLocation();
  const pathVuePlanification = location.pathname.includes('/planificaciones/crear');

  useEffect(() => {
    if (pathVuePlanification) {
      setHideSideBar(true);
    } else {
      setHideSideBar(false);
    }
  }, [pathVuePlanification]);

  const toggleSideBar = () => {
    setHideSideBar(!hideSideBar);
  };

  const handleLogoClick = () => {
    navigate("/");
  };
  const logout = async () => {
    try {
      if (email && refresh_token) {
        await api.post('usuarios/logout', { 
          email: email, 
          refresh_token: refresh_token 
        });
        removeAuthContext();
      }else{
        removeAuthContext();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } }
  
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
    "Usuarios",
    "Solicitudes",
    "Planificaciones"
  ];

  const adminSubItems = [
    "Operadores",
    "Choferes",
    "Camionetas",
    "Lugares Comunes"
  ];

  return (
    <>
      {pathVuePlanification && (
        <IconButton
          onClick={toggleSideBar}
          sx={{
            position: 'fixed',
            top: '1rem',
            left: hideSideBar ? '3rem' : '13rem',
            zIndex: 1301,
            color: 'white',
            bgcolor: 'grey.900',
            '&:hover': {
              bgcolor: 'grey.800',
            },
          }}
        >
          {hideSideBar ? <MenuIcon /> : <KeyboardArrowLeftOutlinedIcon />}
        </IconButton>
      )}
      <Box
        display={hideSideBar ? "none" : "flex"}
        zIndex={1300}
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="grey.900"
        width="12rem"
        height="100vh"
        position="fixed"
        top='0'
        left='0'
        sx={{
          transition: 'all 0.3s',
          transform: hideSideBar ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" style={{ marginTop: '2rem'}}>
          <Avatar
            src="/src/imgs/logo_mides.png"
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
                  <Link key={subItem} to={"administracion/"+subItem.toLowerCase().replace(' ', '_')} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
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
          sx={{ mt: 2, mb: 2 }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </>
  );
};

export default SideNavBar;