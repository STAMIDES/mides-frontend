import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem } from '@mui/material';
import api from '../network/axios';

// Definición del Enum TipoCliente 
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validarDoc = () => {
    let tempErrors = {};
    if (!formData.documento) {
      tempErrors.documento = 'Documento es requerido';
    } else if (isNaN(formData.documento)) {
      tempErrors.documento = 'Documento debe ser un número';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const validarTel = () => {
    let tempErrors = {};
    if (isNaN(formData.telefono )) {
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
    <Box>
      <Typography variant="h4" gutterBottom>Agregar Nuevo Cliente</Typography>
      <form onSubmit={handleSubmit}>
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
        <TextField
          name="nombre"
          label="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          name="apellido"
          label="Apellido"
          value={formData.apellido}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          name="telefono"
          label="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="observaciones"
          label="Observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          fullWidth
        />
        <Select
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          displayEmpty
          fullWidth
          required
        >
          <MenuItem value="" disabled>
            Seleccionar Tipo de Cliente
          </MenuItem>
          {Object.entries(TipoCliente).map(([key, value]) => (
            <MenuItem key={key} value={key}>
              {value}
            </MenuItem>
          ))}
        </Select>
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem' }}>
          Agregar Cliente
        </Button>
      </form>
    </Box>
  );
};

export default CrearCliente;
