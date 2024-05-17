import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import Header from "../components/headerList";
import ListComponent from "../components/listados";
import api from "../network/axios"; // Ensure this path matches your actual API file path

const columns = [
  { label: "Nombre", key: "name" },
  { label: "Apellidos", key: "surname" },
  { label: "Cedula", key: "cedula" },
  { label: "Email", key: "email" }
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