import { Route, Routes } from 'react-router-dom';
import Registro from './registro';
import LoginComponent from './Login';

const CuentaRutas = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginComponent />} />
      <Route path="registro/:hash" element={<Registro />} />
    </Routes>
  );
};

export default CuentaRutas;