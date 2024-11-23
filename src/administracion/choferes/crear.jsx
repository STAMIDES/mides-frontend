import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Grid, Paper, Alert } from '@mui/material';
import useApi from '../../network/axios';

const ChoferesCrear = ({ chofer = {} }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    ...chofer
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
      const response = await api.post('choferes', formData);
      setMessage({ type: 'success', text: 'Chofer creado correctamente' });
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        setMessage({ type: 'error', text: error.response.data.detail });
      } else {
        setMessage({ type: 'error', text: 'Error creando el chofer' });
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Crear Chofer</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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
              <TextField
                name="apellido"
                label="Apellido"
                value={formData.apellido}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="documento"
                label="Documento"
                value={formData.documento}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="telefono"
                label="Telefono"
                value={formData.telefono}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
              {message && (
                <Alert severity={message.type} sx={{  ml:3, mt: 3}}>
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
                Crear
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ChoferesCrear;
