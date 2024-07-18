import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid } from '@mui/material';
import useApi from '../network/axios';
import './css/detalle.css';  // Make sure to create this CSS file

const PedidoDetalles = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);

  const api = useApi();
  useEffect(() => {
    console.log("Fetching pedido data...");
    api.get(`pedidos/${id}`)
      .then(response => {
        setPedido(response.data.pedido);
      })
      .catch(error => {
        console.error("There was an error fetching the pedido data!", error);
      });
  }, [id]);

  if (!pedido) {
    return <Typography>Loading...</Typography>;
  }

  const handleEdit = () => {
    console.log("Editing pedido", pedido.id);
  };

  const handleDelete = () => {
    console.log("Deleting pedido", pedido.id);
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className='header-container' style={{ width: '100%' }}>
          <Typography variant="h4" gutterBottom>
            Detalles del Pedido
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
        <Grid container spacing={3} mt={2} className='details-container' style={{ width: '100%', margin: '0' }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Prioridad:</Typography>
            <Typography>{pedido.prioridad}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Tipo:</Typography>
            <Typography>{pedido.tipo}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Fecha Programada:</Typography>
            <Typography>{formatDateTime(pedido.fecha_programado)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Fecha Ingresada:</Typography>
            <Typography>{formatDateTime(pedido.fecha_ingresado)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Acompañante:</Typography>
            <Typography>{pedido.acompañante ? 'Sí' : 'No'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Observaciones:</Typography>
            <Typography>{pedido.observaciones}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>Información del Cliente</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Nombre:</Typography>
            <Typography>{`${pedido.cliente.nombre} ${pedido.cliente.apellido}`}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Documento:</Typography>
            <Typography>{pedido.cliente.documento}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Teléfono:</Typography>
            <Typography>{pedido.cliente.telefono}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>Paradas</Typography>
          </Grid>
          {pedido.paradas.map((parada, index) => (
            <Grid item xs={11.5} key={parada.id}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Parada {index + 1}</Typography>
                <Typography>Dirección: {parada.direccion}</Typography>
                <Typography>Horario: {parada.ventana_horaria_inicio} - {parada.ventana_horaria_fin}</Typography>
                <Typography>Observaciones: {parada.observaciones}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default PedidoDetalles;