import React, { useState, useEffect, useCallback  } from "react";
import { Container } from "@mui/material";
import Header from "../../components/headerList";
import ListComponent from "../../components/listados";
import useApi from "../../network/axios"; // Ensure this path matches your actual API file path
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import DeleteIcon from '@mui/icons-material/Delete';
const columns = [
  { label: "Nombre", key: "nombre" },
  { label: "Apellidos", key: "apellido" },
  { label: "Cedula", key: "documento" },
  { label: "Telefono", key: "telefono" },
  { label: "Activo", key: "activo" },
];

const UsuarioListado = () => {
  const [choferes, setChoferes] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadChoferes, setCantidadChoferes] = useState(0); // [1
  const [currentPage, setPage] = useState(1);
  const api = useApi();

  const obtenerChoferes = async (page=1, search='') => {
    try {
      const offset = page * 10 - pageSize;
      setPage(page);
      const response = await api.get(`/choferes?offset=${offset}&limit=${pageSize}&search=${search}`);
      setChoferes(response.data.choferes);
      setCantidadChoferes(response.data.cantidad);
    } catch (error) {
      if (error.response) {
        setError(error.response.statusText);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const setStatus = async (id, status) => {
    try {
      const response = await api.put(`/choferes/estado/${id}?activo=${status}`);
      obtenerChoferes(currentPage);
    } catch (error) {
      console.error("Error al marcar como activo o inactivo:", error);
    }
  };
  
  useEffect(() => {
    obtenerChoferes();
  }, []);

  const handleSearch = (searchTerm) => {
    obtenerChoferes(1, searchTerm);
  };

  return (
    <Container>
      <Header createLink="./crear" createMessage="Crear" onSearch={handleSearch}/>
      {error && <p>{error}</p>}
      <ListComponent 
        title="Choferes" 
        data={choferes} 
        columns={columns} 
        createLink="/choferes/crear" 
        icons={[ <ToggleOffIcon/>, <ToggleOnIcon/>, <DeleteIcon />]}
        iconsLinks={[  "", "", "/choferes/eliminar?chofer_id="]}
        iconsTooltip={["Marcar como inactivo", "Marcar como activo", "Eliminar Chofer"]}
        getFunction={obtenerChoferes}
        setStatus={setStatus}
        pageCounter={Math.ceil(cantidadChoferes/pageSize)}
        currentPage={currentPage}
      />
    </Container>
  );
};

export default UsuarioListado;