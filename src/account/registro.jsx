import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Link } from '@mui/material';
import useApi from '../network/axios';
import { useNavigate, useParams } from 'react-router-dom';
import './css.css';
function RegisterComponent() {
  const [email, setEmail] = useState(null);
  const [rol, setRole] = useState(null);
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isHashValid, setIsHashValid] = useState(true);
  const { hash } = useParams();
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await api.get(`/usuarios/registro/${hash}`);
        const { email, rol } = response.data;
        setEmail(email);
        setRole(rol);
      } catch (error) {
        setIsHashValid(false);
        setError('Enlace de invitación inválido');
      }
    };

    fetchInvitationDetails();
  }, [hash, api]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await api.post(`/usuario/registro/${hash}`, {
        email,
        rol,
        password,
      });
      navigate(`/cuenta/login?email=${email}`);
    } catch (error) {
      setError('Ocurrió un error durante el registro');
    }
  };

  if (!isHashValid) {
    return (
      <Card className="register-card">
        <CardContent className="register-card-content">
          <Typography variant="h5" color="error">
            {error}
          </Typography>
          <Link href="/cuenta/login" variant="body2">
            Ir a la página de inicio de sesión
          </Link>
        </CardContent>
      </Card>
    );
  }
  console.log(email)
  return (
    <Card className="login-card">
      <CardContent className="register-card-content">
        <img src="/src/imgs/logo_mides.png" alt="Mides Logo" className="logo" />
        <form noValidate onSubmit={handleSubmit}>
          <TextField
            id="email"
            label="Email"
            type="email"
            value={email || ''}
            margin="normal"
            fullWidth
            disabled
          />
          <TextField
            id="rol"
            label="Rol de usuario"
            type="text"
            value={rol || ''}
            margin="normal"
            fullWidth
            disabled
          />
          <TextField
            id="nombre_usuario"
            label="Nombre de usuario"
            type="text"
            value={nombre || ''}
            margin="normal"
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
          />
          <TextField
            id="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            fullWidth
          />
          <TextField
            id="confirmPassword"
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            fullWidth
          />
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Registrarse
          </Button>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export default RegisterComponent;
