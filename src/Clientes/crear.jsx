import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, Container, Grid, Paper, FormControl, InputLabel } from '@mui/material';
import useApi from '../network/axios';

const TipoCliente = {
  particular: 'Usuario particular',
  dispositivo: 'Usuario de dispositivo del MIDES',
  salud: 'Centro de salud o rehabilitación'
};

const CrearCliente = ({ cliente = {} }) => {
  const [formData, setFormData] = useState({
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    observaciones: '',
    tipo: '',
    ...cliente
  });

  const [errors, setErrors] = useState({});
  const api = useApi();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validarDoc = () => {
    let tempErrors = {};
    if (!formData.documento) {
      tempErrors.documento = 'Documento es requerido';
    } else if (isNaN(formData.documento)) {
      tempErrors.documento = 'Documento debe ser un número, No debe contener puntos, guiones ni digito verificador';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validarTel = () => {
    let tempErrors = {};
    if (isNaN(formData.telefono)) {
      tempErrors.telefono = 'Telefono debe ser un número';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarDoc() || !validarTel()) {
      return;
    }

    const dataToSubmit = {
      ...formData,
      documento: parseInt(formData.documento, 10),
      telefono: parseInt(formData.telefono, 10),
    };

    try {
      const response = await api.post('clientes', dataToSubmit);
      console.log('Nuevo cliente agregado:', response.data);
      // Opcionalmente redirigir a otra página tras enviar el formulario correctamente
      // history.push('/clientes'); // Suponiendo que tienes acceso al objeto history
    } catch (error) {
      console.error('Error al agregar cliente:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Agregar Nuevo Cliente</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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
            <Grid item xs={12} sm={6}>
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
                error={!!errors.documento}
                helperText={errors.documento}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="direccion"
                label="Direccion"
                value={formData.direccion}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="telefono"
                label="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                fullWidth
                error={!!errors.telefono}
                helperText={errors.telefono}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="observaciones"
                label="Observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="tipo-label">Tipo de Cliente</InputLabel>
                <Select
                  labelId="tipo-label"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  displayEmpty
                >

                  {Object.entries(TipoCliente).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Agregar Cliente
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CrearCliente;
