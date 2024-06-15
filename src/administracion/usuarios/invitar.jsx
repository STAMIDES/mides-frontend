import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, Container, Grid, Paper, FormControl, InputLabel } from '@mui/material';
import useApi from '../../network/axios';

const Roles = { 
  operador: 'Administrador',
  chofer: 'Chofer'
};

const UsuarioInvitar = ({ usuario = {} }) => {
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    rol: '',
    ...usuario
  });

  const api = useApi();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('usuarios/invitar', formData);
      console.log('Se ha invitado a ' + nombre, response.data);
      // Opcionalmente redirigir a otra página tras enviar el formulario correctamente
      // history.push('/usuarios'); // Suponiendo que tienes acceso al objeto history
    } catch (error) {
      console.error('Error invitando al usuario:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Invitación de usuario</Typography>
        <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>Al confirmar, se enviará un correo electrónico con un enlace al usuario</Typography>
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
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="rol-label">Tipo de Usuario</InputLabel>
                <Select
                  labelId="rol-label"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  displayEmpty
                >
                  {Object.entries(Roles).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
    </Container>
  );
};

export default UsuarioInvitar;
