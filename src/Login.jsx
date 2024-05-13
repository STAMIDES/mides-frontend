import {useState} from 'react';
import { Card, CardContent, Typography, TextField, Button, Link } from '@mui/material';
import './Login.css';
import api from './network/axios';


function LoginComponent() {
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        console.log(username);
        const password = event.target.password.value;
        try {
            const response = await api.post('/usuarios/login', {
                username,
                password,
            });
            // Handle successful login response
            console.log(response.data);
        // Redirect to dashboard or other protected route
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
        <img src="src/imgs/logo_mides.png" alt="Mides Logo" className="logo" />
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
          <Link href="#" className="link">Olvidaste la contraseña?</Link>
          <Link href="#" className="link">Crear cuenta</Link>
        </Typography>
      </CardContent>
    </Card>
  );
}

export default LoginComponent;