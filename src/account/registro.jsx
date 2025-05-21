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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import useApi from '../network/axios';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

function RegisterComponent() {
  const [email, setEmail] = useState(null);
  const [nombre, setNombre] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isHashValid, setIsHashValid] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { hash } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const path = `/usuarios/registro/${hash}`;

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await api.get(path);
        const { email, nombre } = response.data;
        setEmail(email);
        setNombre(nombre);
        setLoading(false);
      } catch (error) {
        setIsHashValid(false);
        setError(error.response?.data?.detail || 'Enlace de registro inválido');
        setLoading(false);
      }
    };

    fetchInvitationDetails();
  }, [hash, api, path]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    } else if (password.length < 7) {
      setError('La contraseña debe tener al menos 7 caracteres');
      setLoading(false);
      return;
    }

    try {
      await api.post(path, {
        nombre,
        password,
      });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.detail || 'Ocurrió un error durante el registro, intenta nuevamente');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const renderContent = () => {
    if (!isHashValid) {
      return (
        <Box>
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              mb: 3,
              fontWeight: 600,
              color: '#d32f2f'
            }}
          >
            {error}
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/cuenta/login"
            fullWidth
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
            }}
          >
            Ir a la página de inicio de sesión
          </Button>
        </Box>
      );
    }

    if (success) {
      return (
        <Box>
          <Box
            sx={{
              backgroundColor: 'rgba(46, 125, 50, 0.08)',
              borderRadius: '8px',
              p: 3,
              mb: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                mb: 1,
                fontWeight: 600,
                color: '#2e7d32'
              }}
            >
              ¡Cuenta creada exitosamente!
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ mb: 1.1 }}
            >
              Ya puedes iniciar sesión con tus nuevas credenciales.
            </Typography>
          </Box>
          <Button
            variant="contained"
            component={RouterLink}
            to="/cuenta/login"
            fullWidth
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
            }}
          >
            Ir a la página de inicio de sesión
          </Button>
        </Box>
      );
    }

    return (
      <Box>
        <Typography 
          variant="h5" 
          align="center" 
          sx={{ 
            mb: 1,
            fontWeight: 600,
            color: '#1e1e2d'
          }}
        >
          Completar Registro
        </Typography>
        
        <form noValidate onSubmit={handleSubmit}>
          <TextField
            id="email"
            label="Email"
            size="small"
            type="email"
            value={email || ''}
            margin="normal"
            fullWidth
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 1.1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />
          
          <TextField
            id="nombre"
            label="Nombre de usuario"
            type="text"
            size="small"
            value={nombre || ''}
            onChange={(e) => setNombre(e.target.value)}
            margin="normal"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 1.1,
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            size="small"
            fullWidth
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
              mb: 1.1,
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
          
          <TextField
            id="confirmPassword"
            label="Confirmar Contraseña"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            size="small"
            fullWidth
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
            size="small"
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
              mb: 1
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Registrarse'
            )}
          </Button>
          
          {error && (
            <Box
              sx={{
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                borderRadius: '8px',
                p: 1,
                mb: 1.1
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
            component={RouterLink}  
            to="/cuenta/login"
            sx={{
              color: 'rgba(102, 108, 255, 0.9)',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            ¿Ya tienes una cuenta? Iniciar sesión
          </Link>
        </Box>
      </Box>
    );
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
          overflow: 'hidden',
          padding: 0
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '12px',
              marginBottom: '12px'
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
          
          {loading && !success && !isHashValid ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderContent()
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default RegisterComponent;