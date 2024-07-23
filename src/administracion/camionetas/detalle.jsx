import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid } from '@mui/material';
import useApi from '../../network/axios';
import '../css/detalle.css';

const CamionetaDetalles = () => {
  const { id } = useParams();
  const [camioneta, setCamioneta] = useState(null);
    console.log("Camioneta data:");
  const api = useApi();
  useEffect(() => {
    console.log("Fetching camioneta data...");
    api.get(`vehiculos/${id}`)
      .then(response => {
        setCamioneta(response.data.vehiculo);
      })
      .catch(error => {
        console.error("There was an error fetching the camioneta data!", error);
      });
  }, [id]);

  if (!camioneta) {
    return <Typography>Loading...</Typography>;
  }

  const handleEdit = () => {
    console.log("Editing camioneta", camioneta.id);
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
    </Container>
  );
};

export default CamionetaDetalles;