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

const OperadorListado = () => {
  const [operadores, setOperadores] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadUsuarios, setCantidadUsuarios] = useState(0); // [1
  const api = useApi();

  const obtenerUsuarios = async (page=1, search='') => {
    try {
      const offset = page * 10 - pageSize;
      const response = await api.get(`/usuarios?offset=${offset}&limit=${pageSize}&search=${search}`);
      setOperadores(response.data.usuarios);
      setCantidadUsuarios(response.data.cantidad);
    } catch (error) {
      if (error.response) {
        setError(error.response.statusText);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleSearch = (searchTerm) => {
    obtenerUsuarios(1, searchTerm);
  };

  return (
    <Container>
      <Header createLink="./invitar" createMessage="Invitar Operador via Email" onSearch={handleSearch}/>
      {error && <p>{error}</p>}
      <ListComponent 
        title="Operadores" 
        data={operadores} 
        columns={columns} 
        createLink="/operadores/crear" 
        icons={[ <ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={[ "/operadores/editar?usuario_id=",  "/operadores/eliminar?usuario_id="]}
        iconsTooltip={["Editar Operador", "Eliminar Operador"]}
        getFunction={obtenerUsuarios}
        pageCounter={Math.floor(cantidadUsuarios/pageSize)+1}
      />
    </Container>
  );
};

export default OperadorListado;