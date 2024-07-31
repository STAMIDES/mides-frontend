import { Route, Routes } from 'react-router-dom';
import OperadorListado from './usuarios/listado';
import OperadorInvitar from './usuarios/invitar';
import OperadorDetalles from './usuarios/detalle';

import CamionetasListado from './camionetas/listado';
import CamionetasCrear from './camionetas/crear';
import CamionetasDetalles from './camionetas/detalle';

import LugaresComunesListado from './lugaresComunes/listado';
import LugaresComunesCrear from './lugaresComunes/crear';
import LugaresComunDetalles from './lugaresComunes/detalle';

import ChoferesListado from './choferes/listado';
import ChoferesCrear from './choferes/crear';
import ChoferDetalles from './choferes/detalle';

const AdministracionRutas = () => {
  return (
    <Routes>
      <Route path="operadores" element={<OperadorListado />} />
      <Route path="operadores/invitar" element={<OperadorInvitar />} />
      <Route path="operadores/:id" element={<OperadorDetalles />} />

      <Route path="lugares_comunes" element={<LugaresComunesListado />} />
      <Route path="lugares_comunes/crear" element={<LugaresComunesCrear />} />
      <Route path="lugares_comunes/:id" element={<LugaresComunDetalles />} />

      <Route path="choferes" element={<ChoferesListado />} />
      <Route path="choferes/crear" element={<ChoferesCrear />} />
      <Route path="choferes/:id" element={<ChoferDetalles />} />

      <Route path="camionetas" element={<CamionetasListado />} />
      <Route path="camionetas/crear" element={<CamionetasCrear />} />
      <Route path="camionetas/:id" element={<CamionetasDetalles />} />
    </Routes>
  );
};

export default AdministracionRutas;