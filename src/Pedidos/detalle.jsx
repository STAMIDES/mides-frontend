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
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  IconButton,
  Divider
} from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useApi from '../network/axios';
import moment from 'moment';

const PedidoDetalles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  const [editedPedido, setEditedPedido] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const api = useApi();

  moment.locale('en', {
    longDateFormat: {
      L: 'DD-MM-YYYY',
    }
  });

  useEffect(() => {
    fetchPedido();
  }, [id]);

  const fetchPedido = async () => {
    try {
      const response = await api.get(`pedidos/${id}`);
      const pedidoData = response.data.pedido;
      
      setPedido(pedidoData);
      setEditedPedido({
        ...pedidoData,
        paradas: [...pedidoData.paradas]
      });
    } catch (error) {
      setError("Error al cargar la solicitud");
      console.error("Error fetching solicitud:", error);
    }
  };

  const handleEdit = () => {
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    setDialogMode('delete');
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setDialogMode(null);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    try {
      if (dialogMode === 'edit') {
        // Format the date for the API
        await api.put(`pedidos/${id}`, editedPedido);
        setSuccess("Solicitud actualizado exitosamente");
        fetchPedido();
      } else if (dialogMode === 'delete') {
        if (pedido.estado !== 'Pendiente') {
          return alert('La solicitud debe estar en estado pendiente para poder ser eliminada');
        }
        await api.delete(`pedidos/${id}`);
        setSuccess("Solicitud eliminado exitosamente");
        setTimeout(() => {
          navigate('/solicitudes');
        }, 1500);
      }
    } catch (error) {
      setError(dialogMode === 'edit' ? 
        "Error al actualizar la solicitud" : 
        "Error al eliminar la solicitud"
      );
      console.error("Error:", error);
    }
  };
  const handleDateChange = (e) => {
    if (pedido.estado !== 'Pendiente') {
      return alert('La solicitud debe estar en estado pendiente para poder modificar las paradas');
    }
    setEditedPedido({ 
        ...editedPedido,
        fecha_programado: e ? e : ''
      });
      return;
  }
  const handleInputChange = (field, newValue) => (event) => {
    if (pedido.estado !== 'Pendiente') {
      return alert('La solicitud debe estar en estado pendiente para poder modificar las paradas');
    }
    const value = event.target.value;
    setEditedPedido({
      ...editedPedido,
      [field]: event.target.type === 'checkbox' ? event.target.checked : value
    });
  };

  if (!pedido) {
    return <Typography>Loading...</Typography>;
  }

  const formatDateTime = (dateTimeString) => {
    return moment(dateTimeString).format('DD-MM-YYYY');
  };
  console.log(pedido.fecha_programado)
  return (
    <>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column'}}>
        {/* Existing header and content remains the same */}
        <div className='header-container' style={{ width: '100%' }}>
          <Typography variant="h4" gutterBottom>
            Detalles de la solicitud
          </Typography>
          <div>
            <Button variant="contained" color="secondary" onClick={handleEdit}>
              Editar
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleDelete} 
              sx={{ marginLeft: '10px' }}
            >
              Borrar
            </Button>
          </div>
        </div>
        <Grid container spacing={3}  className='details-container' style={{ width: '100%', margin: '0' }}>
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
          <Grid item xs={12} sm={6} mb={2}>
            <Typography variant="h6">Estado:</Typography>
            <Typography>{pedido.estado}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Acompañante:</Typography>
            <Typography>{pedido.acompañante ? 'Sí' : 'No'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Prioridad:</Typography>
            <Typography>{pedido.prioridad}</Typography>
          </Grid>
          <Grid item xs={12} mb={2}>  
            <Typography variant="h6">Observaciones:</Typography>
            <Typography>{pedido.observaciones}</Typography>
          </Grid>
        </Grid>
          
          <Grid mt={2}>
            <Typography variant="h5" gutterBottom>Información del Cliente</Typography>
          </Grid>

        <Grid container spacing={3} mt={2} className='details-container' style={{ width: '100%', margin: '0' }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Nombre:</Typography>
            <Typography>{`${pedido.cliente.nombre} ${pedido.cliente.apellido}`}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Documento:</Typography>
            <Typography>{pedido.cliente.documento}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} mb={2}>
            <Typography variant="h6">Teléfono:</Typography>
            <Typography>{pedido.cliente.telefono}</Typography>
          </Grid>
        </Grid>
          
          <Grid item xs={12} mt={2}>
            <Typography variant="h5" gutterBottom>Paradas</Typography>
          </Grid>
        <Grid container spacing={3} mt={2} className='details-container' style={{ width: '100%', margin: '0' }}>
          {pedido.paradas.map((parada, index) => (
            <Grid item xs={11.5} key={parada.id}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }} >
                <Typography variant="h6">Parada {index + 1}</Typography>
                <Typography>Dirección: {parada.direccion}</Typography>
                <Typography>Horario: {parada.ventana_horaria_inicio} - {parada.ventana_horaria_fin}</Typography>
                <Typography>Observaciones: {parada.observaciones}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Dialog 
          open={isDialogOpen} 
          onClose={handleClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogMode === 'edit' ? 'Editar Pedido' : 'Confirmar Eliminación'}
          </DialogTitle>
          
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {dialogMode === 'edit' ? (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'es-UY'}>
                  <DatePicker
                    label="Fecha"
                    name="fecha_programado"
                    format="DD/MM/YYYY"
                    onChange={(newValue) => handleDateChange(newValue, 'date')}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        required: true,
                        placeholder: "dd/mm/yyyy",
                        value: moment(editedPedido.fecha_programado, "YYYY-MM-DD"),
                        InputLabelProps: {
                          shrink: true,
                        }
                      } 
                    }}
                  />
                </LocalizationProvider>
                <div style={{ display: 'flex', alignItems: 'center' }}>

                <FormControlLabel
                  control={
                    <Switch
                      checked={editedPedido.prioridad}
                      onChange={handleInputChange('prioridad')}
                      color="primary"
                    />
                  }
                  label="Prioridad"
                />
                <FormControlLabel
                  control={
                    <Switch
                    checked={editedPedido.acompañante}
                    onChange={handleInputChange('acompañante')}
                    color="primary"
                    />
                  }
                  label="Acompañante"
                  />
                  </div>

                <TextField
                  label="Observaciones"
                  multiline
                  rows={4}
                  value={editedPedido.observaciones}
                  onChange={handleInputChange('observaciones')}
                  fullWidth
                />  
                <p style={{ color: 'red', fontSize: '0.8rem' }}>
                    Para poder editar la solicitud este debe estar en estado pendiente y
                    en caso de querer modificar las paradas es necesario crear una nueva solicitud
                  </p>

                <Divider sx={{ my: 2 }} />
              </Box>
            ) : (
              <Typography sx={{ mt: 2 }}>
                ¿Está seguro que desea eliminar esta solicitud? Esta acción no se puede deshacer.
              </Typography>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              variant="contained"
              color={dialogMode === 'delete' ? 'error' : 'primary'}
              onClick={handleSave}
            >
              {dialogMode === 'edit' ? 'Guardar' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </>
  );
};

export default PedidoDetalles;