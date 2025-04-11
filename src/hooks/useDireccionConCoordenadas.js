import { useState } from 'react';

const useDireccionConCoordenadas = (inicial = '') => {
  const [direccion, setDireccion] = useState(inicial);
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [seleccionManual, setSeleccionManual] = useState(false);

  const handleDireccionChange = (value) => {
    setDireccion(value);
    if (!seleccionManual) {
      setLatitud(null);
      setLongitud(null);
    }
  };

  const setCoordenadas = (lat, lng, manual = false) => {
    setLatitud(lat);
    setLongitud(lng);
    setSeleccionManual(manual);
  };

  return {
    direccion,
    latitud,
    longitud,
    seleccionManual,
    handleDireccionChange,
    setCoordenadas,
    setDireccion: setDireccion, // por si querés setearla directamente
  };
};

export default useDireccionConCoordenadas;
