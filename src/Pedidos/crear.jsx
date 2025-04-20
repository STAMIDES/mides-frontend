import React, { useState, useEffect  } from 'react';
import { Box, TextField, Button, Typography, FormControlLabel, Checkbox, Tooltip, Grid, Paper, FormControl, RadioGroup, InputLabel, 
         Radio, IconButton, Select, MenuItem, Modal, List, ListItem, ListItemText, Snackbar, Alert as MuiAlert } from '@mui/material';
import { Add as AddIcon, GpsFixed as GpsFixedIcon, Place as PlaceIcon, Edit as EditIcon } from '@mui/icons-material';
import useApi from '../network/axios';
import { useParams, useLocation  } from 'react-router-dom';
import { geocodeAddress } from '../utils/geocoder';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';
import MapaUbicacion from '../components/mapaUbicacion';
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
  const [modoSeleccionOrigen, setModoSeleccionOrigen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [direccionOrigenTemporal, setDireccionOrigenTemporal] = useState("");
  const [popupOrigenOpen, setPopupOrigenOpen] = useState(false);
  const direccionOrigenDeshabilitada = cords[0]?.lat !== null && cords[0]?.lng !== null;
  const direccionFinalDeshabilitada = direccion_final_coords.lat !== null && direccion_final_coords.lng !== null;
  const [direccionParadaDeshabilitada, setDireccionParadaDeshabilitada] = useState([true]);
  const [modoSeleccionFinal, setModoSeleccionFinal] = useState(false);
  const [popupFinalOpen, setPopupFinalOpen] = useState(false);
  const [direccionFinalTemporal, setDireccionFinalTemporal] = useState("");
  const [respaldoOrigen, setRespaldoOrigen] = useState({ direccion: "", lat: null, lng: null });
  const [respaldoFinal, setRespaldoFinal] = useState({ direccion: "", lat: null, lng: null });
  const [modoSeleccionParada, setModoSeleccionParada] = useState([]);
  const [popupParadaOpen, setPopupParadaOpen] = useState([]);
  const [direccionParadaTemporal, setDireccionParadaTemporal] = useState([]);
  const [respaldoParadas, setRespaldoParadas] = useState([]);

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
  
    // 🔹 Calcular nuevas coordenadas ANTES de hacer el set
    let nuevasCoords = [];
    if (newTipoViaje === 2) {
      nuevasCoords = [
        { lat: null, lng: null }, // origen
        { lat: null, lng: null }  // parada
      ];
    } else if (newTipoViaje === 0) {
      nuevasCoords = [
        cords[0] || { lat: null, lng: null }, // origen
        { lat: null, lng: null }              // parada
      ];
    } else {
      nuevasCoords = [
        cords[0] || { lat: null, lng: null }  // origen
      ];
    }
  
    // 🔹 Actualizar coords y final en el orden correcto
    setCords(nuevasCoords);
  
    if (newTipoViaje === 0) {
      setDireccionFinalCoords(nuevasCoords[0] || { lat: null, lng: null });
    } else {
      setDireccionFinalCoords({ lat: null, lng: null });
    }
  
    // 🔹 Actualizar formulario
    setFormData(prevState => {
      let updatedForm = { ...prevState };
  
      if (clienteId) {
        if (newTipoViaje === 2) { // Solo vuelta
          updatedForm.direccion_origen = "";
          updatedForm.paradas[0].direccion_destino = formData.direccion_origen || formData.direccion_final;
          updatedForm.direccion_final = "";
        } else {
          updatedForm.direccion_origen = formData.direccion_origen || formData.direccion_final;
          updatedForm.direccion_final = formData.direccion_final || formData.direccion_origen;
          updatedForm.paradas = [{ direccion_destino: "", ventana_horaria_inicio: "", ventana_horaria_fin: "", tipo_parada: "" }];
        }
      }
  
      return updatedForm;
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
    setDireccionParadaDeshabilitada(prev => {
      const diferencia = formData.paradas.length - prev.length;
      if (diferencia > 0) {
        return [...prev, ...Array(diferencia).fill(false)];
      }
      return prev;
    });
  }, [formData.paradas.length]);

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
      setCords((prev) => {
        const nuevo = [...prev];
        nuevo[0] = { lat: null, lng: null };
        return nuevo;
      });
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
    setFormData(prev => ({
      ...prev,
      paradas: [...prev.paradas, { direccion_destino: '', ventana_horaria_inicio: '', ventana_horaria_fin: '', tipo_parada: '' }],
    }));
  
    setModoSeleccionParada(prev => [...prev, false]);
    setPopupParadaOpen(prev => [...prev, false]);
    setDireccionParadaTemporal(prev => [...prev, ""]);
    setRespaldoParadas(prev => [...prev, { direccion: "", lat: null, lng: null }]);
    setDireccionParadaDeshabilitada(prev => [...prev, false]);
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

        setDireccionParadaDeshabilitada(prev => {
          const nuevo = [...prev];
          nuevo[index - 1] = true;
          return nuevo;
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
      <Grid container spacing={2} sx={{ height: '99vh' }}>
        {/* 📍 Formulario a la izquierda */}
        <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={10}>
                          <TextField
                            name="direccion_origen"
                            label="Dirección de Origen"
                            value={formData.direccion_origen}
                            onChange={handleChange}
                            fullWidth
                            required
                            disabled={direccionOrigenDeshabilitada}
                            error={!!errors.direccion_origen}
                            helperText={errors.direccion_origen}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <Box display="flex" justifyContent="space-around" alignItems="center">
                            {direccionOrigenDeshabilitada && (
                              <Tooltip title="Editar dirección manualmente">
                                <IconButton
                                  onClick={() => {
                                    if (window.confirm("Esto eliminará las coordenadas actuales. ¿Deseas continuar?")) {
                                      setFormData({ ...formData, direccion_origen: "", });
                                      setCords((prev) => {
                                        const nuevo = [...prev];
                                        nuevo[0] = { lat: null, lng: null };
                                        return nuevo;
                                      });
                                    }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Geocodificar dirección escrita">
                              <IconButton
                                color={hasValidCoords(0) ? "success" : "primary"}
                                onClick={() => handleGeocode(formData.direccion_origen, 0)}
                                disabled={!formData.direccion_origen}
                              >
                                <GpsFixedIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Seleccionar ubicación manualmente en el mapa">
                              <IconButton
                                onClick={() => {
                                  const nuevo = !modoSeleccionOrigen;
                                  setModoSeleccionOrigen(nuevo);
                                  if (nuevo) setSnackbarOpen(true);
                                }}
                                color={modoSeleccionOrigen ? "error" : "primary"}
                              >
                                <PlaceIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
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
                          disabled={direccionParadaDeshabilitada[index]}
                          error={!!errors[`parada_${index}`]}
                          helperText={errors[`parada_${index}`]}
                        />
                        <Box ml={1} display="flex" alignItems="center">
                          {cords[index + 1]?.lat !== null && cords[index + 1]?.lng !== null && (
                            <Tooltip title="Editar dirección manualmente">
                              <IconButton
                                onClick={() => {
                                  if (window.confirm("Esto eliminará las coordenadas actuales. ¿Deseas continuar?")) {
                                    setRespaldoParadas((prev) => {
                                      const nuevo = [...prev];
                                      nuevo[index] = {
                                        direccion: destino.direccion_destino,
                                        lat: cords[index + 1]?.lat,
                                        lng: cords[index + 1]?.lng,
                                      };
                                      return nuevo;
                                    });

                                    setFormData(prev => {
                                      const actualizado = [...prev.paradas];
                                      actualizado[index].direccion_destino = "";
                                      return { ...prev, paradas: actualizado };
                                    });

                                    setCords(prev => {
                                      const nuevo = [...prev];
                                      nuevo[index + 1] = { lat: null, lng: null };
                                      return nuevo;
                                    });

                                    setDireccionParadaTemporal(prev => {
                                      const nuevo = [...prev];
                                      nuevo[index] = "";
                                      return nuevo;
                                    });

                                    setDireccionParadaDeshabilitada(prev => {
                                      const nuevo = [...prev];
                                      nuevo[index] = false;
                                      return nuevo;
                                    });
                                  }
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Geocodificar dirección escrita">
                            <IconButton
                              color={hasValidCoords(index + 1) ? 'success' : 'primary'}
                              onClick={() => handleGeocode(destino.direccion_destino, index + 1)}
                              disabled={!destino.direccion_destino || direccionParadaDeshabilitada[index]}
                            >
                              <GpsFixedIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Seleccionar ubicación manualmente en el mapa">
                            <IconButton
                              onClick={() => {
                                const nuevo = [...modoSeleccionParada];
                                nuevo[index] = !nuevo[index];
                                setModoSeleccionParada(nuevo);
                                if (nuevo[index]) setSnackbarOpen(true);
                              }}
                              color={modoSeleccionParada[index] ? "error" : "primary"}
                            >
                              <PlaceIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
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
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={10}>
                          <TextField
                            name="direccion_final"
                            label="Dirección final"
                            value={formData.direccion_final}
                            onChange={handleChange}
                            fullWidth
                            required={tipoViaje === 0}
                            disabled={direccionFinalDeshabilitada || tipoViaje !== 0}
                            error={!!errors.direccion_final}
                            helperText={errors.direccion_final}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <Box display="flex" justifyContent="space-around" alignItems="center">
                            {direccionFinalDeshabilitada && (
                              <Tooltip title="Editar dirección manualmente">
                                <IconButton
                                  onClick={() => {
                                    if (window.confirm("Esto eliminará las coordenadas actuales. ¿Deseas continuar?")) {
                                      setFormData(prev => ({ ...prev, direccion_final: "" }));
                                      setDireccionFinalCoords({ lat: null, lng: null });
                                    }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Geocodificar dirección escrita">
                              <IconButton
                                color={hasValidCoords(-1) ? 'success' : 'primary'}
                                onClick={() => handleGeocode(formData.direccion_final, -1)}
                                disabled={!formData.direccion_final}
                              >
                                <GpsFixedIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Seleccionar ubicación manualmente en el mapa">
                              <IconButton
                                onClick={() => {
                                  const nuevo = !modoSeleccionFinal;
                                  setModoSeleccionFinal(nuevo);
                                  if (nuevo) setSnackbarOpen(true);
                                }}
                                color={modoSeleccionFinal ? "error" : "primary"}
                              >
                                <PlaceIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>            
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
          </Paper>
        </Grid>

        {/* 🗺️ Mapa a la derecha */}
        <Grid item xs={4} sx={{ height: '100%' }}>
          <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
              <MapaUbicacion
                latitudes={[cords[0]?.lat, ...cords.slice(1).map(c => c?.lat), direccion_final_coords?.lat]}
                longitudes={[cords[0]?.lng, ...cords.slice(1).map(c => c?.lng), direccion_final_coords?.lng]}
                height="100%"
                modoSeleccion={
                  modoSeleccionOrigen ||
                  modoSeleccionFinal ||
                  modoSeleccionParada.some((m) => m)
                }
                onMapClick={({ lat, lng }) => {
                  if (modoSeleccionOrigen) {
                    setRespaldoOrigen({
                      direccion: formData.direccion_origen,
                      lat: cords[0]?.lat ?? null,
                      lng: cords[0]?.lng ?? null
                    });
                    const nuevasCords = [...cords];
                    nuevasCords[0] = { lat, lng };
                    setCords(nuevasCords);
                    setDireccionOrigenTemporal("");
                    setPopupOrigenOpen(true);
                    setModoSeleccionOrigen(false);
                  } else 
                  if (modoSeleccionFinal) {
                    setRespaldoFinal({
                      direccion: formData.direccion_final,
                      lat: direccion_final_coords?.lat ?? null,
                      lng: direccion_final_coords?.lng ?? null
                    });
                    setDireccionFinalCoords({ lat, lng });
                    setDireccionFinalTemporal("");
                    setPopupFinalOpen(true);
                    setModoSeleccionFinal(false);
                  }
                  else {
                    const idx = modoSeleccionParada.findIndex(m => m);
                    if (idx !== -1) {
                      // Guardar respaldo
                      setRespaldoParadas(prev => {
                        const nuevo = [...prev];
                        nuevo[idx] = {
                          direccion: formData.paradas[idx].direccion_destino,
                          lat: cords[idx + 1]?.lat ?? null,
                          lng: cords[idx + 1]?.lng ?? null
                        };
                        return nuevo;
                      });
                  
                      // Actualizar coordenadas reales
                      setCords(prev => {
                        const nuevo = [...prev];
                        nuevo[idx + 1] = { lat, lng };
                        return nuevo;
                      });
                  
                      // Preparar para confirmación textual
                      setDireccionParadaTemporal(prev => {
                        const nuevo = [...prev];
                        nuevo[idx] = "";
                        return nuevo;
                      });
                  
                      setPopupParadaOpen(prev => {
                        const nuevo = [...prev];
                        nuevo[idx] = true;
                        return nuevo;
                      });
                  
                      // Desactivar modo selección
                      setModoSeleccionParada(prev => {
                        const nuevo = [...prev];
                        nuevo[idx] = false;
                        return nuevo;
                      });
                    }
                  }               
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

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

      <Modal open={popupOrigenOpen} onClose={() => setPopupOrigenOpen(false)}>
        <Paper sx={{ padding: 3, width: 400, margin: 'auto', marginTop: '20vh' }}>
          <Typography variant="h6" gutterBottom>Ingresá una dirección</Typography>
          <TextField
            label="Dirección de Origen"
            fullWidth
            value={direccionOrigenTemporal}
            onChange={(e) => setDireccionOrigenTemporal(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={() => {
              setFormData(prev => ({
                ...prev,
                direccion_origen: respaldoOrigen.direccion
              }));
              setCords(prev => {
                const nuevas = [...prev];
                nuevas[0] = { lat: respaldoOrigen.lat, lng: respaldoOrigen.lng };
                return nuevas;
              });
              setPopupOrigenOpen(false);
              setModoSeleccionOrigen(false);
            }}>Cancelar</Button>
            <Button 
              variant="contained" 
              sx={{ ml: 2 }}
              disabled={!direccionOrigenTemporal.trim()} 
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  direccion_origen: direccionOrigenTemporal
                }));
                setCords(prev => {
                  const nuevo = [...prev];
                  nuevo[0] = coordOrigenTemporal;
                  return nuevo;
                });
                setPopupOrigenOpen(false);
              }}>Confirmar
            </Button>
          </Box>
        </Paper>
      </Modal>

      <Modal open={popupFinalOpen} onClose={() => setPopupFinalOpen(false)}>
        <Paper sx={{ padding: 3, width: 400, margin: 'auto', marginTop: '20vh' }}>
          <Typography variant="h6" gutterBottom>Ingresá una dirección</Typography>
          <TextField
            label="Dirección Final"
            fullWidth
            value={direccionFinalTemporal}
            onChange={(e) => setDireccionFinalTemporal(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={() => {
              setFormData(prev => ({
                ...prev,
                direccion_final: respaldoFinal.direccion
              }));
              setDireccionFinalCoords({
                lat: respaldoFinal.lat,
                lng: respaldoFinal.lng
              });
              setPopupFinalOpen(false);
              setModoSeleccionFinal(false);
            }}>Cancelar</Button>
            <Button 
              variant="contained" 
              sx={{ ml: 2 }}
              disabled={!direccionFinalTemporal.trim()} 
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  direccion_final: direccionFinalTemporal
                }));
                setDireccionFinalCoords(coordFinalTemporal);
                setPopupFinalOpen(false);
              }}>Confirmar
            </Button>
          </Box>
        </Paper>
      </Modal>

      {formData.paradas.map((_, index) => (
        <Modal key={index} open={popupParadaOpen[index]} onClose={() => {
          const nuevoPopup = [...popupParadaOpen];
          nuevoPopup[index] = false;
          setPopupParadaOpen(nuevoPopup);
        }}>
          <Paper sx={{ padding: 3, width: 400, margin: 'auto', marginTop: '20vh' }}>
            <Typography variant="h6" gutterBottom>Ingresá una dirección</Typography>
            <TextField
              label={`Dirección parada ${index + 1}`}
              fullWidth
              value={direccionParadaTemporal[index]}
              onChange={(e) => {
                const nuevo = [...direccionParadaTemporal];
                nuevo[index] = e.target.value;
                setDireccionParadaTemporal(nuevo);
              }}
              sx={{ mt: 2 }}
            />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button onClick={() => {
                setFormData(prev => {
                  const actualizado = { ...prev };
                  actualizado.paradas[index].direccion_destino = respaldoParadas[index].direccion;
                  return actualizado;
                });

                setCords(prev => {
                  const nuevo = [...prev];
                  nuevo[index + 1] = {
                    lat: respaldoParadas[index].lat,
                    lng: respaldoParadas[index].lng
                  };
                  return nuevo;
                });

                const nuevoPopup = [...popupParadaOpen];
                nuevoPopup[index] = false;
                setPopupParadaOpen(nuevoPopup);

                const nuevoModo = [...modoSeleccionParada];
                nuevoModo[index] = false;
                setModoSeleccionParada(nuevoModo);
              }}>Cancelar</Button>

              <Button
                variant="contained"
                sx={{ ml: 2 }}
                disabled={!direccionParadaTemporal[index]?.trim()}
                onClick={() => {
                  setFormData(prev => {
                    const actualizado = { ...prev };
                    actualizado.paradas[index].direccion_destino = direccionParadaTemporal[index];
                    return actualizado;
                  });

                  setDireccionParadaDeshabilitada(prev => {
                    const nuevo = [...prev];
                    nuevo[index] = true;
                    return nuevo;
                  });

                  const nuevoPopup = [...popupParadaOpen];
                  nuevoPopup[index] = false;
                  setPopupParadaOpen(nuevoPopup);
                }}
              >
                Confirmar
              </Button>
            </Box>
          </Paper>
        </Modal>
      ))}


      {/* <AdvancedGeocodeModal
        open={advancedModalOpen}
        onClose={() => setAdvancedModalOpen(false)}
      /> */}
    </>
  );
  
};

export default CrearPedido;
