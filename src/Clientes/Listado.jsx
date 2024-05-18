import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import Header from "../components/headerList";
import ListComponent from "../components/listados";
import api from "../network/axios"; // Ensure this path matches your actual API file path

const columns = [
  { label: "ID", key: "id_cliente"},
  { label: "Nombre", key: "nombre" },
  { label: "Apellidos", key: "apellido" },
  { label: "Cedula", key: "documento" },
  { label: "Email", key: "email" },
  { label: "Telefono", key: "telefono" },
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
      />
    </Container>
  );
};

export default ClienteListado;