import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Grid, 
  Alert
} from '@mui/material';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';
import useApi from '../network/axios';

const InformeEstadistico = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const api = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      setError('Por favor seleccione fechas de inicio y fin');
      return;
    }
    
    if (moment(endDate).isBefore(startDate)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
      const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
      
      const response = await api.get(`/planificaciones/informe_estadistico?start_date=${formattedStartDate}&end_date=${formattedEndDate}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `informe_estadistico_${formattedStartDate}_${formattedEndDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Informe descargado exitosamente');
    } catch (error) {
      console.error('Error al generar el informe:', error);
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          const mensaje = json.detail || 'Error desconocido.';
          setError(mensaje);
        } catch (parseError) {
          console.error('No se pudo parsear el error:', parseError);
          setError('Error al generar el informe. Por favor intente nuevamente.');
        }   
      } else {
        setError('Error al generar el informe. Por favor intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Generar Informe Estadístico
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="Fecha de inicio"
                  value={startDate}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                    setError(null);
                  }}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      required: true,
                      placeholder: "dd/mm/yyyy",
                      InputLabelProps: {
                        shrink: true,
                      }
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  label="Fecha de fin"
                  value={endDate}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                    setError(null);
                  }}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      required: true,
                      placeholder: "dd/mm/yyyy",
                      InputLabelProps: {
                        shrink: true,
                      }
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            {error && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>
                  {error}
                </Alert>
              </Grid>
            )}

            {success && (
              <Grid item xs={12}>
                <Alert severity="success">{success}</Alert>
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                disabled={loading}
                size="large"
              >
                {loading ? 'Generando...' : 'Generar Informe'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default InformeEstadistico;
