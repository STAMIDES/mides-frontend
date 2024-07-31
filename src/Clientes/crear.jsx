import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, Container, FormLabel, FormGroup, FormControlLabel, Alert,
  Checkbox, Grid, Paper, FormControl, InputLabel } from '@mui/material';
import useApi from '../network/axios';
import { useNavigate } from 'react-router-dom';

const CrearUsuario = ({ usuario = {} }) => {
  const [formData, setFormData] = useState({
    documento: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    caracteristicas: [],
    observaciones: '',
    ...usuario
  });

  const [errors, setErrors] = useState({});
  const [caracteristicasTodas, setCaracteristicasTodas] = useState([]); 
  const [caracteristicas, setCaracteristicasUsuario] = useState([]);
  const [message, setMessage] = useState(null);
  let crearPedido = false;

  const api = useApi();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const obtenerCaracteristicas = async () => {
    try {
      const response = await api.get('caracteristicas');
      setCaracteristicasTodas(response.data);
    } catch (error) {
      console.error('Error al obtener las caracteristicas:', error);
    }
  };

  useEffect(() => {
    obtenerCaracteristicas();
  }, []);


  const handleNavigation = (id) => {
    navigate(`/solicitudes/crear?usuarioId=${id}`);
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
      caracteristicas: caracteristicas
    };

    try {
      const response = await api.post('clientes', dataToSubmit);
      if (crearPedido) {
        handleNavigation(response.data.cliente.id);
      }
      setMessage({ type: 'success', text: 'Nuevo usuario agregado exitosamente' });
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        setMessage({ type: 'error', text: error.response.data.detail });
      } else {
        setMessage({ type: 'error', text: 'Error al agregar usuario. Inténtalo de nuevo más tarde.' });
      }
    }
  };

  const handleCheckboxChange = (value) => {
    setCaracteristicasUsuario((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  console.log(caracteristicasTodas[0])
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}> 
        <Typography variant="h4" gutterBottom>Agregar Nuevo Usuario</Typography>
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
                      key={value.id}
                      control={
                        <Checkbox
                          checked={caracteristicas.includes(value.id)}
                          onChange={() => handleCheckboxChange(value.id)}
                        />
                      }
                      label={value.nombre}
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
            <Grid item xs={6}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Agregar Usuario
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button type="submit" variant="contained" color="secondary" fullWidth onClick={()=> crearPedido=true} >
                Agregar Usuario y Crear Pedido
              </Button>
            </Grid>
          </Grid>
        </form>
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 , mt: 3}}>
            {message.text}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default CrearUsuario;
