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
  { label: "Direccion", key: "direccion" },
  { label: "observaciones", key: "observaciones" }
];

const LugaresComunesListado = () => {
  const [lugares, setLugares] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadLugaresComunes, setCantidadLugaresComunes] = useState(0); // [1
  const api = useApi();

  const obtenerLugaresComunes = async (page=1, search='') => {
    try {
      const offset = page * 10 - pageSize;
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

  useEffect(() => {
    obtenerLugaresComunes();
  }, []);

  const handleSearch = (searchTerm) => {
    obtenerLugaresComunes(1, searchTerm);
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
        icons={[ <ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={[ "/lugares_comunes/editar?lugar_comun_id=",  "/lugares_comunes/eliminar?lugar_comun_id="]}
        iconsTooltip={["Editar Lugar Comun", "Eliminar Lugar Comun"]}
        getFunction={obtenerLugaresComunes}
        pageCounter={Math.round(cantidadLugaresComunes/pageSize)+1}
      />
    </Container>
  );
};

export default LugaresComunesListado;