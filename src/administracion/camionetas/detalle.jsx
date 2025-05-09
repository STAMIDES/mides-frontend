import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox } from '@mui/material';
import useApi from '../../network/axios';
import '../css/detalle.css';
import { caracteristicasVistas } from './consts';

const CamionetaDetalles = () => {
  const { id } = useParams();
  const [camioneta, setCamioneta] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [camionetaEditor, setCamionetaEditor] = useState(null);
  const [caracteristicasTodas, setCaracteristicasTodas] = useState([]);

  const api = useApi();
  useEffect(() => {
    console.log("Fetching camioneta data...");
    api.get(`vehiculos/${id}`)
      .then(response => {
        setCamioneta(response.data.vehiculo);
        setCamionetaEditor(response.data.vehiculo);
      })
      .catch(error => {
        console.error("There was an error fetching the camioneta data!", error);
      });
  }, [id]);

  const obtenerCaracteristicas = async () => {
    try {
      const response = await api.get('caracteristicas');
      const caracteristicas = response.data.filter(c => c.nombre !== 'silla_de_ruedas'); // Todas las camionetas tienen caracteristicas de tipo "silla_de_ruedas", no hay necesidad de mostrarlas en la lista
      setCaracteristicasTodas(caracteristicas);
    } catch (error) {
      console.error('Error al obtener las caracteristicas:', error);
    }
  };

  const editarCamioneta = async () => {
    // Convert caracteristicas objects to just ids before sending to API
    const editData = {
      ...camionetaEditor,
      caracteristicas: camionetaEditor.caracteristicas 
        ? camionetaEditor.caracteristicas.map(caracteristica => caracteristica.id)
        : []
    };
    
    const response = await api.put(`vehiculos/${camioneta.id}`, editData);
    setCamioneta(response.data.vehiculo);
    setCamionetaEditor(response.data.vehiculo);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCamionetaEditor(camioneta);
  };

  const handleSaveChanges = () => {
    setOpenEditDialog(false);
    editarCamioneta();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCamionetaEditor({ ...camionetaEditor, [name]: value });
  };

  const handleCheckboxChange = (caracteristica) => {
    if (!camionetaEditor.caracteristicas) {
      camionetaEditor.caracteristicas = [];
    }
    
    if (camionetaEditor.caracteristicas.find(c => c.id === caracteristica.id)) {
      setCamionetaEditor({ 
        ...camionetaEditor, 
        caracteristicas: camionetaEditor.caracteristicas.filter(c => c.id !== caracteristica.id) 
      });
    } else {
      setCamionetaEditor({ 
        ...camionetaEditor, 
        caracteristicas: [...camionetaEditor.caracteristicas, caracteristica] 
      });
    }
  };

  if (!camioneta) {
    return <Typography>Loading...</Typography>;
  }

  const handleEdit = () => {
    console.log("Editing camioneta", camioneta.id);
    setOpenEditDialog(true);
    if(caracteristicasTodas.length === 0) {
      obtenerCaracteristicas();
    }
  };

  const handleDelete = () => {
    console.log("Deleting camioneta", camioneta.id);
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column'}}>
        <div className='header-container'>
          <Typography variant="h4" gutterBottom>
            Detalles de la Camioneta
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
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Matrícula:</Typography>
            <Typography>{camioneta.matricula}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Estado:</Typography>
            <Typography>{camioneta.activo ? 'Disponible' : 'No Disponible'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Capacidad Convencional:</Typography>
            <Typography>{camioneta.capacidad_convencional}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Capacidad Silla de Ruedas:</Typography>
            <Typography>{camioneta.capacidad_silla_de_ruedas}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Descripción:</Typography>
            <Typography>{camioneta.descripcion}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Características:</Typography>
            {camioneta.caracteristicas && camioneta.caracteristicas.length > 0 ? (
              camioneta.caracteristicas.map((caracteristica, index) => (
                <Typography key={index}>{caracteristica.nombre in caracteristicasVistas ? caracteristicasVistas[caracteristica.nombre] : caracteristica.nombre}</Typography>
              ))
            ) : (
              <Typography>Sin características asignadas</Typography>
            )}
          </Grid>
          <Grid item xs={12} mb={2}>
            <Typography variant="h6">Observaciones:</Typography>
            <Typography>{camioneta.observaciones}</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Camioneta</DialogTitle>
        <DialogContent>
          <TextField
              autoFocus
              margin="dense"
              name="matricula"
              label="Matrícula"
              fullWidth
              value={camionetaEditor.matricula}
              onChange={handleInputChange}
          />
          <TextField
              margin="dense"
              name="capacidad_convencional"
              label="Capacidad Convencional"
              fullWidth
              value={camionetaEditor.capacidad_convencional}
              onChange={handleInputChange}
          />
          <TextField
              margin="dense"
              name="capacidad_silla_de_ruedas"
              label="Capacidad Silla de Ruedas"
              fullWidth
              value={camionetaEditor.capacidad_silla_de_ruedas}
              onChange={handleInputChange}
          />
          <TextField
              margin="dense"
              name="descripcion"
              label="Descripción"
              fullWidth
              value={camionetaEditor.descripcion}
              onChange={handleInputChange}
          />
          <TextField
              margin="dense"
              name="observaciones"
              label="Observaciones"
              fullWidth
              value={camionetaEditor.observaciones}
              onChange={handleInputChange}
          />
          <Typography variant="subtitle1" style={{ marginTop: '16px' }}>
            Características:
          </Typography>
          {caracteristicasTodas.map((caracteristica) => (
            <FormControlLabel
              key={caracteristica.id}
              control={
                <Checkbox
                  checked={Boolean(camionetaEditor.caracteristicas && 
                    camionetaEditor.caracteristicas.find(c => c.id === caracteristica.id))}
                  onChange={() => handleCheckboxChange(caracteristica)}
                />
              }
              label={caracteristica.nombre}
            />
          ))}
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
    </>
  );
};

export default CamionetaDetalles;