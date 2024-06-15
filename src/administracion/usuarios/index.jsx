import { Route, Routes } from 'react-router-dom';
import UsuarioListado from './listado';
import UsuarioInvitar from './invitar';

const UsuariosRutas = () => {
  return (
    <Routes>
      <Route index element={<UsuarioListado />} />
      <Route path="invitar" element={<UsuarioInvitar />} />
    </Routes>
  );
};

export default UsuariosRutas;