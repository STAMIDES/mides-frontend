import { Route, Routes } from 'react-router-dom';
import ClienteListado from './listado';
import ClienteCrear from './crear';
// import ClienteShow from './ClienteShow'; // assuming you have an edit component

const ClientesRutas = () => {
  return (
    <Routes>
      <Route index element={<ClienteListado />} />
      <Route path="crear" element={<ClienteCrear />} />
      {/* <Route path=":id/edit" element={<ClienteShow />} />  */}
    </Routes>
  );
};

export default ClientesRutas;