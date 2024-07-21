import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Grid } from '@mui/material';
import useApi from '../network/axios';
import ListComponent from "../components/listados";
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import './css/detalles.css';

const columnsPedidos = [
  { label: "Fecha pedido", key: "fecha_programado" },
  { label: "Origen", key: "direccion_origen_y_horario"},
  { label: "Destino", key: "direccion_destino_y_horario" },
  { label: "Fecha ingresada al sistema", key: "fecha_ingresado" }
]

const ClienteDetalles = () => {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [pedidosCliente, setPedidosCliente] = useState([]);
  const [cantidadPedidos, setCantidadPedidos] = useState(0);
  const [pageSize, setPageSize] = useState(10);


  const procesarPedidos = (pedidosSinProcesar) => {
    const nuevoListado = [];
    pedidosSinProcesar.sort((a, b) => new Date(a.fecha_programado) - new Date(b.fecha_programado));
    let cantidad = 0;
    pedidosSinProcesar.forEach(pedido => {
        const paradas = pedido.paradas;
        paradas.sort((a, b) => a.posicion_en_pedido - b.posicion_en_pedido);
        for (let i = 0; i + 1 < paradas.length; i += 1) {
            const origen = paradas[i];
            const destino = paradas[i + 1];
            
            const direccionOrigenYHorario = `${origen.direccion} - ${origen.ventana_horaria_inicio || 'Sin horario'}`;
            const direccionDestinoYHorario = `${destino.direccion} - ${destino.ventana_horaria_inicio || 'Sin horario'}`;
            
            const fechaIngresado = pedido.fecha_ingresado.split('T')[0];
            const fechaProgramado = pedido.fecha_programado.split('T')[0];
            nuevoListado.push({
              fecha_programado: fechaProgramado,
              direccion_origen_y_horario: direccionOrigenYHorario,
              direccion_destino_y_horario: direccionDestinoYHorario,
              fecha_ingresado: fechaIngresado
            });
            cantidad += 1;
        }
    });
    setCantidadPedidos(cantidad);
    return nuevoListado;
  }

  const api = useApi();
  useEffect(() => {
    console.log("Fetching client data...")
    api.get(`clientes/${id}?completo=true`) 
      .then(response => {
        setCliente(response.data);
        setPedidosCliente(procesarPedidos(response.data.pedidos));
      })
      .catch(error => {
        console.error("There was an error fetching the client data!", error);
      });
  }, [id]);

  const obtenerPedidosCliente = async (page=1) => {
    try {
      const offset = page * 10 - pageSize;
      const response = await api.get(`/pedidos/cliente/${cliente.documento}?offset=${offset}&limit=${pageSize}`);
      setPedidosCliente(procesarPedidos(response.data.pedidos));
      setCantidadPedidos(response.data.cantidad);
    } catch (error) {
      console.error('Error fetching client orders:', error);
      if (error.response) {
        setError(error.response.statusText);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

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
                
            <Typography variant="h4" gutterBottom mt={4}>
             Historial de pedidos
            </Typography>
            <ListComponent 
              title="Pedidos" 
              data={pedidosCliente} 
              columns={columnsPedidos} 
              icons={[<ModeEditOutlineIcon />, <DeleteIcon />]}
              iconsLinks={[ "/pedidos/editar",  "/pedidos/eliminar"]} 
              iconsTooltip={[ "Editar Pedido", "Eliminar Pedido"]}
              getFunction={obtenerPedidosCliente}
              pageCounter={Math.floor(cantidadPedidos/pageSize)+1}
            />
        </Paper>
    </Container>
  );
};

export default ClienteDetalles;
