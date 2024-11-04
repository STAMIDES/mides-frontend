import React, { useState, useEffect, useCallback  } from "react";
import { Container } from "@mui/material";
import Header from "../../components/headerList";
import ListComponent from "../../components/listados";
import useApi from "../../network/axios"; // Ensure this path matches your actual API file path
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import DeleteIcon from '@mui/icons-material/Delete';

const columns = [
  { label: "Matricula", key: "matricula" },
  { label: "Capacidad", key: "capacidad_convencional" },
  { label: "Capacidad silla de ruedas", key: "capacidad_silla_de_ruedas" },
  { label: "Activo", key: "activo" },
  { label: "Descripcion", key: "descripcion" }
];

const ComionetasListado = () => {
  const [camionetas, setCamionetas] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadCamionetas, setCantidadCamionetas] = useState(0); // [1
  const api = useApi();

  const obtenerCamionetas = async (page=1, search='') => {
    try {
      const offset = page * 10 - pageSize;
      const response = await api.get(`/vehiculos?offset=${offset}&limit=${pageSize}&search=${search}`);
      setCamionetas(response.data.vehiculos);
      setCantidadCamionetas(response.data.cantidad);
    } catch (error) {
      if (error.response) {
        setError(error.response.statusText);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    obtenerCamionetas();
  }, []);

  const handleSearch = (searchTerm) => {
    obtenerCamionetas(1, searchTerm);
  };

  const setStatus = async (id, status) => {
    try {
      const response = await api.put(`/vehiculos/estado/${id}?activo=${status}`);
      obtenerCamionetas();
    } catch (error) {
      console.error("Error al marcar como activo o inactivo:", error);
    }
  };

  return (
    <Container>
      <Header createLink="./crear" createMessage="Crear" onSearch={handleSearch}/>
      {error && <p>{error}</p>}
      <ListComponent 
        title="Camionetas" 
        data={camionetas} 
        columns={columns} 
        createLink="/camionetas/crear" 
        icons={[ <ToggleOffIcon/>, <ToggleOnIcon/>, <DeleteIcon />]}
        iconsLinks={[ "","", "/camionetas/eliminar?camioneta_id="]}
        iconsTooltip={["Marcar como inactivo", "Marcar como activo", "Eliminar Camioneta"]}
        getFunction={obtenerCamionetas}
        setStatus={setStatus}
        pageCounter={Math.floor(cantidadCamionetas/pageSize)+1}
      />
    </Container>
  );
};

export default ComionetasListado;