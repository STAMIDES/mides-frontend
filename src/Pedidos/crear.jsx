import React, { useState, useEffect  } from 'react';
import { Box, TextField, Button, Typography, FormControlLabel, Checkbox, Autocomplete, Container, Grid, Paper, FormControl, RadioGroup, FormLabel, Radio, IconButton, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import useApi from '../network/axios';
import { useParams, useLocation  } from 'react-router-dom';

const CrearPedido = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cliente_documento: '',
    direccion_origen: '',
    direccion_final: '',
    ventana_horaria_inicio: '',
    fecha_programado: '',
    paradas: [
      {
        direccion_destino: '',
        ventana_horaria_inicio: '',
        ventana_horaria_fin: '',
      },
    ],
    prioridad: false,
    acompañante: false,
    observaciones: '',
  });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clienteId = queryParams.get('clienteId');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [documentOptions, setDocumentOptions] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [apellidoOptions, setSurnameOptions] = useState([]);
  const [tipoViaje, setTipoViaje] = useState(0);
  
  const tiposViaje = [
    "Ida y vuelta" , "Solo ida" , "Solo vuelta" 
  ];
  const api = useApi();

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

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({ ...formData, [name]: name === 'acompañante' || name === 'prioridad' ? checked : value });
  };

  const handleParadaChange = (index, e) => {
    const { name, value } = e.target;
    const updatedParadas = formData.paradas.map((destino, i) => (
      i === index ? { ...destino, [name]: value } : destino
    ));
    setFormData({ ...formData, paradas: updatedParadas });
  };

  const addParada = () => {
    setFormData({
      ...formData,
      paradas: [...formData.paradas, { direccion_destino: '', ventana_horaria_inicio: '', ventana_horaria_fin: '' }],
    });
  };

  const castDocuments = (clients) => clients.map(client => ({
    ...client,
    cliente_documento: `${client.documento.toString()}`,
  }));

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
    let retParadas = [{direccion: formData.direccion_origen, 
      ventana_horaria_inicio: formData.ventana_horaria_inicio? formData.ventana_horaria_inicio: null,
      posicion_en_pedido: 0}];
    let counter = 0;
    for (const parada of formData.paradas){
      counter = counter + 1;
      if (tipoViaje===0){
        retParadas.push({direccion: parada.direccion_destino,
           ventana_horaria_inicio: parada.ventana_horaria_inicio,
           ventana_horaria_fin: parada.ventana_horaria_fin,
           posicion_en_pedido: counter});
      }else if (tipoViaje===1){
        retParadas.push({direccion: parada.direccion_destino, 
          ventana_horaria_inicio: parada.ventana_horaria_inicio,
          posicion_en_pedido: counter});
        break;
      }else {
          retParadas.push({direccion: parada.direccion_destino, posicion_en_pedido: counter});
          break;
      }
    }
    if (tipoViaje===0){retParadas.push({direccion: formData.direccion_final, posicion_en_pedido: counter+1});}
    return retParadas;
  }
  const getTipoVviaje = () => {
    return tiposViaje[parseInt(tipoViaje, 10)];
  }
  const handleSubmit = async (e) => {
    console.log("formData", formData) 
    e.preventDefault();
    if (!validarDoc()) {
      return;
    }

    let dataToSubmit = {
      ...formData,
      documento: parseInt(formData.cliente_documento, 10),
      paradas: filterParadas(),
      tipo: getTipoVviaje(),
    };
    const { direccion_origen, direccion_final, ventana_horaria_inicio, ...remainingData } = dataToSubmit;
    dataToSubmit = remainingData;

    try {
      const response = await api.post('pedidos', dataToSubmit);
      setMessage({ type: 'success', text: 'Nuevo pedido agregado exitosamente' });
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        setMessage({ type: 'error', text: error.response.data.detail });
      } else {
        setMessage({ type: 'error', text: 'Error al agregar pedido:' });
      }
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 1 }}>
      <Paper elevation={7} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Agregar Nuevo Pedido</Typography>
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
                <TextField
                  name="direccion_origen"
                  label="Dirección de Origen"
                  value={formData.direccion_origen}
                  onChange={handleChange}
                  fullWidth
                  required
                />
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
              </Grid>
            </Grid>
            {formData.paradas.map((destino, index) => (
              <Grid container spacing={3} key={index} sx={{ mt: 3 }} style={{ display: index !== 0 && tipoViaje !== 0 ? "none" : "flex" }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="direccion_destino"
                    label="Dirección de Destino"
                    value={destino.direccion_destino}
                    onChange={(e) => handleParadaChange(index, e)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
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
              </Grid>
            ))}
            <Box display="flex" justifyContent="center" sx={{ mt: 3, display: tipoViaje === 0 ? "flex" : "none" }}>
              <IconButton color="primary" onClick={addParada}>
                <AddIcon />
              </IconButton>
            </Box>
            <Grid container sx={{ mt: 3 }}>
            <Grid item xs={12} sm={4}>
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
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Agregar Pedido
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

export default CrearPedido;
