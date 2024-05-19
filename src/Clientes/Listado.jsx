import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import Header from "../components/headerList";
import ListComponent from "../components/listados";
import api from "../network/axios"; // Ensure this path matches your actual API file path
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

const columns = [
  { label: "ID", key: "id_cliente"},
  { label: "Nombre", key: "nombre" },
  { label: "Apellidos", key: "apellido" },
  { label: "Cedula", key: "documento" },
  { label: "Tipo", key: "tipo" },
];

const ClienteListado = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);

  const obtenerClientes = async () => {
    try {
      const response = await api.get('/clientes', {});
      setClients(response.data.clientes);
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
        icons={[<AddCircleIcon />, <DeleteIcon />]}
        iconsLinks={["/pedidos/crear", "/clientes/eliminar"]}
      />
    </Container>
  );
};

export default ClienteListado;