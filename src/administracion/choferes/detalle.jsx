import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
 } from '@mui/material';
import useApi from '../../network/axios';
import '../css/detalle.css';
const ChoferDetalles = () => {
  const { id } = useParams();
  const [chofer, setChofer] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [choferEditor, setChoferEditor] = useState(null);

  const api = useApi();
  useEffect(() => {
    console.log("Fetching chofer data...");
    api.get(`choferes/${id}`)
      .then(response => {
        setChofer(response.data.chofer);
        setChoferEditor(response.data.chofer);
      })
      .catch(error => {
        console.error("There was an error fetching the chofer data!", error);
      });
  }, [id]);
  
  const editarChofer = async () => {
    choferEditor.documento = parseInt(choferEditor.documento);
    const response = await api.put(`choferes/${chofer.id}`, choferEditor);
    setChofer(response.data.chofer);
    setChoferEditor(response.data.chofer);

  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setChoferEditor(chofer);
  };
  
  const handleSaveChanges = () => {
    setOpenEditDialog(false);
    editarChofer();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChoferEditor({ ...choferEditor, [name]: value });
  };

  if (!chofer) {
    return <Typography>Loading...</Typography>;
  }

  const handleEdit = () => {
    console.log("Editing chofer", chofer.id);
    setOpenEditDialog(true);
  };

  const handleDelete = () => {
    console.log("Deleting chofer", chofer.id);
  };
  console.log("Chofer data:", chofer);

  return (
    <>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column'}}>
        <div className='header-container'>
          <Typography variant="h4" gutterBottom>
            Detalles del Chofer
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
            <Typography variant="h6">Nombre:</Typography>
            <Typography>{chofer.nombre}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Apellido:</Typography>
            <Typography>{chofer.apellido}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Documento:</Typography>
            <Typography>{chofer.documento}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Teléfono:</Typography>
            <Typography>{chofer.telefono}</Typography>
          </Grid>
          <Grid item xs={12} mb={2}>
            <Typography variant="h6">Observaciones:</Typography>
            <Typography>{chofer.observaciones}</Typography>
          </Grid>
        </Grid>
      </Paper>
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Chofer</DialogTitle>
        <DialogContent>
          <TextField
              autoFocus
              margin="dense"
              name="nombre"
              label="Nombre"
              fullWidth
              value={choferEditor.nombre}
              onChange={handleInputChange}
          />
          <TextField
              margin="dense"
              name="apellido"
              label="Apellido"
              fullWidth
              value={choferEditor.apellido}
              onChange={handleInputChange}
          />
          <TextField
              margin="dense"
              name="documento"
              label="Documento"
              fullWidth
              value={choferEditor.documento}
              onChange={handleInputChange}
          />
          <TextField
              margin="dense"
              name="telefono"
              label="Teléfono"
              fullWidth
              value={choferEditor.telefono}
              onChange={handleInputChange}
          />
          <TextField
              margin="dense"
              name="observaciones"
              label="Observaciones"
              fullWidth
              value={choferEditor.observaciones}
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

export default ChoferDetalles;