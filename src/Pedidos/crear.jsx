import React, { useState, useEffect  } from 'react';
import { Box, TextField, Button, Typography, FormControlLabel, Checkbox, Autocomplete, Container, Grid, Paper, FormControl, RadioGroup, FormLabel, Radio, IconButton } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import useApi from '../network/axios';
import { useParams, useLocation  } from 'react-router-dom';

const CrearPedido = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cliente_documento: '',
    direccion_origen: '',
    ventana_origen_inicio: '',
    ventana_origen_fin: '',
    destinos: [
      {
        direccion_destino: '',
        ventana_destino_inicio: '',
        ventana_destino_fin: '',
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
  const [tipoViaje, setTipoViaje] = useState("1");
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

  const handleDestinoChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDestinos = formData.destinos.map((destino, i) => (
      i === index ? { ...destino, [name]: value } : destino
    ));
    setFormData({ ...formData, destinos: updatedDestinos });
  };

  const addDestino = () => {
    setFormData({
      ...formData,
      destinos: [...formData.destinos, { direccion_destino: '', ventana_destino_inicio: '', ventana_destino_fin: '' }],
    });
  };

  const castDocuments = (clients) => clients.map(client => ({
    ...client,
    cliente_documento: `${client.documento.toString()}`,
  }));

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
      documento: parseInt(formData.cliente_documento, 10),
    };

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

  const handleInputDocumentChange = (event, value) => {
    setFormData({ ...formData, 'cliente_documento': value });
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
  console.log("tipoViaje", tipoViaje)
  return (
    <Container maxWidth="md" sx={{ mt: 1 }}>
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
                    disabled={!!clienteId}
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
                    disabled={!!clienteId}
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
                inputValue={formData.cliente_documento}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name="cliente_documento"
                    label="Documento"
                    fullWidth
                    required
                    error={!!errors.cliente_documento}
                    helperText={errors.cliente_documento}
                    disabled={!!clienteId}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Paper elevation={7} sx={{ p: 4, mt: 3 }}>
              <FormControl component="fieldset" >
                <FormLabel component="legend">Tipo de Viaje</FormLabel>
                <RadioGroup
                  row
                  name="tipoViaje"
                  value={tipoViaje}
                  onChange={(e) => setTipoViaje(e.target.value)}
                >
                  <FormControlLabel value="1" control={<Radio />} label="Ida y vuelta" />
                  <FormControlLabel value="2" control={<Radio />} label="Solo ida" />
                  <FormControlLabel value="3" control={<Radio />} label="Solo vuelta" />
                </RadioGroup>
              </FormControl>
            <Grid container spacing={3}>
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
                  name="ventana_origen_inicio"
                  label="Hora de partida del origen"
                  type="time"
                  value={formData.ventana_origen_inicio}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{visibility: tipoViaje === "3" ? "visible" : "hidden"}}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
              </Grid>
            </Grid>
            {formData.destinos.map((destino, index) => (
              <Grid container spacing={3} key={index} sx={{ mt: 3 }} style={{ visibility: index !== 0 && tipoViaje !== "1" ? "hidden" : "visible" }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="direccion_destino"
                    label="Dirección de Destino"
                    value={destino.direccion_destino}
                    onChange={(e) => handleDestinoChange(index, e)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="ventana_destino_inicio"
                    label="Hora de llegada al destino"
                    type="time"
                    value={destino.ventana_destino_inicio}
                    onChange={(e) => handleDestinoChange(index, e)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{visibility: tipoViaje !== "3" ? "visible" : "hidden"}}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="ventana_destino_fin"
                    label="Hora de partida del destino"
                    type="time"
                    value={destino.ventana_destino_fin}
                    onChange={(e) => handleDestinoChange(index, e)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    style={{visibility: tipoViaje === "1"   ? "visible" : "hidden"}}
                  />
                </Grid>
              </Grid>
            ))}
            <Box display="flex" justifyContent="center" sx={{ mt: 3, visibility: tipoViaje === "1" ? "visible" : "hidden" }}>
              <IconButton color="primary" onClick={addDestino}>
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
                  required
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
