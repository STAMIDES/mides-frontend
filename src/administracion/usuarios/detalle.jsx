import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid } from '@mui/material';
import useApi from '../../network/axios';
import '../css/detalle.css';

const OperadorDetalles = () => {
  const { id } = useParams();
  const [operador, setOperador] = useState(null);

  const api = useApi();
  useEffect(() => {
    console.log("Fetching operador data...");
    api.get(`usuarios/${id}`)
      .then(response => {
        setOperador(response.data.usuario);
      })
      .catch(error => {
        console.error("There was an error fetching the operador data!", error);
      });
  }, [id]);

  if (!operador) {
    return <Typography>Loading...</Typography>;
  }

  const handleEdit = () => {
    console.log("Editing operador", operador.id);
  };

  const handleDelete = () => {
    console.log("Deleting operador", operador.id);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column'}}>
        <div className='header-container'>
          <Typography variant="h4" gutterBottom>
            Detalles del Operador
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
            <Typography>{operador.nombre}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Email:</Typography>
            <Typography>{operador.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} mb={2}>
            <Typography variant="h6">Rol:</Typography>
            <Typography>{operador.rol}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default OperadorDetalles;