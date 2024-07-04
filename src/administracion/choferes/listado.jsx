import React, { useState, useEffect, useCallback  } from "react";
import { Container } from "@mui/material";
import Header from "../../components/headerList";
import ListComponent from "../../components/listados";
import useApi from "../../network/axios"; // Ensure this path matches your actual API file path
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
const columns = [
  { label: "Nombre", key: "nombre" },
  { label: "Corre electronico", key: "email" },
  { label: "Rol", key: "rol" }
];

const UsuarioListado = () => {
  const [choferes, setChoferes] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadChoferes, setCantidadChoferes] = useState(0); // [1
  const api = useApi();

  const obtenerChoferes = async (page=1, search='') => {
    try {
      const offset = page * 10 - pageSize;
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
        icons={[ <ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={[ "/choferes/editar?chofer_id=",  "/choferes/eliminar?chofer_id="]}
        iconsTooltip={["Editar Chofer", "Eliminar Chofer"]}
        getFunction={obtenerChoferes}
        pageCounter={Math.round(cantidadChoferes/pageSize+1)}
      />
    </Container>
  );
};

export default UsuarioListado;