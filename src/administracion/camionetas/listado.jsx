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
  { label: "Descripcion", key: "descripcion" }
];

const ComionetasListado = () => {
  const [camionetas, setCamionetas] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadCamionetas, setCantidadCamionetas] = useState(0); // [1
  const [currentPage, setPage] = useState(1);
  const api = useApi();

  const obtenerCamionetas = async (page=1, search='') => {
    try {
      const offset = page * 10 - pageSize;
      setPage(page);
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

  const handleDelete = async (camioneta) => {
    try {
      await api.delete(`/vehiculos/${camioneta.id}`);
      if (camionetas.length === 1 && currentPage > 1) {  
        obtenerCamionetas(currentPage - 1);
      } else {
        obtenerCamionetas(currentPage);
      }
    } catch (error) {
      console.error('Error borrando camioneta:', error);
    }
  };

  const setStatus = async (id, status) => {
    try {
      const response = await api.put(`/vehiculos/estado/${id}?activo=${status}`);
      if (camionetas.length==1 && currentPage>1){  
        obtenerCamionetas(currentPage-1);
      }else{
        obtenerCamionetas(currentPage);
      }
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
        icons={[<ToggleOffIcon style={{color: 'red'}}/>, <ToggleOnIcon style={{color: 'green'}} /> ,<DeleteIcon />]}
        iconsLinks={[ "","", ""]}
        iconsTooltip={["Marcar como inactivo", "Marcar como activo", "Eliminar Camioneta"]}
        getFunction={obtenerCamionetas}
        setStatus={setStatus}
        onDelete={handleDelete}
        pageCounter={Math.ceil(cantidadCamionetas/pageSize)}
        currentPage={currentPage}
      />
    </Container>
  );
};

export default ComionetasListado;