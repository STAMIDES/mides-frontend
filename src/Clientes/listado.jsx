import React, { useState, useEffect, useCallback } from "react";
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
  { label: "Caracteristicas", borderSeparation: false, key: "caracteristicas", columns: [{ label: "", key: "nombre"}]}
];

const ClienteListado = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadClientes, setCantidadClientes] = useState(0);
  const api = useApi();

  const obtenerClientes = async (page=1, search = '') => {
    try {
      const offset = page * 10 - pageSize;
      const response = await api.get(`/clientes?offset=${offset}&limit=${pageSize}&search=${search}`);
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
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/clientes/${id}`);
      obtenerClientes();
    } catch (error) {
      console.error('Error borrando cliente:', error);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const handleSearch = (searchTerm) => {
    obtenerClientes(1, searchTerm);
  };
  return (
    <Container>
      <Header createLink="./crear" onSearch={handleSearch}/>
      {error && <p>{error}</p>}
      <ListComponent 
        title="Clientes" 
        data={clients} 
        columns={columns} 
        createLink="/clientes/crear" 
        icons={[<AddCircleIcon />, <ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={["/solicitudes/crear?usuarioId=", "/usuarios/editar?usuarioId=",  ""]}
        iconsTooltip={["Agregar Pedido", "Editar Cliente", "Eliminar Cliente"]}
        getFunction={obtenerClientes}
        pageCounter={Math.floor(cantidadClientes/pageSize)+1}
        onDelete={handleDelete}
      />
    </Container>
  );
};

export default ClienteListado;