import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip
} from '@mui/material';
import useApi from '../network/axios';
import ListComponent from '../components/listados';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';

import './css/detalles.css';

const columnsPedidos = [
  { label: 'Fecha pedido', key: 'fecha_programado' },
  { label: 'Origen', key: 'direccion_origen_y_horario' },
  { label: 'Destino', key: 'direccion_destino_y_horario' },
  { label: 'Fecha ingresada al sistema', key: 'fecha_ingresado' }
];

const ClienteDetalles = () => {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [clienteEditor, setClienteEditor] = useState({});
  const [pedidosCliente, setPedidosCliente] = useState([]);
  const [cantidadPedidos, setCantidadPedidos] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [caracteristicasTodas, setCaracteristicasTodas] = useState([]); 
  const [handleDelete, setHandleDelete] = useState(false);
  const [handleActivate, setHandleActivate] = useState(false);
  const navigate = useNavigate();

  const obtenerCaracteristicas = async () => {
    try {
      const response = await api.get('caracteristicas');
      setCaracteristicasTodas(response.data);
    } catch (error) {
      console.error('Error al obtener las caracteristicas:', error);
    }
  };

  const procesarPedidos = (pedidosSinProcesar) => {
    const nuevoListado = [];
    pedidosSinProcesar.sort(
      (a, b) => new Date(a.fecha_programado) - new Date(b.fecha_programado)
    );
    let cantidad = 0;
    pedidosSinProcesar.forEach((pedido) => {
      const paradas = pedido.paradas;
      paradas.sort((a, b) => a.posicion_en_pedido - b.posicion_en_pedido);
      for (let i = 0; i + 1 < paradas.length; i += 1) {
        const origen = paradas[i];
        const destino = paradas[i + 1];

        const direccionOrigenYHorario = `${origen.direccion} - ${
          origen.ventana_horaria_inicio || 'Sin horario'
        }`;
        const direccionDestinoYHorario = `${destino.direccion} - ${
          destino.ventana_horaria_inicio || 'Sin horario'
        }`;

        const fechaIngresado = pedido.fecha_ingresado.split('T')[0];
        const fechaProgramado = pedido.fecha_programado.split('T')[0];
        nuevoListado.push({
          fecha_programado: fechaProgramado,
          direccion_origen_y_horario: direccionOrigenYHorario,
          direccion_destino_y_horario: direccionDestinoYHorario,
          fecha_ingresado: fechaIngresado,
          id:  pedido.id
        });
        cantidad += 1;
      }
    });
    setCantidadPedidos(cantidad);
    return nuevoListado;
  };

  const api = useApi();
  useEffect(() => {
    console.log('Fetching client data...');
    api
      .get(`clientes/${id}?completo=true`)
      .then((response) => {
        setCliente(response.data);
        setClienteEditor(response.data);
        setPedidosCliente(procesarPedidos(response.data.pedidos));
      })
      .catch((error) => {
        console.error('There was an error fetching the client data!', error);
      });
  }, [id]);

  const editarCliente = async () => {
    try {
      clienteEditor.caracteristicas = clienteEditor.caracteristicas.map(caracteristica => caracteristica.id);
      const response = await api.put(`clientes/${cliente.documento}`, clienteEditor);
      setCliente(response.data);
      setClienteEditor(response.data);
    } catch (error) {
      console.error('Error updating client data!', error);
    }
  };

  const handleCheckboxChange = (caracteristica) => {
    if (clienteEditor.caracteristicas.find(clienteCaracteristica => clienteCaracteristica.id === caracteristica.id)) {
      setClienteEditor({ ...clienteEditor, caracteristicas: clienteEditor.caracteristicas.filter(clienteCaracteristica => clienteCaracteristica.id !== caracteristica.id) });
    } else {
      setClienteEditor({ ...clienteEditor, caracteristicas: [...clienteEditor.caracteristicas, caracteristica] });
    }
  }

  const obtenerPedidosCliente = async (page = 1) => {
    try {
      const offset = page * 10 - pageSize;
      const response = await api.get(
        `/pedidos/cliente/${cliente.documento}?offset=${offset}&limit=${pageSize}`
      );
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

  const handleCreateOrder = () => {
    navigate('/solicitudes/crear?usuarioId=' + cliente.id);
  };

  const handleEdit = () => {
    setOpenEditDialog(true);
    if(caracteristicasTodas.length === 0) {
      obtenerCaracteristicas();
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setClienteEditor(cliente);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClienteEditor({ ...clienteEditor, [name]: value });
  };

  const handleSaveChanges = () => {
    editarCliente();
    setOpenEditDialog(false);
  };

  const onDelete = async () => {
    try {
      const response = await api.delete(`/clientes/${cliente.id}`);
      setHandleDelete(false);
      navigate('/usuarios');
    } catch (error) {
      console.error('Error borrando cliente:', error);
    }
  };

  const onActivate = async () => {
    try {
      const response = await api.put(`/clientes/activar/${cliente.documento}`);
      setHandleActivate(false);
      // Update the client state with the new active status
      setCliente({ ...cliente, activo: true });
    } catch (error) {
      console.error('Error activando cliente:', error);
    }
  };

  if (!cliente) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Detalles del Cliente
          {!cliente.activo &&
          <Chip 
            label={"Borrado"} 
            color={ "error"}
            sx={{ ml: 2 }}
          />}
        </Typography>
        <Grid item xs={12} mt={2}>
          <Button variant="contained" color="primary" onClick={handleCreateOrder}>
            Crear Solicitud
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleEdit}
            style={{ marginLeft: '10px' }}
          >
            Editar
          </Button>
          {cliente.activo ? (
            <Button
              variant="contained"
              color="error"
              onClick={()=>setHandleDelete(true)}
              style={{ marginLeft: '10px' }}
            >
              Borrar
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={()=>setHandleActivate(true)}
              style={{ marginLeft: '10px' }}
            >
              Activar
            </Button>
          )}
        </Grid>
        <Grid
          container
          spacing={3}
          mt={2}
          className="details-container"
          marginLeft={0}
          width="100%"
        >
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
            <Typography variant="h6">Caracteristicas:</Typography>
            {cliente.caracteristicas.map((caracteristica, index) => (
              <Typography key={index}>{caracteristica.nombre}</Typography>
            ))}
          </Grid>
          <Grid item xs={12} pb={2}>
            <Typography variant="h6">Observaciones:</Typography>
            <Typography>{cliente.observaciones || 'No disponible'}</Typography>
          </Grid>
        </Grid>

        <Typography variant="h4" gutterBottom mt={4}>
          Historial de solicitudes
        </Typography>
        <ListComponent
          title="Pedidos"
          data={pedidosCliente}
          detailLink='/solicitudes/'
          columns={columnsPedidos}
          icons={[]}
          getFunction={obtenerPedidosCliente}
          pageCounter={Math.ceil(cantidadPedidos / pageSize)}
        />
      </Paper>

      {/* Edit Client Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nombre"
            label="Nombre"
            fullWidth
            value={clienteEditor.nombre}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="apellido"
            label="Apellido"
            fullWidth
            value={clienteEditor.apellido}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="direccion"
            label="Dirección"
            fullWidth
            value={clienteEditor.direccion}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="documento"
            label="Documento"
            fullWidth
            value={clienteEditor.documento}
            onChange={handleInputChange}
            disabled
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            fullWidth
            value={clienteEditor.email || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="telefono"
            label="Teléfono"
            fullWidth
            value={clienteEditor.telefono}
            onChange={handleInputChange}
          />
          {caracteristicasTodas.map((caracteristica, index) => (
            <FormControlLabel
              key={caracteristica.id}
              control={
                <Checkbox
                  checked={clienteEditor.caracteristicas.find(clienteCaracteristica => clienteCaracteristica.id === caracteristica.id)}
                  onChange={() => handleCheckboxChange(caracteristica)}
                />
              }
              label={caracteristica.nombre}
            />
          ))}
          <TextField
            margin="dense"
            name="observaciones"
            label="Observaciones"
            fullWidth
            multiline
            rows={4}
            value={clienteEditor.observaciones || ''}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={handleDelete}
        onClose={()=>setHandleDelete(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar Borrado</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro que deseas eliminar este usuario? (Borrado lógico)
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setHandleDelete(false)}>Cancelar</Button>
          <Button color="error" onClick={()=>onDelete()} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <Dialog
        open={handleActivate}
        onClose={()=>setHandleActivate(false)}
        aria-labelledby="activate-dialog-title"
        aria-describedby="activate-dialog-description"
      >
        <DialogTitle id="activate-dialog-title">Confirmar Activación</DialogTitle>
        <DialogContent>
          <DialogContentText id="activate-dialog-description">
            ¿Estás seguro que deseas reactivar este usuario?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setHandleActivate(false)}>Cancelar</Button>
          <Button color="success" onClick={()=>onActivate()} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClienteDetalles;