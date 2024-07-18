import React, { useState, useEffect, useCallback  } from "react";
import { Container } from "@mui/material";
import Header from "../../components/headerList";
import ListComponent from "../../components/listados";
import useApi from "../../network/axios"; // Ensure this path matches your actual API file path
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
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

  return (
    <Container>
      <Header createLink="./crear" createMessage="Crear" onSearch={handleSearch}/>
      {error && <p>{error}</p>}
      <ListComponent 
        title="Camionetas" 
        data={camionetas} 
        columns={columns} 
        createLink="/camionetas/crear" 
        icons={[ <ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={[ "/camionetas/editar?camioneta_id=",  "/camionetas/eliminar?camioneta_id="]}
        iconsTooltip={["Editar Camioneta", "Eliminar Camioneta"]}
        getFunction={obtenerCamionetas}
        pageCounter={Math.round(cantidadCamionetas/pageSize)+1}
      />
    </Container>
  );
};

export default ComionetasListado;