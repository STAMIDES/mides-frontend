import React from "react";
import { Container, Paper, Box, Grid, Avatar, Typography, IconButton, Button } from "@mui/material";
// import { DeleteIcon } from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import Header from "./headerList";
//add email to users
const users = [
  { name: "John", surname: "Doe",    cedula: "12345678" , email: "johndoe@gmail.com"},
  { name: "Jane", surname: "Smith",  cedula: "87654321" , email: "janet@gmail.com"},
  { name: "Bob", surname: "Johnson", cedula: "4730435-2" , email: "bobi@hotmail.com" }
];

const UserList = () => {
  console.log(users)
  return (
    <Container>
      <Header />
      <Box mt={2}>
        <Paper elevation={2} style={{ padding: "16px" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Usuarios</Typography>
            <Button variant="outlined" size="small">
              View All
            </Button>
          </Box>
          <Box mt={2}>
            <Grid container spacing={2}>
              {users.map((user, index) => (
                <Grid item xs={12} key={index}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <Avatar alt="User Avatar" src="/placeholder.svg" />
                      <Box ml={2}>
                        <Typography variant="body1">{user.name + ' ' + user.surname}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.cedula}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.email}
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

export default UserList;