import React, { useState, useEffect } from 'react';
import { Checkbox, TextField, Button, Typography, FormLabel, FormGroup, Container, Grid, Paper, FormControl, FormControlLabel, Alert } from '@mui/material';
import useApi from '../../network/axios';

const CamionetasCrear = ({ camioneta = {} }) => {
  const [formData, setFormData] = useState({
    matricula: '',
    capacidad_convencional: '',
    capacidad_silla_de_ruedas: '',
    chofer_habitual: '',
    caracteristicas: [],
    descripcion: '',
    ...camioneta
  });
  const [message, setMessage] = useState(null); 
  const [caracteristicasTodas, setCaracteristicasTodas] = useState([]); 
  const [caracteristicas, setCaracteristicasCamionetas] = useState([]);
  const api = useApi();

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

  const handleCheckboxChange = (value) => {
    setCaracteristicasCamionetas((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      caracteristicas: caracteristicas
    };
    try {
      const response = await api.post('vehiculos', dataToSubmit);
      setMessage({ type: 'success', text: 'Camioneta creada correctamente' });
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        setMessage({ type: 'error', text: error.response.data.detail });
      } else {
        setMessage({ type: 'error', text: 'Error creando la caminoeta' });
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Crear camioneta</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <TextField
                name="matricula"
                label="Matricula"
                value={formData.matricula}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="capacidad_convencional"
                label="Capacidad"
                value={formData.capacidad_convencional}
                onChange={handleChange}
                fullWidth
                type='number'
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="capacidad_silla_de_ruedas"
                label="Capacidad para silla de ruedas"
                value={formData.capacidad_silla_de_ruedas}
                onChange={handleChange}
                fullWidth
                type='number'
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="chofer_habitual"
                label="Chofer habitual"
                value={formData.chofer_habitual}
                onChange={handleChange}
                fullWidth
                multiline
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
                name="descripcion"
                label="Descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
              {message && (
                <Alert severity={message.type} sx={{ ml:3, mt: 3}}>
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

export default CamionetasCrear;
