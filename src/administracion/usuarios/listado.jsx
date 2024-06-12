import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import Header from "../../components/headerList";
import ListComponent from "../../components/listados";
import useApi from "../../network/axios"; // Ensure this path matches your actual API file path
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';

const columns = [
  { label: "Nombre", key: "nombre" },
  { label: "Apellidos", key: "apellido" },
  { label: "Cedula", key: "documento" },
  { label: "Tipo", key: "tipo" },
];

const UsuarioListado = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const api = useApi();

  const obtenerUsuarios = async (page=1) => {
    try {
      const offset = page * 10 - pageSize;
      const response = await api.get(`/usuarios?offset=${offset}&limit=${pageSize}`);
      setClients(response.data.usuarios);
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

  return (
    <Container>
      <Header createLink="/usuarios/crear" />
      {error && <p>{error}</p>}
      <ListComponent 
        title="Usuarios" 
        data={clients} 
        columns={columns} 
        createLink="/usuarios/crear" 
        icons={[<AddCircleIcon />, <ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={["/pedidos/crear?usuario_id=", "/usuarios/editar?usuario_id=",  "/usuarios/eliminar?usuario_id="]}
        iconsTooltip={["Agregar Pedido", "Editar Usuario", "Eliminar Usuario"]}
        getFunction={obtenerUsuarios}
        pageCounter={Math.round(clients.length/pageSize+1)}
      />
    </Container>
  );
};

export default UsuarioListado;