import React, { useState, useEffect  } from 'react';
import { Box, TextField, Button, Typography, FormControlLabel, Checkbox, Container, Grid, Paper, FormControl, RadioGroup, InputLabel, 
         Radio, IconButton, Alert,Select, MenuItem, Modal, List, ListItem, ListItemText } from '@mui/material';
import { Add as AddIcon, GpsFixed as GpsFixedIcon, Settings as AdvancedIcon } from '@mui/icons-material';
import useApi from '../network/axios';
import { useParams, useLocation  } from 'react-router-dom';
import { geocodeAddress } from '../utils/geocoder';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';

import 'moment/locale/es';


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
        ventana_horaria_inicio:  '',
        ventana_horaria_fin:  '',
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
  //const [advancedModalOpen, setAdvancedModalOpen] = useState(false)

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

  const handleTipoViajeChange = (e) => {
    const newTipoViaje = parseInt(e.target.value, 10);
    setTipoViaje(newTipoViaje);
  
    setFormData(prevState => {
      let updatedForm = { ...prevState };
  
      if (clienteId) {
        if (newTipoViaje === 2) { // Solo vuelta
          updatedForm.direccion_origen = "";
          updatedForm.paradas[0].direccion_destino = formData.direccion_origen || formData.direccion_final;
          updatedForm.direccion_final = "";
        } else { // Si cambio de "Solo vuelta" a otro tipo, reiniciar la parada 1
          updatedForm.direccion_origen = formData.direccion_origen || formData.direccion_final;
          updatedForm.direccion_final = formData.direccion_final || formData.direccion_origen;
  
          // Resetear la parada 1 si no estamos en "Solo vuelta"
          updatedForm.paradas = [{ direccion_destino: "", ventana_horaria_inicio: "", ventana_horaria_fin: "", tipo_parada: "" }];
        }
      }
  
      return updatedForm;
    });
  
    setCords(prevCords => {
      let updatedCords = [...prevCords];
      if (newTipoViaje === 2) {
        setDireccionFinalCoords(updatedCords[0] || { lat: null, lng: null });
        updatedCords[0] = { lat: null, lng: null };
      } else {
        updatedCords[0] = prevCords[0] || { lat: null, lng: null };

        if (newTipoViaje === 0) {
            setDireccionFinalCoords(prevCords[0] || { lat: null, lng: null });
        } else {
            setDireccionFinalCoords({ lat: null, lng: null });
        }
    }
      return updatedCords;
    });
  };
  
  useEffect(() => {
    if (clienteId) {
      console.log("Fetching client data...");
      api.get(`clientes/${clienteId}`)
        .then(response => {
          const cliente = response.data;
          console.log("Client data fetched:", cliente);
  
          setFormData(prevState => {
            let updatedForm = { 
              ...prevState,
              nombre: cliente.nombre,
              apellido: cliente.apellido,
              cliente_documento: cliente.documento.toString(),
            };
  
            if (cliente.direccion) {
              // Si es un viaje solo de vuelta, la dirección del cliente va en destino
              if (tipoViaje === 2) {
                updatedForm.direccion_origen = "";
                updatedForm.paradas[0].direccion_destino = cliente.direccion;
                updatedForm.direccion_final = "";
              } else {
                updatedForm.direccion_origen = cliente.direccion;
                updatedForm.direccion_final = cliente.direccion;
              }
            }
  
            return updatedForm;
          });
  
          setCords(prevCords => {
            let updatedCords = [...prevCords];
        
            if (cliente.latitud && cliente.longitud) {
                if (tipoViaje === 2) { 
                    // Solo vuelta: las coordenadas del cliente van en la primera parada (destino)
                    updatedCords[0] = { lat: null, lng: null }; // Vacía origen
                    setDireccionFinalCoords({ lat: null, lng: null }); // Vacía dirección final
                    updatedCords[1] = { lat: cliente.latitud, lng: cliente.longitud }; // Asigna coordenadas a la primera parada
                } else if (tipoViaje === 0) { 
                    // Ida y vuelta: las coordenadas del cliente van en origen y en final
                    updatedCords[0] = { lat: cliente.latitud, lng: cliente.longitud }; // Origen
                    setDireccionFinalCoords({ lat: cliente.latitud, lng: cliente.longitud }); // Final
                } else if (tipoViaje === 1) { 
                    // Solo ida: las coordenadas del cliente van en origen, pero no en final
                    updatedCords[0] = { lat: cliente.latitud, lng: cliente.longitud }; // Origen
                    setDireccionFinalCoords({ lat: null, lng: null }); // Final se mantiene vacío
                }
            }
        
            return updatedCords;
        });
        })
        .catch(error => {
          console.error("There was an error fetching the client data!", error);
        });
    }
  }, [clienteId, tipoViaje]);
  
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

  const handleChange = (e, type = 'default') => {
    if (type === 'date') {
      setFormData({ 
        ...formData, 
        fecha_programado: e ? e.format('YYYY-MM-DD') : ''  // e is the moment object
      });
      return;
    }
    const { name, value, checked } = e.target;
  
    if (name === 'direccion_origen') {
      setCords([{ lat: null, lng: null }]);
    }
  
    if (name === 'direccion_final') {
      setDireccionFinalCoords({ lat: null, lng: null });
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
      counter = counter + 1;
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
        setErrors(prevErrors => ({
          ...prevErrors,
          [index === -1 ? "direccion_final" : index === 0 ? "direccion_origen" : `parada_${index - 1}`]: ""
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          [index === -1 ? "direccion_final" : index === 0 ? "direccion_origen" : `parada_${index - 1}`]: "No se encontraron resultados para la dirección ingresada."
        }));
      }
    } catch (error) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [index === -1 ? "direccion_final" : index === 0 ? "direccion_origen" : `parada_${index - 1}`]: "Error en la geocodificación, intenta nuevamente."
      }));
    }
  };

  const handleSelectGeocode = (index, option) => {
    setFormData((prevData) => {
      let updatedData = { ...prevData };
  
      // Obtener la dirección ingresada por el usuario según el índice
      let direccionOriginal = "";
      if (index === -1) {
        direccionOriginal = prevData.direccion_final.trim();
      } else if (index === 0) {
        direccionOriginal = prevData.direccion_origen.trim();
      } else {
        direccionOriginal = prevData.paradas[index - 1].direccion_destino.trim();
      }
  
      let direccionGeocoder = option.display_name.trim();
      let nuevaDireccion = direccionGeocoder;
  
      // 🔹 Intentar extraer el número de puerta correcto
      const partesDireccionUsuario = direccionOriginal.split(" ");
      let numeroUsuario = null;
  
      for (let i = partesDireccionUsuario.length - 1; i >= 0; i--) {
        if (!isNaN(partesDireccionUsuario[i])) {
          numeroUsuario = partesDireccionUsuario[i]; // El último número en la dirección ingresada es el número de puerta
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
  
      // 🔹 Guardar la dirección corregida en el estado adecuado
      if (index === -1) {
        updatedData.direccion_final = nuevaDireccion;
        setDireccionFinalCoords({ lat: option.lat, lng: option.lng });
      } else if (index === 0) {
        updatedData.direccion_origen = nuevaDireccion;
        setCords((prevCords) => {
          let newCords = [...prevCords];
          newCords[0] = { lat: option.lat, lng: option.lng };
          return newCords;
        });
      } else {
        updatedData.paradas = prevData.paradas.map((parada, i) =>
          i === index - 1 ? { ...parada, direccion_destino: nuevaDireccion } : parada
        );
  
        setCords((prevCords) => {
          let newCords = [...prevCords];
          newCords[index] = { lat: option.lat, lng: option.lng };
          return newCords;
        });
      }
  
      return updatedData;
    });
  
    setSelectedAddressIndex(null);
    handleCloseModal();
  };
  


  const getTipoViaje = () => {
    return tiposViaje[parseInt(tipoViaje, 10)];
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let validationErrors = [];

    if (!validarDoc()) {
      return;
    }
  
    if (!formData.fecha_programado) {
      validationErrors.push('Debes seleccionar una fecha programada.');
    } else {
      const selectedYear = parseInt(formData.fecha_programado.split('-')[0], 10);
      if (selectedYear < 2025) {
        validationErrors.push('La fecha debe ser en el año 2025 o posterior.');
      }
    }
  
    formData.paradas.forEach((parada, index) => {
      if (tipoViaje !== 2 && !parada.ventana_horaria_inicio) { 
        validationErrors.push(`Debes ingresar la hora de llegada al destino en la parada ${index + 1}.`);
      }
  
      if (tipoViaje === 0 && !parada.ventana_horaria_fin) { 
        validationErrors.push(`Debes ingresar la hora de partida del destino en la parada ${index + 1}.`);
      }
  
      if (tipoViaje !== 2 && !parada.tipo_parada) { 
        validationErrors.push(`Debes seleccionar un tipo de parada en la parada ${index + 1}.`);
      }
    });
  
    if (!areCoordinatesComplete()) {
      validationErrors.push('Debes geocodificar todas las direcciones antes de continuar.');
    }
  
    if (validationErrors.length > 0) {
      setMessage({ type: 'error', text: validationErrors.join(' ') });
      return;
    }
  
    setIsSubmitting(true);
  };
  
  

  return (
    <>
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
                  <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'es-UY'}>
                    <DatePicker
                      label="Fecha"
                      name="fecha_programado"
                      format="DD/MM/YYYY"
                      onChange={(newValue) => handleChange(newValue, 'date')}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          required: true,
                          placeholder: "dd/mm/yyyy",
                          InputLabelProps: {
                            shrink: true,
                          }
                        } 
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            <Paper elevation={7} sx={{ p: 4, mt: 3 }}>
              <FormControl component="fieldset" >
                <RadioGroup
                  row
                  name="tipoViaje"
                  value={tipoViaje}
                  onChange={handleTipoViajeChange}
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
                    error={!!errors.direccion_origen}
                    helperText={errors.direccion_origen}
                  />
                  {/* Botón para geocodificación estándar */}
                  <IconButton
                    color={hasValidCoords(0) ? 'success' : 'primary'}
                    onClick={() => handleGeocode(formData.direccion_origen, 0)}
                    disabled={!formData.direccion_origen}
                  >
                    <GpsFixedIcon />
                  </IconButton>

                  {/* Botón para activar el modo avanzado */}
                  {/* <IconButton
                    color="secondary"
                    onClick={() => setAdvancedModalOpen(true)}
                  >
                    <AdvancedIcon />
                  </IconButton> */}
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
                    error={!!errors[`parada_${index}`]}
                    helperText={errors[`parada_${index}`]}
                  />
                  {/* Botón para geocodificación estándar */}
                  <IconButton
                    color={hasValidCoords(index + 1) ? 'success' : 'primary'}
                    onClick={() => handleGeocode(destino.direccion_destino, index + 1)}
                    disabled={!destino.direccion_destino}
                  >
                    <GpsFixedIcon />
                  </IconButton>

                  {/* Botón para activar el modo avanzado */}
                  {/* <IconButton
                    color="secondary"
                    onClick={() => setAdvancedModalOpen(true)}
                  >
                    <AdvancedIcon />
                  </IconButton> */}
                </Box>
                </Grid>

                <Grid item xs={12} sm={2.5}>
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
                <Grid item xs={12} sm={2.5}>
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
                    error={!!errors.direccion_final}
                    helperText={errors.direccion_final}
                    />
                    {/* Botón para geocodificación estándar */}
                    <IconButton
                      color={hasValidCoords(-1) ? 'success' : 'primary'}
                      onClick={() => handleGeocode(formData.direccion_final, -1)}
                      disabled={!formData.direccion_final}
                    >
                    {tipoViaje === 0 && <GpsFixedIcon />}
                    </IconButton>
                    {/* Botón para activar el modo avanzado */}
                    {/* <IconButton
                      color="secondary"
                      onClick={() => setAdvancedModalOpen(true)}
                    >
                      <AdvancedIcon />
                    </IconButton> */}
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
              onClick={handleSubmit}
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
                    handleSelectGeocode(selectedAddressIndex, option);
                  }}
                >
                  <ListItemText primary={option.display_name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Modal>

        {/* <AdvancedGeocodeModal
          open={advancedModalOpen}
          onClose={() => setAdvancedModalOpen(false)}
        /> */}

        
      </Paper>
    </>
  );
  
};

export default CrearPedido;
