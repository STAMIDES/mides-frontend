import { Route, Routes } from 'react-router-dom';
import Registro from './registro';
import LoginComponent from './Login';

const CuentaRouter = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginComponent />} />
      <Route path="registro/:hash" element={<Registro />} />
    </Routes>
  );
};

export default CuentaRouter;