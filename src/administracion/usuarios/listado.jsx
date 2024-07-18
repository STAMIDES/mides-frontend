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
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadUsuarios, setCantidadUsuarios] = useState(0); // [1
  const api = useApi();

  const obtenerUsuarios = async (page=1, search='') => {
    try {
      const offset = page * 10 - pageSize;
      const response = await api.get(`/usuarios?offset=${offset}&limit=${pageSize}&search=${search}`);
      setUsuarios(response.data.usuarios);
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
      <Header createLink="./invitar" createMessage="Invitar Usuario via Email" onSearch={handleSearch}/>
      {error && <p>{error}</p>}
      <ListComponent 
        title="Usuarios" 
        data={usuarios} 
        columns={columns} 
        createLink="/usuarios/crear" 
        icons={[ <ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={[ "/usuarios/editar?usuario_id=",  "/usuarios/eliminar?usuario_id="]}
        iconsTooltip={["Editar Usuario", "Eliminar Usuario"]}
        getFunction={obtenerUsuarios}
        pageCounter={Math.round(cantidadUsuarios/pageSize)+1}
      />
    </Container>
  );
};

export default UsuarioListado;