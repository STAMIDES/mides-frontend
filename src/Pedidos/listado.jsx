import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import Header from "../components/headerList";
import ListComponent from "../components/listados";
import api from "../network/axios"; // Ensure this path matches your actual API file path
import DateFilter from "../components/dateFilter";

const columns = [
  { label: "Pedido por", key: "nombre_y_apellido" },
  { label: "Documento", key: "usuario_documento" },
  { label: "Origen", key: "direccion_origen_y_horario"},
  { label: "Destino", key: "direccion_destino_y_horario" },
]

const PedidoListado = () => {
  const [clients, setClients] = useState([]); 
  const today = new Date();
  const twoDaysLater = new Date(today);
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);
  const defaultValue = twoDaysLater.toISOString().slice(0, 10);
  const [error, setError] = useState(null);
  const obtenerPedidos = async (fechaPedidos) => {
    try {
      // Obtener /pedidos para fecha 
      const response = await api.get('/pedidos/fecha/'+fechaPedidos);
      const pedidos = response.data.pedidos;
      console.log(JSON.stringify(pedidos))
      // Procesar pedidos para agregar los campos direccion_origen_y_horario y direccion_destino_y_horario
      const pedidosProcesados = pedidos.map(pedido => ({
        ...pedido,
        direccion_origen_y_horario: `${pedido.direccion_origen}  \n ${pedido.ventana_origen_fin}`,
        direccion_destino_y_horario: `${pedido.direccion_destino} \n ${pedido.ventana_destino_fin}`,
        nombre_y_apellido: `${pedido.cliente_nombre} \n ${pedido.cliente_apellido}`,
      }));
  
      setClients(pedidosProcesados);
    } catch (error) {
      if (error.response) {
        setError(error.response.statusText);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    obtenerPedidos(defaultValue);
  }, []);

  return (
    <Container>
      <Header createLink="/pedidos/crear" />
      {error && <p>{error}</p>}
      <ListComponent 
        title="Pedidos" 
        filterComponent={DateFilter}
        filterComponentProps={{ defaultValue: defaultValue, getElementosFiltrados: obtenerPedidos }}
        data={clients} 
        columns={columns} 
        createLink="/pedidos/crear" 
        showMultiLine={true}
      />
    </Container>
  );
};

export default PedidoListado;