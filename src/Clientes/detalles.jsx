import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid } from '@mui/material';
import useApi from '../network/axios';
import './css/detalles.css';
const ClienteDetalles = () => {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const api = useApi();
  useEffect(() => {
    console.log("Fetching client data...")
    api.get(`clientes/${id}?completo=true`) 
      .then(response => {
        setCliente(response.data.cliente);
      })
      .catch(error => {
        console.error("There was an error fetching the client data!", error);
      });
  }, [id]);

  if (!cliente) {
    return <Typography>Loading...</Typography>;
  }

  const handleCreateOrder = () => {
  };

  const handleEdit = () => {
  };

  const handleDelete = () => {
    // Implement delete functionality here
    console.log("Deleting client", cliente.id);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }} >
            <Typography variant="h4" gutterBottom>
            Detalles del Cliente
            </Typography>
                <Grid container spacing={3}  mt={2} className='details-container' marginLeft={0} width="100%">
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">Nombre:</Typography>
                        <Typography>{cliente.nombre}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">Apellido:</Typography>
                        <Typography>{cliente.apellido}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">Dirección:</Typography>
                        <Typography>{cliente.direccion}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">Documento:</Typography>
                        <Typography>{cliente.documento}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">Email:</Typography>
                        <Typography>{cliente.email || 'No disponible'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">Teléfono:</Typography>
                        <Typography>{cliente.telefono}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6">Tipo:</Typography>
                        <Typography>{cliente.tipo}</Typography>
                    </Grid>
                    <Grid item xs={12} pb={2}>
                        <Typography variant="h6">Observaciones:</Typography>
                        <Typography>{cliente.observaciones || 'No disponible'}</Typography>
                    </Grid>
                </Grid>
                <Grid item xs={12} mt={2}>
                    <Button variant="contained" color="primary" onClick={handleCreateOrder}>
                    Crear Pedido
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleEdit} style={{ marginLeft: '10px' }}>
                    Editar
                    </Button>
                    <Button variant="contained" color="error" onClick={handleDelete} style={{ marginLeft: '10px' }}>
                    Borrar
                    </Button>
                </Grid>
        </Paper>
    </Container>
  );
};

export default ClienteDetalles;
