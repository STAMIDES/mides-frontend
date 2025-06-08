import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, Container, Grid, Paper, FormControl, InputLabel, Alert } from '@mui/material';
import useApi from '../../network/axios';


const OperadorInvitar = ({ usuario = {} }) => {
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    ...usuario
  });
  const [message, setMessage] = useState(null); 
  const api = useApi();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('usuarios/invitar', formData);
      setMessage({ type: 'success', text: 'Usuario invitado correctamente' });
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        setMessage({ type: 'error', text: error.response.data.detail });
      } else {
        setMessage({ type: 'error', text: 'Error invitando al usuario '+ nombre });
      }
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Invitación para nuevo operador de la aplicación</Typography>
        <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>Al confirmar, se enviará un correo electrónico con un enlace al nuevo operador</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Correo Electrónico"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre"
                label="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            {message && (
              <Alert severity={message.type} sx={{  ml:3 , mt: 3}}>
                {message.text}
              </Alert>
            )}
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ mt: 3, py: 1.5, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#115293' } }}
              >
                Invitar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

export default OperadorInvitar;
