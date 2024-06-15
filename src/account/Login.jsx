import {useState} from 'react';
import { Card, CardContent, Typography, TextField, Button, Link } from '@mui/material';
import './css.css';
import useApi from '../network/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


function LoginComponent() {
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const api = useApi();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    
    if (!username || !password) {
      setError('Por favor, complete todos los campos');
      return;
    }else if (password.length < 7) {
      setError('El usuario y la contraseña deben tener al menos 7 caracteres');
      return;
    }
    try {
      const response = await api.post('/usuarios/login', {
        username,
        password,
      });
      
      const token = response.data.token;
      const refresh_token = response.data.refresh_token;
      if (token && refresh_token) {
          login(token, refresh_token);
          navigate('/pedidos');
      } else {
          setError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
        if (error.response) {
          setError(error.response.statusText);
        } else {
          setError('An unexpected error occurred');
        }
    }
  };

  return (
    <Card className="login-card">
      <CardContent className='login-card-content'>
        <img src="/src/imgs/logo_mides.png" alt="Mides Logo" className="logo" />
        <form noValidate onSubmit={handleSubmit}>
          <TextField
            id="username"
            label="Usuario"
            type="text"
            margin="normal"
            fullWidth
          />
          <TextField
            id="password"
            label="Contraseña"
            type="password"
            margin="normal"
            fullWidth
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Ingresar
          </Button>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </form>
        <Typography variant="body2" display="flex" justifyContent="space-between">
          <Link href="#" className="link">¿Olvidaste la contraseña?</Link>
        </Typography>
      </CardContent>
    </Card>
  );
}

export default LoginComponent;