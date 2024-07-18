import { Route, Routes } from 'react-router-dom';
import PedidoListado from './listado';
import PedidoCrear from './crear';
import PedidoDetalles from './detalle';

const PedidosRutas = () => {
  return (
    <Routes>
      <Route index element={<PedidoListado />} />
      <Route path="crear" element={<PedidoCrear />} />
      <Route path=":id" element={<PedidoDetalles />} />
    </Routes>
  );
};

export default PedidosRutas;