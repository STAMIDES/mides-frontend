import { Route, Routes } from 'react-router-dom';
import Registro from './registro';
import LoginComponent from './Login';
import ForgetPasswordRequest from './forgetPasswordRequest';
import ResetPassword from './resetPassword';
const CuentaRutas = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginComponent />} />
      <Route path="registro/:hash" element={<Registro />} />
      <Route path="reset-password/:token" element={<ResetPassword />} />
      <Route path="recuperar-password" element={<ForgetPasswordRequest />} />
    </Routes>
  );
};

export default CuentaRutas;