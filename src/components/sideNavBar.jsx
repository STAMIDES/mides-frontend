import React from "react";
import { Box, IconButton, Typography, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SideNavBar = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      bgcolor="grey.900"
      p={2}
      height="100vh"
    >
      <Avatar
        src="src/imgs/logo_mides.png"
        alt="Logo"
        sx={{ width: 56, height: 56, cursor: "pointer", mb: 4, alignSelf: "center"}}
        onClick={handleLogoClick}
      />
      {[
       "Pedidos", 
       "Planificaciones", 
       "Usuarios", 
       "Camionetas"
    ].map((elem) => (
        <IconButton
        key={elem}
        size="large"
        color="default"
        sx={{
          color: 'white',
          mb: 2,
          borderRadius: '4px', // Set a border radius for rounded corners
          transition: 'background-color 0.3s',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.4)', // Darker when clicked
          },
        }}
      >
          <Typography variant="h6">{elem}</Typography>
        </IconButton>
      ))}
    </Box>
  );
};

export default SideNavBar;