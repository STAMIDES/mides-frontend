import { Route, Routes } from 'react-router-dom';
import PlanificacionListado from './listado';

const PlanificacionesRutas = () => {
  return (
    <Routes>
      <Route index element={<PlanificacionListado />} />
    </Routes>
  );
};

export default PlanificacionesRutas;