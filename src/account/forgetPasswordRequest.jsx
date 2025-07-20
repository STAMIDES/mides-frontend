import { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button,
  Link,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import useApi from '../network/axios';
import { useNavigate } from 'react-router-dom';

function ForgetPasswordRequest() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const api = useApi();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    
    const email = event.target.email.value;
    
    if (!email) {
      setError('Por favor, ingrese su correo electrónico');
      setLoading(false);
      return;
    }

    try {
      // This POST will send a reset password link to the user's email
      await api.post('/usuarios/forgot-password', { email });
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.message || error.response.statusText || 'Error al procesar la solicitud');
      } else {
        setError('Error de conexión. Por favor intente nuevamente.');
      }
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/cuenta/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f9',
        padding: 2
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '12px',
              marginBottom: '20px'
            }}
          >
            <img 
              src="/imgs/logo_mides_azul.png" 
              alt="Mides Logo" 
              style={{ 
                height: '80px',
                width: '80px', 
                borderRadius: '50%',
                objectFit: 'cover', 
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' 
              }} 
            />
          </div>
          
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              mb: 3,
              fontWeight: 600,
              color: '#1e1e2d'
            }}
          >
            Recuperar Contraseña
          </Typography>

          {!success ? (
            <>
              <Typography 
                variant="body2" 
                align="center" 
                sx={{ 
                  mb: 3,
                  color: '#6B7280'
                }}
              >
                Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña
              </Typography>
              
              <form noValidate onSubmit={handleSubmit}>
                <TextField
                  id="email"
                  label="Correo Electrónico"
                  type="email"
                  margin="normal"
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(102, 108, 255, 0.8)',
                        borderWidth: '1px',
                      },
                    }
                  }}
                />
                
                <Button 
                  variant="contained" 
                  type="submit" 
                  fullWidth
                  disabled={loading}
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: '#1659b4',
                    textTransform: 'none',
                    py: 1.5,
                    boxShadow: '0 4px 12px rgba(102, 108, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 108, 255, 1)',
                      boxShadow: '0 6px 15px rgba(102, 108, 255, 0.3)',
                    },
                    mb: 2
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : (
                    'Enviar Enlace'
                  )}
                </Button>
                
                {error && (
                  <Box
                    sx={{
                      backgroundColor: 'rgba(244, 67, 54, 0.08)',
                      borderRadius: '8px',
                      p: 1.5,
                      mb: 2
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="error"
                      align="center"
                    >
                      {error}
                    </Typography>
                  </Box>
                )}
              </form>
            </>
          ) : (
            <Box
              sx={{
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                borderRadius: '8px',
                p: 2,
                mb: 3
              }}
            >
              <Typography 
                variant="body1" 
                align="center"
                sx={{ color: '#4caf50', mb: 1 }}
              >
                Enlace enviado con éxito
              </Typography>
              <Typography 
                variant="body2" 
                align="center"
                sx={{ color: '#6B7280' }}
              >
                Por favor, revise su correo electrónico para encontrar el enlace de recuperación de contraseña.
              </Typography>
            </Box>
          )}
          
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'center',
              mt: 2
            }}
          >
            <Button
              startIcon={<ArrowBackIosNewIcon fontSize="small" />}
              onClick={handleGoBack}
              sx={{
                color: '#1659b4',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(102, 108, 255, 0.08)',
                }
              }}
            >
              Volver al inicio de sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ForgetPasswordRequest;
