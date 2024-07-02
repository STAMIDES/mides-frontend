import { Route, Routes } from 'react-router-dom';
import ClienteListado from './listado';
import ClienteCrear from './crear';
import ClienteDetalles from './detalles';

const ClientesRutas = () => {
  return (
    <Routes>
      <Route index element={<ClienteListado />} />
      <Route path="crear" element={<ClienteCrear />} />
      <Route path=":id" element={<ClienteDetalles />} />
    </Routes>
  );
};

export default ClientesRutas;