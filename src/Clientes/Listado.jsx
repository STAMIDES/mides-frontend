import React from "react";
import { Container, Paper, Box, Grid, Avatar, Typography, IconButton, Button } from "@mui/material";
// import { DeleteIcon } from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import Header from "../components/headerList";
//add email to clients
const clients = [
  { name: "John", surname: "Doe",    cedula: "12345678" , email: "johndoe@gmail.com"},
  { name: "Jane", surname: "Smith",  cedula: "87654321" , email: "janet@gmail.com"},
  { name: "Bob", surname: "Johnson", cedula: "4730435-2" , email: "bobi@hotmail.com" }
];

const ClienteListado = () => {
  console.log(clients)
  return (
    <Container>
      <Header createLink="/clientes/crear" />
      <Box mt={2}>
        <Paper elevation={2} style={{ padding: "16px" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Clientes</Typography>
            <Button variant="outlined" size="small">
              View All
            </Button>
          </Box>
          <Box mt={2}>
            <Grid container spacing={2}>
              {clients.map((client, index) => (
                <Grid item xs={12} key={index}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <Avatar alt="Cliente Avatar" src="/placeholder.svg" />
                      <Box ml={2}>
                        <Typography variant="body1">{client.name + ' ' + client.surname}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {client.cedula}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {client.email}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ClienteListado;