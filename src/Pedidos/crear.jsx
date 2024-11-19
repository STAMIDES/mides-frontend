import React, { useState, useEffect  } from 'react';
import { Box, TextField, Button, Typography, FormControlLabel, Checkbox, Container, Grid, Paper, FormControl, RadioGroup, InputLabel, 
         Radio, IconButton, Alert,Select, MenuItem, Modal, List, ListItem, ListItemText } from '@mui/material';
import { Add as AddIcon, GpsFixed as GpsFixedIcon  } from '@mui/icons-material';
import useApi from '../network/axios';
import { useParams, useLocation  } from 'react-router-dom';
import { geocodeAddress } from '../utils/geocoder';

const CrearPedido = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cliente_documento: '',
    direccion_origen: '', 
    direccion_origen_tipo: '',
    direccion_final: '',
    ventana_horaria_inicio: '',
    fecha_programado: '',
    paradas: [
      {
        direccion_destino: '',
        ventana_horaria_inicio: '',
        ventana_horaria_fin: '',
        tipo_parada: '',
      },
    ],
    prioridad: false,
    acompañante: false,
    observaciones: '',
  });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clienteId = queryParams.get('usuarioId');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [tipoViaje, setTipoViaje] = useState(0);
  const [cords, setCords] = useState([]);
  const [direccion_final_coords, setDireccionFinalCoords] = useState({});
  const [tiposParadas, setTiposParadas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [geocodeOptions, setGeocodeOptions] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tiposViaje = [
    "Ida y vuelta" , "Solo ida" , "Solo vuelta" 
  ];
  const api = useApi();
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const areCoordinatesComplete = () => {
    const isIdaYVuelta = tipoViaje === 0;
  
    const expectedCoordsCount = isIdaYVuelta ? formData.paradas.length + 2 : formData.paradas.length + 1;

    const allCoordsComplete = cords.length === formData.paradas.length + 1 &&
                              cords.every(coord => coord && coord.lat !== null && coord.lng !== null);

    const finalCoordsComplete = !isIdaYVuelta || (direccion_final_coords.lat && direccion_final_coords.lng);
  
    return allCoordsComplete && finalCoordsComplete;
  };

  const hasValidCoords = (index) => {
    if (index === -1) {
      return direccion_final_coords.lat !== null && direccion_final_coords.lng !== null;
    }
    return cords[index]?.lat !== null && cords[index]?.lng !== null;
  };

  useEffect(() => {
  if (clienteId) {
    console.log("Fetching client data...")
    api.get(`clientes/${clienteId}`)
    .then(response => {
      const cliente = response.data;
      console.log("Client data fetched:", cliente);
      setFormData({ ...formData, nombre:cliente.nombre, apellido:cliente.apellido, 
        cliente_documento: cliente.documento.toString()});
    })
      .catch(error => {
        console.error("There was an error fetching the client data!", error);
      });
  }}, [clienteId]);

  useEffect(() => {
    api.get('tipos_paradas')
      .then(response => {
        setTiposParadas(response.data);
      })
      .catch(error => {
        console.error("Error al obtener los tipos de parada", error);
      });
  }, []);

  useEffect(() => {
    if (isSubmitting && areCoordinatesComplete()) {
      const dataToSubmit = {
        ...formData,
        documento: parseInt(formData.cliente_documento, 10),
        paradas: filterParadas(),
        tipo: getTipoViaje(),
      };
  
      const { direccion_origen, direccion_final, direccion_origen_tipo, ventana_horaria_inicio, ...remainingData } = dataToSubmit;
  
      api.post('pedidos', remainingData)
        .then(() => {
          setMessage({ type: 'success', text: 'Nueva solicitud agregada exitosamente' });
          setFormData({
            ...formData,
            direccion_origen: '',
            direccion_final: '',
            direccion_origen_tipo: '',
            ventana_horaria_inicio: '',
            ventana_horaria_fin: '',
            paradas: [{
              direccion_destino: '',
              ventana_horaria_inicio: '',
              ventana_horaria_fin: '',
              tipo_parada: '',
            }]
          });
          setIsSubmitting(false);
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.detail || 'Error al agregar la solicitud';
          setMessage({ type: 'error', text: errorMessage });
          setIsSubmitting(false);
        });
    }
  }, [isSubmitting, cords, direccion_final_coords]); 

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
  
    // Limpiamos las coordenadas solo si es necesario
    if (name === 'direccion_origen') {
      setCords((prevCords) => {
        const newCords = [...prevCords];
        newCords[0] = { lat: null, lng: null }; // Reset coords for direccion_origen
        return newCords;
      });
    }
  
    if (name === 'direccion_final') {
      setDireccionFinalCoords({ lat: null, lng: null }); // Reset coords for direccion_final
    }
  
    setFormData({ ...formData, [name]: name === 'acompañante' || name === 'prioridad' ? checked : value });
  };

  const handleParadaChange = (index, e) => {
    const { name, value } = e.target;

    if (name === 'direccion_destino') {
      setCords((prevCords) => {
        const newCords = [...prevCords];
        newCords[index + 1] = { lat: null, lng: null };
        return newCords;
      });
    }
  
    const updatedParadas = formData.paradas.map((destino, i) => (
      i === index ? { ...destino, [name]: value } : destino
    ));
    setFormData({ ...formData, paradas: updatedParadas });
  };

  const addParada = () => {
    setFormData({
      ...formData,
      paradas: [...formData.paradas, { direccion_destino: '', ventana_horaria_inicio: '', ventana_horaria_fin: '', tipo_parada: '' }],
    });
  };

  const validarDoc = () => {
    let tempErrors = {};
    if (!formData.cliente_documento) {
      tempErrors.cliente_documento = 'Documento es requerido';
    } else if (isNaN(formData.cliente_documento)) {
      tempErrors.cliente_documento = 'Documento debe ser un número';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  
  const filterParadas = () => {
    let retParadas = [{
      direccion: formData.direccion_origen,
      latitud: cords[0].lat, longitud: cords[0].lng, tipo: tipoViaje ===2 ? formData.direccion_origen_tipo : null,
      ventana_horaria_inicio: formData.ventana_horaria_inicio? formData.ventana_horaria_inicio: null,
      posicion_en_pedido: 0}];
    let counter = 0;
    for (const parada of formData.paradas){
      console.log(formData)
      counter = counter + 1;
      debugger
      if (tipoViaje===0){
        retParadas.push({direccion: parada.direccion_destino,
           ventana_horaria_inicio: parada.ventana_horaria_inicio,
           ventana_horaria_fin: parada.ventana_horaria_fin,
           latitud: cords[counter].lat,
           longitud: cords[counter].lng,
           tipo: parada.tipo_parada,
           posicion_en_pedido: counter});
      }else if (tipoViaje===1){
        retParadas.push({direccion: parada.direccion_destino, 
          ventana_horaria_inicio: parada.ventana_horaria_inicio,
          latitud: cords[counter].lat,
          longitud: cords[counter].lng,
          tipo:  parada.tipo_parada,
          posicion_en_pedido: counter});
        break;
      }else {
          retParadas.push({direccion: parada.direccion_destino, tipo: null,
            latitud: cords[counter].lat,
            longitud: cords[counter].lng,
             posicion_en_pedido: counter});
          break;
      }
    }
    if (tipoViaje===0){retParadas.push({direccion: formData.direccion_final, 
      latitud: direccion_final_coords.lat, 
      longitud: direccion_final_coords.lng,
      posicion_en_pedido: counter+1});}
    return retParadas;
  }

  const handleGeocode = async (direccion, index = null) => {
    try {
      const opciones = await geocodeAddress(direccion);
      if (opciones.length > 0) {
        setGeocodeOptions(opciones);
        setSelectedAddressIndex(index);
        handleOpenModal();
      } else {
        setMessage({ type: 'error', text: 'No se encontraron opciones de geocodificación para la dirección.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleSelectGeocode = (index, coordenadas) => {
    if (selectedAddressIndex === -1) {
      setDireccionFinalCoords(coordenadas);
    } else {
      setCords((prevCords) => {
        let newCords = [...prevCords];
        newCords[selectedAddressIndex] = coordenadas;
        return newCords;
      });
    }
  
    setSelectedAddressIndex(null);
    handleCloseModal();
  };

  const getTipoViaje = () => {
    return tiposViaje[parseInt(tipoViaje, 10)];
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarDoc()) {
      return;
    }
  
    setIsSubmitting(true);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 1 }}>
      <Paper elevation={7} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Agregar Nueva Solicitud</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="nombre"
                label="Nombre"
                fullWidth
                value={formData.nombre}
                required
                disabled={!!clienteId}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="apellido"
                label="Apellido"
                value={formData.apellido}
                fullWidth
                required
                disabled={!!clienteId}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="cliente_documento"
                label="Documento"
                fullWidth
                value={formData.cliente_documento}
                required
                error={!!errors.cliente_documento}
                helperText={errors.cliente_documento}
                disabled={!!clienteId}
              />
            </Grid>
              <Grid item xs={12}>
                <TextField
                  name="fecha_programado"
                  label="Fecha"
                  type="date"
                  value={formData.fecha_programado}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
                </Grid>
              </Grid>
            <Paper elevation={7} sx={{ p: 4, mt: 3 }}>
              <FormControl component="fieldset" >
                <RadioGroup
                  row
                  name="tipoViaje"
                  value={tipoViaje}
                  onChange={(e) => setTipoViaje(parseInt(e.target.value, 10))}
                >
                  {tiposViaje.map((tipo, index) => (
                      <FormControlLabel
                        key={index}
                        value={index}
                        control={<Radio />}
                        label={tipo}
                      />
                    ))}
                </RadioGroup>
              </FormControl>
              <Grid container spacing={3} mt={1}>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <TextField
                    name="direccion_origen"
                    label="Dirección de Origen"
                    value={formData.direccion_origen}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                  <IconButton
                    color={hasValidCoords(0) ? 'success' : 'primary'}
                    onClick={() => handleGeocode(formData.direccion_origen, 0)}
                    disabled={!formData.direccion_origen}
                  >
                    <GpsFixedIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  name="ventana_horaria_inicio"
                  label="Hora de partida del origen"
                  type="time"
                  value={formData.ventana_horaria_inicio}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{visibility: tipoViaje === 2 ? "visible" : "hidden"}}

                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth style={{ visibility: tipoViaje === 2 ? "visible" : "hidden" }}>
                      <InputLabel id={'tipo-parada-label'}>Tipo de Parada</InputLabel>
                      <Select
                        labelId={'tipo-parada-label'}
                        name="direccion_origen_tipo"
                        value={formData.direccion_origen_tipo}
                        onChange={(e) => handleChange(e)}
                      >
                        {tiposParadas.map((tipo) => (
                          <MenuItem key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                </Grid>

            </Grid>
            {formData.paradas.map((destino, index) => (
              <Grid container spacing={3} key={index} sx={{ mt: 3 }} style={{ display: index !== 0 && tipoViaje !== 0 ? "none" : "flex" }}>
                <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <TextField
                    name="direccion_destino"
                    label="Dirección de Destino"
                    value={destino.direccion_destino}
                    onChange={(e) => handleParadaChange(index, e)}
                    fullWidth
                    required
                  />
                  <IconButton
                    color={hasValidCoords(index + 1) ? 'success' : 'primary'}
                    onClick={() => handleGeocode(destino.direccion_destino, index + 1)}
                    disabled={!destino.direccion_destino}
                  >
                    <GpsFixedIcon />
                  </IconButton>
                </Box>
                </Grid>

                <Grid item xs={12} sm={2}>
                  <TextField
                    name="ventana_horaria_inicio"
                    label="Hora de llegada al destino"
                    type="time"
                    value={destino.ventana_horaria_inicio}
                    onChange={(e) => handleParadaChange(index, e)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{visibility: tipoViaje !== 2 ? "visible" : "hidden"}}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    name="ventana_horaria_fin"
                    label="Hora de partida del destino"
                    type="time"
                    value={destino.ventana_horaria_fin}
                    onChange={(e) => handleParadaChange(index, e)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{visibility: tipoViaje === 0   ? "visible" : "hidden"}}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth style={{ visibility: tipoViaje !== 2 ? "visible" : "hidden" }}>
                    <InputLabel id={'tipo-parada-label'}>Tipo de Parada</InputLabel>
                    <Select
                      labelId={'tipo-parada-label'}
                      value={destino.tipo_parada}
                      name="tipo_parada"
                      onChange={(e) => handleParadaChange(index,e)}
                    >
                      {tiposParadas.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            ))}
            <Box display="flex" justifyContent="center" sx={{ mt: 3, display: tipoViaje === 0 ? "flex" : "none" }}>
              <IconButton color="primary" onClick={addParada}>
                <AddIcon />
              </IconButton>
            </Box>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} sm={4}>
                <Box display="flex" alignItems="center">
                  <TextField
                    name="direccion_final"
                    label="Dirección final"
                    value={formData.direccion_final}
                    onChange={handleChange}
                    fullWidth
                    style={{ display: tipoViaje === 0 ? "flex" : "none" }}
                    required={tipoViaje === 0} 
                    disabled={tipoViaje !== 0}
                    />
                    <IconButton
                      color={hasValidCoords(-1) ? 'success' : 'primary'}
                      onClick={() => handleGeocode(formData.direccion_final, -1)}
                      disabled={!formData.direccion_final}
                    >
                    {tipoViaje === 0 && <GpsFixedIcon />}
                    </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          <Grid container spacing={3} sx={{ mt: 3 }} >
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
            {message && (
                <Alert severity={message.type} sx={{ mb: 3 }}>
                  {message.text}
                </Alert>
              )}
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              disabled={!areCoordinatesComplete()}
            >
                Agregar Solicitud
            </Button>
          </Grid>
          </Grid>
        </form>

        <Modal open={modalOpen} onClose={handleCloseModal}>
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

        
      </Paper>
    </Container>
  );
};

export default CrearPedido;
