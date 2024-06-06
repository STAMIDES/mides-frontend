import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Grid, Button } from '@mui/material';
import useApi from '../network/axios';

const DetallePedido = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  const fetchPedido = async () => {
    try {
      const response = await api.get(`/pedidos/${id}`);
      setPedido(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching pedido');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedido();
  }, [id]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={7} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Detalle del Pedido
        </Typography>
        {pedido && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Nombre:</Typography>
              <Typography>{pedido.cliente_nombre}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Apellido:</Typography>
              <Typography>{pedido.cliente_apellido}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Documento:</Typography>
              <Typography>{pedido.documento}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Dirección de Origen:</Typography>
              <Typography>{pedido.direccion_origen}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Ventana de Origen:</Typography>
              <Typography>{`${pedido.ventana_origen_inicio} - ${pedido.ventana_origen_fin}`}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Dirección de Destino:</Typography>
              <Typography>{pedido.direccion_destino}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Ventana de Destino:</Typography>
              <Typography>{`${pedido.ventana_destino_inicio} - ${pedido.ventana_destino_fin}`}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Prioridad:</Typography>
              <Typography>{pedido.prioridad ? 'Sí' : 'No'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Acompañante:</Typography>
              <Typography>{pedido.acompañante ? 'Sí' : 'No'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Observaciones:</Typography>
              <Typography>{pedido.observaciones}</Typography>
            </Grid>
          </Grid>
        )}
        <Button variant="contained" color="primary" onClick={() => history.goBack()} sx={{ mt: 3 }}>
          Volver
        </Button>
      </Paper>
    </Container>
  );
};

export default DetallePedido;
