import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, FormControlLabel, Checkbox, Autocomplete, Container, Grid, Paper } from '@mui/material';
import api from '../network/axios';

const CrearPedido = () => {
  const [formData, setFormData] = useState({
      nombre: '',
      apellido: '',
      documento: '',
      direccion_origen: '',
      ventana_origen_inicio: '',
      ventana_origen_fin: '',
      direccion_destino:  '',
      ventana_destino_inicio: '',
      ventana_destino_fin:  '',
      prioridad: false,
      acompañante: false,
      observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [documentOptions, setDocumentOptions] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [apellidoOptions, setSurnameOptions] = useState([]);

  const handleChange = (e, value, reason) => {
    if (reason === 'selectOption') {
      setFormData({ ...formData, ...value });
    } else {
      const { name, value, checked } = e.target;
      setFormData({ ...formData, [name]: name === 'acompañante' || name === 'prioridad' ? checked : value });
    }
  };

  const castDocuments = (clients) => {
    return clients.map((client) => ({
      ...client,
      documento: `${client.documento.toString()}`,
    }));
  }
  const fetchDocuments = async (input) => {
    if (input.length > 2) {
      try {
        const response = await api.get(`clientes/doc/${input}`);
        const clients = castDocuments(response.data.clientes);
        setDocumentOptions(clients);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    } else {
      setDocumentOptions([]);
    }
  };

  const fetchNames = async (input) => {
    if (input.length > 2) {
      try {
        const response = await api.get(`clientes/nombre/${input}`);
        const clients = castDocuments(response.data.clientes);
        setNameOptions(clients);
        setSurnameOptions(clients);
      } catch (error) {
        console.error('Error fetching names:', error);
      }
    } else {
      setNameOptions([]);
    }
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
    };

    try {
      const response = await api.post('pedidos', dataToSubmit);
      console.log('Nuevo pedido agregado:', response.data);
    } catch (error) {
      console.error('Error al agregar pedido:', error);
    }
  }

  const handleInputDocumentChange = (event, value) => {
    setFormData({ ...formData, 'documento': value });
    fetchDocuments(value);
  };

  const handleInputNameChange = (event, value) => {
    setFormData({ ...formData, 'nombre': value });
    fetchNames(value);
  };

  const handleInputSurnameChange = (event, value) => {
    setFormData({ ...formData, 'apellido': value });
    fetchNames(value);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={7} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Agregar Nuevo Pedido</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={nameOptions}
                getOptionLabel={(option) => option.nombre}
                onInputChange={handleInputNameChange}
                onChange={(event, value) => handleChange(event, value, 'selectOption')}
                inputValue={formData.nombre}
                renderOption={(props, option) => (
                  <li {...props} key={option.documento}>
                    {option.nombre}
                  </li>
                )}
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={apellidoOptions}
                getOptionLabel={(option) => option.apellido}
                onInputChange={handleInputSurnameChange}
                onChange={(event, value) => handleChange(event, value, 'selectOption')}
                inputValue={formData.apellido}
                renderOption={(props, option) => (
                  <li {...props} key={option.documento}>
                    {option.apellido}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="apellido"
                    label="Apellido"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={documentOptions}
                getOptionLabel={(option) => option.documento && option.documento.toString()}
                onInputChange={handleInputDocumentChange}
                onChange={(event, value) => handleChange(event, value, 'selectOption')}
                inputValue={formData.documento}
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="direccion_origen"
                label="Dirección de Origen"
                value={formData.direccion_origen}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="direccion_destino"
                label="Dirección de Destino"
                value={formData.direccion_destino}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="ventana_origen_inicio"
                label="Hora de partida del origen(Mínimo)"
                type="time"
                value={formData.ventana_origen_inicio}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="ventana_destino_inicio"
                label="Hora de llegada al destino(Mínimo)"
                type="time"
                value={formData.ventana_destino_inicio}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="ventana_origen_fin"
                label="Hora de partida del origen(Máximo)"
                type="time"
                value={formData.ventana_origen_fin}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="ventana_destino_fin"
                label="Hora de llegada al destino(Máximo)"
                type="time"
                value={formData.ventana_destino_fin}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                name="prioridad"
                label="Prioridad"
                control={<Checkbox checked={formData.prioridad} onChange={handleChange} />}
              />
              <FormControlLabel
                name="acompañante"
                label="Lleva acompañante"
                control={<Checkbox checked={formData.acompañante} onChange={handleChange} />}
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
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Agregar Pedido
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CrearPedido;