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
  { label: "Direccion", key: "direccion" },
  { label: "observaciones", key: "observaciones" }
];

const LugaresComunesListado = () => {
  const [lugares, setLugares] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadLugaresComunes, setCantidadLugaresComunes] = useState(0); // [1
  const [currentPage, setPage] = useState(1);
  const api = useApi();

  const obtenerLugaresComunes = async (page=1, search='') => {
    try {
      const offset = page * 10 - pageSize;
      setPage(page);
      const response = await api.get(`/lugares_comunes?offset=${offset}&limit=${pageSize}&search=${search}`);
      setLugares(response.data.lugares);
      setCantidadLugaresComunes(response.data.cantidad);
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
      const response = await api.put(`/lugares_comunes/estado/${id}?activo=${status}`);
      if (lugares.length==1 && currentPage>1){
        obtenerLugaresComunes(currentPage-1);
      }else{
        obtenerLugaresComunes(currentPage);
      }
    } catch (error) {
      console.error("Error al marcar como activo o inactivo:", error);
    }
  };
  useEffect(() => {
    obtenerLugaresComunes();
  }, []);

  const handleSearch = (searchTerm) => {
    obtenerLugaresComunes(1, searchTerm);
  };

  const handleDelete = async (lugar) => {
    try {
      await api.delete(`/lugares_comunes/${lugar.id}`);
      if (lugares.length === 1 && currentPage > 1) {  
        obtenerLugaresComunes(currentPage - 1);
      } else {
        obtenerLugaresComunes(currentPage);
      }
    } catch (error) {
      console.error('Error borrando lugar común:', error);
    }
  };

  return (
    <Container>
      <Header createLink="./crear" createMessage="Crear" onSearch={handleSearch}/>
      {error && <p>{error}</p>}
      <ListComponent 
        title="Lugares Comunes" 
        data={lugares} 
        columns={columns} 
        createLink="/lugares_comunes/crear" 
        icons={[
          { Component: ToggleOffIcon, props: { style: { color: 'red' } }, name: 'ToggleOffIcon' },
          { Component: ToggleOnIcon, props: { style: { color: 'green' } }, name: 'ToggleOnIcon' },
          { Component: DeleteIcon, props: {}, name: 'DeleteIcon' }
        ]}
        iconsLinks={["", "", ""]}
        iconsTooltip={["Marcar como inactivo", "Marcar como activo", "Eliminar Lugar Comun"]}
        getFunction={obtenerLugaresComunes}
        setStatus={setStatus}
        onDelete={handleDelete}
        pageCounter={Math.ceil(cantidadLugaresComunes/pageSize)}
        currentPage={currentPage}
      />
    </Container>
  );
};

export default LugaresComunesListado;