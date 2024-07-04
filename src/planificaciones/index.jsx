import { Route, Routes } from 'react-router-dom';
import PlanificacionListado from './listado';
// import PlanificacionCrear from './crear';

const PlanificacionesRutas = () => {
  return (
    <Routes>
      <Route index element={<PlanificacionListado />} />
      {/* <Route path="crear" element={<PlanificacionCrear />} /> */}
    </Routes>
  );
};

export default PlanificacionesRutas;