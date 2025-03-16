import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import useApi from '../../network/axios';
import '../css/detalle.css';

const LugaresComunDetalles = () => {
  const { id } = useParams();
  const [lugarComun, setLugarComun] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [lugarComunEditor, setLugarComunEditor] = useState(null);

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
          <TextField
              margin="dense"
              name="direccion"
              label="Dirección"
              fullWidth
              value={lugarComunEditor.direccion}
              onChange={handleInputChange}
          />
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
    </>
  );
};

export default LugaresComunDetalles;