import { Route, Routes } from 'react-router-dom';
import UsuarioListado from './usuarios/listado';
import UsuarioInvitar from './usuarios/invitar';

import CamionetasListado from './camionetas/listado';
import CamionetasCrear from './camionetas/crear';

import LugaresComunesListado from './lugaresComunes/listado';
import LugaresComunesCrear from './lugaresComunes/crear';

import ChoferesListado from './choferes/listado';
import ChoferesCrear from './choferes/crear';

const AdministracionRutas = () => {
  return (
    <Routes>
      <Route path="usuarios" element={<UsuarioListado />} />
      <Route path="usuarios/invitar" element={<UsuarioInvitar />} />

      <Route path="lugares_comunes" element={<LugaresComunesListado />} />
      <Route path="lugares_comunes/crear" element={<LugaresComunesCrear />} />

      <Route path="choferes" element={<ChoferesListado />} />
      <Route path="choferes/crear" element={<ChoferesCrear />} />

      <Route path="camionetas" element={<CamionetasListado />} />
      <Route path="camionetas/crear" element={<CamionetasCrear />} />
    </Routes>
  );
};

export default AdministracionRutas;