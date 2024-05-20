import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, FormControlLabel, Checkbox, Autocomplete } from '@mui/material';
import api from '../network/axios';

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
  const [documentOptions, setDocumentOptions] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);

  const handleChange = (e, value, reason) => {
    if (reason === 'selectOption') {
      setFormData({ ...formData, ...value });
    } else {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    }
  };

  const fetchDocuments = async (input) => {
    if (input.length > 2) {
      try {
        const response = await api.get(`clientes/doc/${input}`);
        const clientesDoc = response.data.clientes.map((cliente) => `${cliente.documento}`);
        console.log(clientesDoc)
        setDocumentOptions(clientesDoc);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    }
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
  }
  const fetchNames = async (input) => {
    if (input.length > 2) {
      try {
        const response = await api.get(`clientes/nombre/${input}`);
        const clienteNombres = response.data.clientes.map((cliente) => `${cliente.nombre} ${cliente.apellido}`);
        setNameOptions(clienteNombres);
      } catch (error) {
        console.error('Error fetching names:', error);
      }
    }
  };

  const handleInputDocumentChange = (event, value) => {
    fetchDocuments(value);
  };

  const handleInputNameChange = (event, value) => {
    fetchNames(value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Agregar Nuevo Pedido</Typography>
      <form onSubmit={handleSubmit}>
        <Autocomplete
          freeSolo
          options={nameOptions}
          getOptionLabel={(option) => option}
          onInputChange={handleInputNameChange}
          onChange={(event, value) => handleChange(event, value, 'selectOption')}
          renderInput={(params) => (
            <TextField
              {...params}
              name="nombre"
              label="Nombre"
              fullWidth
              required
            />
          )}
        />
        <Autocomplete
          freeSolo
          options={documentOptions}
          getOptionLabel={(option) => option}
          onInputChange={handleInputDocumentChange}
          onChange={(event, value) => handleChange(event, value, 'selectOption')}
          renderInput={(params) => (
            <TextField
              {...params}
              name="documento"
              label="Documento"
              fullWidth
              required
              error={!!errors.documento}
              helperText={errors.documento}
            />
          )}
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