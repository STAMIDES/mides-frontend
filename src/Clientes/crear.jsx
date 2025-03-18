import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Select, MenuItem, Container, FormLabel, FormGroup, FormControlLabel, Alert,
  Checkbox, Grid, Paper, FormControl, InputLabel, IconButton, Modal, List, ListItem, ListItemText } from '@mui/material';
  import {GpsFixed as GpsFixedIcon} from '@mui/icons-material';
import useApi from '../network/axios';
import { useNavigate } from 'react-router-dom';
import { geocodeAddress } from '../utils/geocoder';
import MapaUbicacion from '../components/mapaUbicacion';

const CrearUsuario = ({ usuario = {} }) => {
  const [formData, setFormData] = useState({
    documento: '',
    nombre: '',
    apellido: '',
    direccion: '',
    latitud: null,
    longitud: null,
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
  const [modalOpen, setModalOpen] = useState(false);
  const [geocodeOptions, setGeocodeOptions] = useState([]);
  const [verUsuario, setVerUsuario] = useState(false);
  let crearPedido = false;

  const api = useApi();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
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
  let direccionOriginal = formData.direccion.trim();
  let direccionGeocoder = option.display_name.trim();
  let nuevaDireccion = direccionGeocoder;

  // Extraer correctamente el número de puerta
  const partesDireccionUsuario = direccionOriginal.split(" ");
  let numeroUsuario = null;

  for (let i = partesDireccionUsuario.length - 1; i >= 0; i--) {
    if (!isNaN(partesDireccionUsuario[i])) {
      numeroUsuario = partesDireccionUsuario[i];
      break;
    }
  }

  const geocoderMatch = direccionGeocoder.match(/^([\d,]+)\s(.+)$/);
  if (geocoderMatch) {
    const numeros = geocoderMatch[1].split(",").map(num => num.trim());
    const restoDireccion = geocoderMatch[2].trim();
    const nombreCalle = restoDireccion.split(",")[0];
    const restosSinCalle = restoDireccion.replace(nombreCalle, "").trim();

    if (numeroUsuario && numeros.includes(numeroUsuario)) {
      nuevaDireccion = `${nombreCalle} ${numeroUsuario}${restosSinCalle}`;
    }
  }

  setFormData({
    ...formData,
    direccion: nuevaDireccion,
    latitud: option.lat,
    longitud: option.lng,
  });

  setModalOpen(false);
};

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
  
  const verUsuarioExistente = async (documento) => {
    try {
      const response = await api.get(`/clientes/doc/${documento}`);
      const userId = response.data.clientes?.[0]?.id;
      if (!userId) {
        setMessage({ type: 'error', text: 'Usuario no encontrado' });
        setVerUsuario(false);
        return;
      }
      navigate(`/usuarios/${userId}`);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
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
      if (verUsuario) {
        setVerUsuario(false);
      }
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        setMessage({ type: 'error', text: error.response.data.detail });
        if (error.response.data.detail === 'Ya existe un cliente con ese documento.') {
          setVerUsuario(true);
        }else{
          setVerUsuario(false);
        }
      } else {
        setMessage({ type: 'error', text: 'Error al agregar usuario. Inténtalo de nuevo más tarde.' });
        if (verUsuario) {
          setVerUsuario(false);
        }
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
    <>
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
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={10}>
                <TextField 
                  name="direccion" 
                  label="Dirección" 
                  value={formData.direccion} 
                  onChange={handleChange} 
                  fullWidth 
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
             {message && (
              <Alert severity={message.type} sx={{ ml: 3, mt: 3, width: '100%' }}>
                {message.text}
                {verUsuario? 
                  <Button onClick={() => verUsuarioExistente(formData.documento)}>Ver Usuario</Button>
                : null}
              </Alert>
            )}
            <Grid item xs={6}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Agregar Usuario
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button type="submit" variant="contained" color="secondary" fullWidth onClick={()=> crearPedido=true} >
                Agregar Usuario y Crear Solicitud
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

export default CrearUsuario;
