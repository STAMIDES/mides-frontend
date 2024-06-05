import { Route, Routes } from 'react-router-dom';
import ClienteListado from './Listado';
import ClienteCrear from './crear';

const ClientesRutas = () => {
  return (
    <Routes>
      <Route index element={<ClienteListado />} />
      <Route path="crear" element={<ClienteCrear />} />
    </Routes>
  );
};

export default ClientesRutas;