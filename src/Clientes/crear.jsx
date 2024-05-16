import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem } from '@mui/material';
import axios from 'axios';

// Definición del Enum TipoPersona
const TipoPersona = {
  PARTICULAR: 'Usuario particular',
  DISPOSITIVO: 'Usuario de dispositivo del MIDES',
  SALUD: 'Centro de salud o rehabilitación'
};

const CrearCliente = ({ cliente = {} }) => {
  const [formData, setFormData] = useState({
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    observaciones: '',
    tipo_persona: '',
    ...cliente
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/personas', formData);
      console.log('Nueva persona agregada:', response.data);
      // Opcionalmente redirigir a otra página tras enviar el formulario correctamente
      // history.push('/clientes'); // Suponiendo que tienes acceso al objeto history
    } catch (error) {
      console.error('Error al agregar persona:', error);
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
          name="observaciones"
          label="Observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          fullWidth
        />
        <Select
          name="tipo_persona"
          value={formData.tipo_persona}
          onChange={handleChange}
          displayEmpty
          fullWidth
          required
        >
          <MenuItem value="" disabled>
            Seleccionar Tipo de Persona
          </MenuItem>
          {Object.entries(TipoPersona).map(([key, value]) => (
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
