import React, { useState, useEffect } from "react";
import { Box, Typography, Avatar, Button, List, ListItem, ListItemText, Popper, IconButton } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import useApi from '../network/axios';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardArrowLeftOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const SideNavBar = () => {
  const navigate = useNavigate();
  const { removeAuthContext } = useAuth();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMouseOverSubmenu, setIsMouseOverSubmenu] = useState(false);
  const [hideSideBar, setHideSideBar] = useState(false);
  const [activeItem, setActiveItem] = useState("");

  const api = useApi();
  const location = useLocation();
  const pathVuePlanification = (location.pathname.includes('/planificaciones/') 
    && !location.pathname.includes('/planificaciones/informe')
)

  useEffect(() => {
    if (pathVuePlanification) {
      setHideSideBar(true);
    } else {
      setHideSideBar(false);
    }
    
    // Set active item based on current path
    const currentPath = location.pathname.split('/')[1];
    setActiveItem(currentPath || "");
  }, [pathVuePlanification, location.pathname]);

  const toggleSideBar = () => {
    setHideSideBar(!hideSideBar);
  };

  const handleLogoClick = () => {
    navigate("/");
  };
  
  const logout = async () => {
    try {
      await api.post('usuarios/logout');
      removeAuthContext();
    } catch (error) {
      console.error('Error during logout:', error);
    }
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
    { name: "Usuarios", path: "usuarios" },
    { name: "Solicitudes", path: "solicitudes" },
    { name: "Planificaciones", path: "planificaciones" }
  ];

  const adminSubItems = [
    { name: "Operadores", path: "operadores" },
    { name: "Choferes", path: "choferes" },
    { name: "Camionetas", path: "camionetas" },
    { name: "Lugares Comunes", path: "lugares_comunes" }
  ];

  return (
    <>
    {pathVuePlanification && (
      <IconButton
        onClick={toggleSideBar}
        sx={{
          position: 'fixed',
          top: '1rem',
          left: hideSideBar ? '3rem' : '14rem',
          zIndex: 1301,
          color: 'white',
          bgcolor: '#1e1e2d',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          transition: 'left 0.3s',
          height: '40px',
          width: '40px',
          '&:hover': {
            bgcolor: '#2c2c3e',
          },
        }}
      >
        {hideSideBar ? <MenuIcon /> : <KeyboardArrowLeftOutlinedIcon />}
      </IconButton>
      )}
      <Box
        sx={{
          zIndex: 1300,
          display: hideSideBar ? "none" : "flex",
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: '#1e1e2d',
          width: '220px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          transition: 'transform 0.3s ease-in-out',
          transform: hideSideBar ? 'translateX(-100%)' : 'translateX(0)',
          boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
        }}
      >
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            width: "100%", 
            mt: 3 
          }}
        >
          <Avatar
            src="/imgs/logo_mides_blanco.png"
            alt="Logo"
            sx={{ 
              width: 70, 
              height: 70, 
              cursor: "pointer", 
              mb: 4,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.05)"
              }
            }}
            onClick={handleLogoClick}
          />
          
          <Box sx={{ width: "100%", px: 1 }}>
            {menuItems.map((item) => {
              const isActive = activeItem === item.path;
              return (
                <Link 
                  key={item.name} 
                  to={`/${item.path}`} 
                  style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1.2,
                      px: 2,
                      mb: 1,
                      color: isActive ? "#fff" : "rgba(255, 255, 255, 0.8)",
                      borderRadius: "8px",
                      backgroundColor: isActive ? "rgba(102, 108, 255, 0.9)" : "transparent",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: isActive ? "rgba(102, 108, 255, 0.9)" : "rgba(255, 255, 255, 0.1)",
                        transform: "translateX(5px)"
                      }
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: isActive ? 600 : 400,
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                </Link>
              );
            })}
            
            <Box
              onMouseEnter={handleAdminMouseEnter}
              onMouseLeave={handleAdminMouseLeave}
              width="100%"
              sx={{ position: "relative" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1.2,
                  px: 2,
                  mb: 1,
                  color: activeItem.startsWith("administracion") ? "#fff" : "rgba(255, 255, 255, 0.8)",
                  borderRadius: "8px",
                  backgroundColor: activeItem.startsWith("administracion") ? "rgba(102, 108, 255, 0.9)" : "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: activeItem.startsWith("administracion") ? "rgba(102, 108, 255, 0.9)" : "rgba(255, 255, 255, 0.1)",
                    transform: "translateX(5px)"
                  }
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: activeItem.startsWith("administracion") ? 600 : 400,
                    fontSize: "0.95rem"
                  }}
                >
                  Administración
                </Typography>
                <ArrowForwardIosIcon 
                  sx={{ 
                    fontSize: "0.75rem", 
                    transition: "transform 0.3s",
                    transform: adminMenuOpen ? "rotate(90deg)" : "rotate(0)"
                  }} 
                />
              </Box>
              <Popper 
                open={adminMenuOpen} 
                anchorEl={anchorEl} 
                placement="right-start"
                onMouseEnter={handleSubmenuMouseEnter} 
                onMouseLeave={handleSubmenuMouseLeave}
                sx={{ zIndex: 1400 }}
              >
                <Box 
                  sx={{ 
                    bgcolor: "#2a2a3c", 
                    color: "white", 
                    borderRadius: "8px", 
                    py: 1,
                    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                    width: "180px",
                    mt: -1
                  }}
                >
                  <List sx={{ p: 0 }}>
                    {adminSubItems.map((subItem) => {
                      const subPath = `administracion/${subItem.path}`;
                      const isSubActive = location.pathname.includes(subPath);
                      
                      return (
                        <Link 
                          key={subItem.name} 
                          to={`/${subPath}`} 
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <ListItem 
                            sx={{
                              transition: "all 0.2s",
                              backgroundColor: isSubActive ? "rgba(102, 108, 255, 0.5)" : "transparent",
                              "&:hover": {
                                backgroundColor: isSubActive ? "rgba(102, 108, 255, 0.7)" : "rgba(255, 255, 255, 0.1)",
                                paddingLeft: "20px"
                              },
                              py: 0.5
                            }}
                          >
                            <ListItemText 
                              primary={subItem.name} 
                              primaryTypographyProps={{ 
                                fontSize: "0.9rem",
                                fontWeight: isSubActive ? 500 : 400
                              }} 
                            />
                          </ListItem>
                        </Link>
                      );
                    })}
                  </List>
                </Box>
              </Popper>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ width: "100%", p: 2 }}>
          <Button
            variant="contained"
            onClick={logout}
            fullWidth
            sx={{ 
              mb: 2,
              py: 1,
              textTransform: "none",
              backgroundColor: "rgba(255, 76, 76, 0.8)",
              borderRadius: "8px",
              transition: "all 0.3s",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "rgba(255, 76, 76, 1)",
                boxShadow: "0 4px 12px rgba(255, 76, 76, 0.3)"
              },
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default SideNavBar;
