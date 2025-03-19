import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Modal, List,
         ListItem, ListItemText, Box } from '@mui/material';
import { GpsFixed as GpsFixedIcon } from '@mui/icons-material';
import useApi from '../../network/axios';
import { geocodeAddress } from '../../utils/geocoder';
import '../css/detalle.css';

const LugaresComunDetalles = () => {
  const { id } = useParams();
  const [lugarComun, setLugarComun] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [lugarComunEditor, setLugarComunEditor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [geocodeOptions, setGeocodeOptions] = useState([]);
  const [errors, setErrors] = useState({});

  const api = useApi();
  useEffect(() => {
    console.log("Fetching lugar común data...");
    api.get(`lugares_comunes/${id}`)
      .then(response => {
        setLugarComun(response.data.lugar);
        setLugarComunEditor(response.data.lugar);
      })
      .catch(error => {
        console.error("There was an error fetching the lugar común data!", error);
      });
  }, [id]);

  const editarLugarComun = async () => {
    const response = await api.put(`lugares_comunes/${lugarComun.id}`, lugarComunEditor);
    setLugarComun(response.data.lugar);
    setLugarComunEditor(response.data.lugar);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setLugarComunEditor(lugarComun);
  };

  const handleSaveChanges = () => {
    setOpenEditDialog(false);
    editarLugarComun();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLugarComunEditor({ ...lugarComunEditor, [name]: value });
  };

  if (!lugarComun) {
    return <Typography>Loading...</Typography>;
  }

  const handleGeocode = async () => {
    if (!lugarComunEditor.direccion.trim()) return;
  
    try {
      const results = await geocodeAddress(lugarComunEditor.direccion);
  
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
    let direccionOriginal = lugarComunEditor.direccion.trim();
    let direccionGeocoder = option.display_name.trim();
    let nuevaDireccion = direccionGeocoder;
  
    // Extraer número de la dirección ingresada por el usuario
    const partesDireccionUsuario = direccionOriginal.split(" ");
    let numeroUsuario = null;
    for (let i = partesDireccionUsuario.length - 1; i >= 0; i--) {
      if (!isNaN(partesDireccionUsuario[i])) {
        numeroUsuario = partesDireccionUsuario[i];
        break;
      }
    }
  
    // Extraer números de la dirección del geocoder
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
  
    setLugarComunEditor({
      ...lugarComunEditor,
      direccion: nuevaDireccion,
      latitud: option.lat,
      longitud: option.lng,
    });
  
    setModalOpen(false);
  };

  const handleEdit = () => {
    console.log("Editing lugar común", lugarComun.id);
    setOpenEditDialog(true);
  };

  const handleDelete = () => {
    console.log("Deleting lugar común", lugarComun.id);
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column'}}>
        <div className='header-container'>
          <Typography variant="h4" gutterBottom>
            Detalles del Lugar Común
          </Typography>
          <div>
            <Button variant="contained" color="secondary" onClick={handleEdit}>
              Editar
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete} style={{ marginLeft: '10px' }}>
              Borrar
            </Button>
          </div>
        </div>
        <Grid container spacing={3} className='details-container' style={{ width: '100%', margin: '0' }} >
          <Grid item xs={12}>
            <Typography variant="h6">Nombre:</Typography>
            <Typography>{lugarComun.nombre}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Dirección:</Typography>
            <Typography>{lugarComun.direccion}</Typography>
          </Grid>
          <Grid item xs={12} mb={2}>
            <Typography variant="h6">Observaciones:</Typography>
            <Typography>{lugarComun.observaciones}</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Lugar Común</DialogTitle>
        <DialogContent>
          <TextField
              autoFocus
              margin="dense"
              name="nombre"
              label="Nombre"
              fullWidth
              value={lugarComunEditor.nombre}
              onChange={handleInputChange}
          />
          <Box display="flex" alignItems="center">
            <TextField
              margin="dense"
              name="direccion"
              label="Dirección"
              fullWidth
              value={lugarComunEditor.direccion}
              onChange={handleInputChange}
              error={!!errors.direccion}
              helperText={errors.direccion}
            />
            <IconButton
              color={lugarComunEditor.latitud ? "success" : "primary"}
              onClick={handleGeocode}
              disabled={!lugarComunEditor.direccion}
              sx={{ ml: 1 }}
            >
              <GpsFixedIcon />
            </IconButton>
          </Box>
          <TextField
              margin="dense"
              name="observaciones"
              label="Observaciones"
              fullWidth
              value={lugarComunEditor.observaciones}
              onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseEditDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleSaveChanges} color="primary">
              Guardar
            </Button>
        </DialogActions>
      </Dialog>

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

export default LugaresComunDetalles;