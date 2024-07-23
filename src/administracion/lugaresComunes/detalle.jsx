import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid } from '@mui/material';
import useApi from '../../network/axios';
import '../css/detalle.css';

const LugaresComunDetalles = () => {
  const { id } = useParams();
  const [lugarComun, setLugarComun] = useState(null);

  const api = useApi();
  useEffect(() => {
    console.log("Fetching lugar común data...");
    api.get(`lugares_comunes/${id}`)
      .then(response => {
        setLugarComun(response.data.lugar);
      })
      .catch(error => {
        console.error("There was an error fetching the lugar común data!", error);
      });
  }, [id]);

  if (!lugarComun) {
    return <Typography>Loading...</Typography>;
  }

  const handleEdit = () => {
    console.log("Editing lugar común", lugarComun.id);
  };

  const handleDelete = () => {
    console.log("Deleting lugar común", lugarComun.id);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
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
    </Container>
  );
};

export default LugaresComunDetalles;