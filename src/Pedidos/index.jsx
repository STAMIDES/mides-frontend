import { Route, Routes } from 'react-router-dom';
import PedidoListado from './listado';
import PedidoCrear from './crear';
// import PedidoShow from './PedidoShow'; // assuming you have an edit component

const PedidosRutas = () => {
  return (
    <Routes>
      <Route index element={<PedidoListado />} />
      <Route path="crear" element={<PedidoCrear />} />
    </Routes>
  );
};

export default PedidosRutas;