import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Link,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import useApi from '../network/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, setAuthContext } = useAuth();
  const navigate = useNavigate();
  const api = useApi();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    
    const username = event.target.username.value;
    const password = event.target.password.value;
    
    if (!username || !password) {
      setError('Por favor, complete todos los campos');
      setLoading(false);
      return;
    } else if (password.length < 7) {
      setError('El usuario y la contraseña deben tener al menos 7 caracteres');
      setLoading(false);
      return;
    }

    try {
      // This POST will set the cookies (access/refresh tokens) via Set-Cookie headers
      await api.post('/usuarios/login', { username, password });
      setAuthContext(username);
      
      // Navigate on success
      navigate('/usuarios');
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.message || error.response.statusText || 'Error de autenticación');
      } else {
        setError('Error de conexión. Por favor intente nuevamente.');
      }
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/usuarios');
    }
  }, [isAuthenticated, navigate]);

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
            Iniciar Sesión
          </Typography>
          
          <form noValidate onSubmit={handleSubmit}>
            <TextField
              id="username"
              label="Usuario"
              type="text"
              margin="normal"
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon color="action" />
                  </InputAdornment>
                ),
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
              id="password"
              label="Contraseña"
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
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '&:hover fieldset': {
                    borderColor: 'rgba(102, 108, 255, 0.5)',
                  },
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
                backgroundColor: ' #1659b4 ',
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
                'Ingresar'
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
          
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'center',
              mt: 1
            }}
          >
            <Link
              href="#"
              sx={{
                color: 'rgba(102, 108, 255, 0.9)',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              ¿Olvidaste la contraseña?
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginComponent;