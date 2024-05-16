import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const SideNavBar = () => {
  const navigate = useNavigate();

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
  );
};

export default SideNavBar;