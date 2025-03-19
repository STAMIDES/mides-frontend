import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Grid, Paper, Alert, IconButton, Modal, List, ListItem, ListItemText } from '@mui/material';
import { GpsFixed as GpsFixedIcon } from '@mui/icons-material';
import useApi from '../../network/axios';
import { geocodeAddress } from '../../utils/geocoder';

const LugaresComunesCrear = ({ lugar_comun = {} }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    latitud: null,
    longitud: null,
    observaciones: '',
    ...lugar_comun
  });

  const [message, setMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [geocodeOptions, setGeocodeOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const api = useApi();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si el usuario edita la dirección manualmente, eliminar coordenadas
    if (name === "direccion") {
      setFormData({ 
        ...formData, 
        direccion: value, 
        latitud: null, 
        longitud: null 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleGeocode = async () => {
    if (!formData.direccion.trim()) return;
  
    try {
      const results = await geocodeAddress(formData.direccion);
  
      if (results.length > 0) {
        setGeocodeOptions(results);
        setModalOpen(true);
        setErrors(prevErrors => ({ ...prevErrors, direccion: "" }));
      } else {
        setErrors(prevErrors => ({ ...prevErrors, direccion: "No se encontraron resultados para la dirección ingresada." }));
      }
    } catch (error) {
      console.error("Error al geodecodificar:", error);
      setErrors(prevErrors => ({ ...prevErrors, direccion: "Error en la geocodificación, intenta nuevamente." }));
    }
  };
  
  
  const handleSelectGeocode = (index, option) => {
    setFormData((prevData) => {
      let updatedData = { ...prevData };
  
      // Obtener la dirección ingresada por el usuario
      let direccionOriginal = prevData.direccion.trim();
      let direccionGeocoder = option.display_name.trim();
      let nuevaDireccion = direccionGeocoder;
  
      // 🔹 Intentar extraer el número de puerta correcto
      const partesDireccionUsuario = direccionOriginal.split(" ");
      let numeroUsuario = null;
  
      for (let i = partesDireccionUsuario.length - 1; i >= 0; i--) {
        if (!isNaN(partesDireccionUsuario[i])) {
          numeroUsuario = partesDireccionUsuario[i]; // Último número en la dirección ingresada es el número de puerta
          break;
        }
      }
  
      // 🔹 Detectar múltiples números en la dirección del geocoder
      const geocoderMatch = direccionGeocoder.match(/^([\d,]+)\s(.+)$/);
      if (geocoderMatch) {
        const numeros = geocoderMatch[1].split(",").map(num => num.trim()); // Extraemos los números de puerta
        const restoDireccion = geocoderMatch[2].trim(); // Resto de la dirección
        const nombreCalle = restoDireccion.split(",")[0]; // Primera parte después de los números
        const restosSinCalle = restoDireccion.replace(nombreCalle, "").trim(); // Dirección sin la calle principal
  
        if (numeroUsuario && numeros.includes(numeroUsuario)) {
          // Si el número ingresado por el usuario está en la lista, lo usamos
          nuevaDireccion = `${nombreCalle} ${numeroUsuario}${restosSinCalle}`;
        }
      }
  
      // 🔹 Guardar la dirección corregida
      updatedData.direccion = nuevaDireccion;
      updatedData.latitud = option.lat;
      updatedData.longitud = option.lng;
  
      return updatedData;
    });
  
    setModalOpen(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.latitud === null || formData.longitud === null) {
        setMessage({ type: "error", text: "Debes geocodificar la dirección antes de crear el lugar común." });
        return;
    }

    try {
        const response = await api.post('lugares_comunes', formData);
        setMessage({ type: 'success', text: 'Lugar creado correctamente' });
    } catch (error) {
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
            setMessage({ type: 'error', text: error.response.data.detail });
        } else {
            setMessage({ type: 'error', text: 'Error creando el lugar' });
        }
    }
};


  return (
    <>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Crear Lugar Común</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField name="nombre" label="Nombre" value={formData.nombre} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={10}>
                <TextField 
                  name="direccion" 
                  label="Dirección" 
                  value={formData.direccion} 
                  onChange={handleChange} 
                  fullWidth 
                  required 
                  error={!!errors.direccion} 
                  helperText={errors.direccion} 
                />

                </Grid>
                <Grid item xs={2}>
                  <IconButton color={formData.latitud ? "success" : "primary"} onClick={handleGeocode} disabled={!formData.direccion}>
                    <GpsFixedIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <TextField name="observaciones" label="Observaciones" value={formData.observaciones} onChange={handleChange} fullWidth multiline rows={4} />
            </Grid>

            {message && (
              <Grid item xs={12}>
                <Alert severity={message.type}>{message.text}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, py: 1.5 }}>
                Crear
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Modal para selección de direcciones geodecodificadas */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Paper sx={{ padding: 2, width: 400, margin: 'auto', marginTop: '20vh' }}>
          <Typography variant="h6">Selecciona una dirección</Typography>
          <List>
            {geocodeOptions.map((option, index) => (
              <ListItem 
                button 
                key={index} 
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectGeocode(index, option);
                }}
              >
                <ListItemText primary={option.display_name} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Modal>
    </>
  );
};

export default LugaresComunesCrear;
