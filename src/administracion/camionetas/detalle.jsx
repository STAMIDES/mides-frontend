import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import useApi from '../../network/axios';
import '../css/detalle.css';

const CamionetaDetalles = () => {
  const { id } = useParams();
  const [camioneta, setCamioneta] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [camionetaEditor, setCamionetaEditor] = useState(null);

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

  const editarCamioneta = async () => {
    const response = await api.put(`vehiculos/${camioneta.id}`, camionetaEditor);
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

  if (!camioneta) {
    return <Typography>Loading...</Typography>;
  }

  const handleEdit = () => {
    console.log("Editing camioneta", camioneta.id);
    setOpenEditDialog(true);
  };

  const handleDelete = () => {
    console.log("Deleting camioneta", camioneta.id);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
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
            <Typography variant="h6">Disponibilidad:</Typography>
            <Typography>{camioneta.disponibilidad ? 'Disponible' : 'No Disponible'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Capacidad Convencional:</Typography>
            <Typography>{camioneta.capacidad_convencional}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Capacidad Silla de Ruedas:</Typography>
            <Typography>{camioneta.capacidad_silla_de_ruedas}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Documento Chofer Habitual:</Typography>
            <Typography>{camioneta.documento_chofer_habitual}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Descripción:</Typography>
            <Typography>{camioneta.descripcion}</Typography>
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
              name="documento_chofer_habitual"
              label="Documento Chofer Habitual"
              fullWidth
              value={camionetaEditor.documento_chofer_habitual}
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
    </Container>
  );
};

export default CamionetaDetalles;