import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import Header from "../components/headerList";
import ListComponent from "../components/listados";
import useApi from "../network/axios"; // Ensure this path matches your actual API file path
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';

const columns = [
  { label: "Nombre", key: "nombre" },
  { label: "Apellidos", key: "apellido" },
  { label: "Cedula", key: "documento" },
  { label: "Tipo", key: "tipo" },
];

const ClienteListado = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadClientes, setCantidadClientes] = useState(0);
  const api = useApi();

  const obtenerClientes = async (page=1) => {
    try {
      const offset = page * 10 - pageSize;
      const response = await api.get(`/clientes?offset=${offset}&limit=${pageSize}`);
      setClients(response.data.clientes);
      setCantidadClientes(response.data.cantidad);
    } catch (error) {
      if (error.response) {
        setError(error.response.statusText);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  return (
    <Container>
      <Header createLink="/clientes/crear" />
      {error && <p>{error}</p>}
      <ListComponent 
        title="Clientes" 
        data={clients} 
        columns={columns} 
        createLink="/clientes/crear" 
        icons={[<AddCircleIcon />, <ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={["/pedidos/crear?clienteId=", "/clientes/editar?clienteId=",  "/clientes/eliminar?clienteId="]}
        iconsTooltip={["Agregar Pedido", "Editar Cliente", "Eliminar Cliente"]}
        getFunction={obtenerClientes}
        pageCounter={Math.round(cantidadClientes/pageSize+1)}
      />
    </Container>
  );
};

export default ClienteListado;