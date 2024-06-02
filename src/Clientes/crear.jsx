import React, { useState } from 'react';
import { TextField, Button, Typography, Select, MenuItem, Container, FormLabel, FormGroup, FormControlLabel, 
  Checkbox, Grid, Paper, FormControl, InputLabel } from '@mui/material';
import api from '../network/axios';

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
    caracteristicasCliente: [],
    observaciones: '',
    tipo: '',
    ...cliente
  });

  const [errors, setErrors] = useState({});
  const [caracteristicasTodas, setCaracteristicasTodas] = useState(['ciego', 'silla de ruedas', 'muletas', 'bastón', 'audífono', 'perro guía', 'acompañante']); 
  //fixme hacer el get de las caracteristicas y el index para el checkeo y agregado a caracteristicasCliente pasa a ser el id de la base de datos
  const [caracteristicasCliente, setCaracteristicasCliente] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validarDoc = () => {
    let tempErrors = {};
    if (!formData.documento) {
      tempErrors.documento = 'Documento es requerido';
    } else if (isNaN(formData.documento)) {
      tempErrors.documento = 'Documento debe ser un número, No debe contener puntos, guiones ni dígito verificador';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validarTel = () => {
    let tempErrors = {};
    if (isNaN(formData.telefono)) {
      tempErrors.telefono = 'Teléfono debe ser un número';
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
      caracteristicasCliente: caracteristicasCliente
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

  const handleCheckboxChange = (value) => {
    setCaracteristicasCliente((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
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
                label="Dirección"
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
              <FormControl component="fieldset">
                <FormLabel component="legend">Caracteristicas</FormLabel>
                <FormGroup row>
                  {caracteristicasTodas.map((value, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={caracteristicasCliente.includes(index)}
                          onChange={() => handleCheckboxChange(index)}
                        />
                      }
                      label={value}
                    />
                  ))}
                </FormGroup>
              </FormControl>
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
