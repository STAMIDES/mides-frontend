import React, { useState } from 'react';
import { Box, TextField, Button, Typography, FormControlLabel, Select, MenuItem, Checkbox } from '@mui/material';
import api from '../network/axios';

// Definición del Enum TipoPedido 
const TipoPedido = {
  particular: 'Usuario particular',
  dispositivo: 'Usuario de dispositivo del MIDES',
  salud: 'Centro de salud o rehabilitación'
};

const CrearPedido = ({ pedido = {} }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    direccion_origen: '',
    ventana_destino_fin: '',
    direccion_destino: '',
    prioridad: '',
    acompañante: '',
    observaciones: '',
    ...pedido
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChangeDoc = (e) => {
    const { name, value } = e.target;
    const clientes = api.get(`clientes/doc/${value}`);
  };
  
  const handleChangeNombreoApellido = (e) => {
    const { name, value } = e.target;
    const clientes = api.get(`clientes/nombre/${value}`);
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarDoc()) {
      return;
    }

    const dataToSubmit = {
      ...formData,
      documento: parseInt(formData.documento, 10),
      telefono: parseInt(formData.telefono, 10),
    };

    try {
      const response = await api.post('pedidos', dataToSubmit);
      console.log('Nuevo pedido agregado:', response.data);
      // Opcionalmente redirigir a otra página tras enviar el formulario correctamente
      // history.push('/pedidos'); // Suponiendo que tienes acceso al objeto history
    } catch (error) {
      console.error('Error al agregar pedido:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Agregar Nuevo Pedido</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="nombre"
          label="Nombre"
          value={formData.nombre}
          onChange={handleChangeNombreoApellido}
          fullWidth
          required
        />
        <TextField
          name="apellido"
          label="Apellido"
          value={formData.apellido}
          onChange={handleChangeNombreoApellido}
          fullWidth
          required
        />
        <TextField
          name="documento"
          label="Documento"
          value={formData.documento}
          onChange={handleChangeDoc}
          fullWidth
          required
          error={!!errors.documento}
          helperText={errors.documento}
        />
        <TextField
          name="direccion_origen"
          label="Dirección de Origen"
          value={formData.direccion_origen}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="direccion_destino"
          label="Dirección de Destino"
          value={formData.direccion_destino}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="ventana_destino_fin"
          label="Hora de llegada al destino"
          value={formData.ventana_destino_fin}
          onChange={handleChange}
          fullWidth
        />
        <FormControlLabel
          name="prioridad"
          control={<Checkbox defaultChecked />} 
          label="Prioridad"
          value={formData.prioridad}
          onChange={handleChange}
          required
        />
          <FormControlLabel
          name="acompañante"
          control={<Checkbox defaultChecked />} 
          label="Lleva acompañante"
          value={formData.acompañante}
          onChange={handleChange}
          required
        />
          <TextField
          name="observaciones"
          label="Observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          displayEmpty
          fullWidth
          required
        />
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem' }}>
          Agregar Pedido
        </Button>
      </form>
    </Box>
  );
};

export default CrearPedido;
