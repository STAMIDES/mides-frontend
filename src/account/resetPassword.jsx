import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import useApi from '../network/axios';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

function ResetPassword() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [validating, setValidating] = useState(true);
  
  const navigate = useNavigate();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const api = useApi();

  useEffect(() => {
    // Validate token on component mount
    const validateToken = async () => {
      try {
        await api.post('/usuarios/validate-reset-token', { token, email });
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        setError('El enlace de recuperación es inválido o ha expirado');
      } finally {
        setValidating(false);
      }
    };
    console.log("Token:", token);
    console.log("Email:", email);
    if (token && email) {
      validateToken();
    } else {
      setTokenValid(false);
      setValidating(false);
      setError('Faltan parámetros requeridos');
    }
  }, [token, email, api]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;
    
    if (!password || !confirmPassword) {
      setError('Por favor, complete todos los campos');
      setLoading(false);
      return;
    } else if (password.length < 7) {
      setError('La contraseña debe tener al menos 7 caracteres');
      setLoading(false);
      return;
    } else if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      await api.post('/usuarios/reset-password', { 
        token,
        email,
        new_password: password
      });
      
      setSuccess(true);
      setLoading(false);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/cuenta/login');
      }, 3000);
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.message || error.response.statusText || 'Error al restablecer la contraseña');
      } else {
        setError('Error de conexión. Por favor intente nuevamente.');
      }
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (validating) {
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
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress sx={{ mb: 2, color: '#1659b4' }} />
          <Typography variant="body1">Verificando enlace de recuperación...</Typography>
        </Card>
      </Box>
    );
  }

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
              src="/src/imgs/logo_mides_azul.png" 
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
            Cambiar Contraseña
          </Typography>

          {!tokenValid && !success ? (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || 'El enlace de recuperación es inválido o ha expirado'}
              </Alert>
              <Button 
                variant="contained" 
                fullWidth
                onClick={handleGoToLogin}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#1659b4',
                  textTransform: 'none',
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(102, 108, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 108, 255, 1)',
                    boxShadow: '0 6px 15px rgba(102, 108, 255, 0.3)',
                  }
                }}
              >
                Volver al inicio de sesión
              </Button>
            </Box>
          ) : success ? (
            <Box sx={{ mb: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión en unos segundos.
              </Alert>
              <Button 
                variant="contained" 
                fullWidth
                onClick={handleGoToLogin}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: '#1659b4',
                  textTransform: 'none',
                  py: 1.5,
                  boxShadow: '0 4px 12px rgba(102, 108, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 108, 255, 1)',
                    boxShadow: '0 6px 15px rgba(102, 108, 255, 0.3)',
                  }
                }}
              >
                Ir al inicio de sesión
              </Button>
            </Box>
          ) : (
            <>
              <Typography 
                variant="body2" 
                align="center" 
                sx={{ 
                  mb: 3,
                  color: '#6B7280'
                }}
              >
                Ingrese su nueva contraseña
              </Typography>
              
              <form noValidate onSubmit={handleSubmit}>
                <TextField
                  id="password"
                  label="Nueva Contraseña"
                  type={showPassword ? "text" : "password"}
                  margin="normal"
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(102, 108, 255, 0.8)',
                        borderWidth: '1px',
                      },
                    }
                  }}
                />
                
                <TextField
                  id="confirmPassword"
                  label="Confirmar Contraseña"
                  type={showConfirmPassword ? "text" : "password"}
                  margin="normal"
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={toggleConfirmPasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
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
                    'Cambiar Contraseña'
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
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default ResetPassword;