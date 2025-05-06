import { Route, Routes } from 'react-router-dom';
import PlanificacionListado from './listado';
import InformeEstadistico from './informe';

const PlanificacionesRutas = () => {
  return (
    <Routes>
      <Route index element={<PlanificacionListado />} />
      <Route path="informe" element={<InformeEstadistico />} />
    </Routes>
  );
};

export default PlanificacionesRutas;