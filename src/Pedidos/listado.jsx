import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import Header from "../components/headerList";
import ListComponent from "../components/listados";
import api from "../network/axios"; // Ensure this path matches your actual API file path
import DateFilter from "../components/dateFilter";
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import moment from 'moment';

const columns = [
  { label: "Pedido por", key: "nombre_y_apellido" },
  { label: "Documento", key: "usuario_documento" },
  { label: "Origen", key: "direccion_origen_y_horario"},
  { label: "Destino", key: "direccion_destino_y_horario" },
]

const PedidoListado = () => {
  const [pedidos, setPedidos] = useState([]); 
  const today = new Date();
  const twoDaysLater = new Date(today);
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);
  const defaultValue = twoDaysLater.toISOString().slice(0, 10);
  const [date, setDate] = useState(moment(defaultValue, "YYYY-MM-DD"));
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setPage] = useState(1);

  moment.locale('en', {
    longDateFormat: {
      L: 'DD-MM-YYYY',
    }
  });
  
  useEffect(() => {
    obtenerPedidos(currentPage, date);
  }, [date, currentPage]);

  const obtenerPedidos = async (page=1, selectedDate) => {
    try {
      const offset = (page - 1) * pageSize;
      setPage(page);
      const response = await api.get(`/pedidos/fecha/${selectedDate.format("YYYY-MM-DD")}?offset=${offset}&limit=${pageSize}`);
      const pedidos = response.data.pedidos;
      console.log(JSON.stringify(pedidos));
      const pedidosProcesados = pedidos.map(pedido => ({
        ...pedido,
        direccion_origen_y_horario: `${pedido.direccion_origen}  \n ${pedido.ventana_origen_fin}`,
        direccion_destino_y_horario: `${pedido.direccion_destino} \n ${pedido.ventana_destino_fin}`,
        nombre_y_apellido: `${pedido.cliente_nombre} \n ${pedido.cliente_apellido}`,
      }));
      setPedidos(pedidosProcesados);
    } catch (error) {
      if (error.response) {
        setError(error.response.statusText);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleDateChange = (newDate) => {
    if (moment(newDate, "DD-MM-YYYY", true).isValid()) {
      setDate(moment(newDate, "YYYY-MM-DD"));
    }
  };
  
  return (
    <Container>
      <Header createLink="/pedidos/crear" />
      {error && <p>{error}</p>}
      <ListComponent 
        title="Pedidos" 
        filterComponent={DateFilter}
        filterComponentProps={{ date: date, handleDateChange: handleDateChange }}
        data={pedidos} 
        columns={columns} 
        createLink="/pedidos/crear" 
        showMultiLine={true}
        icons={[<ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={[ "/pedidos/editar",  "/pedidos/eliminar"]} 
        iconsTooltip={[ "Editar Pedido", "Eliminar Pedido"]}
        getFunction={obtenerPedidos}
        currentPage={currentPage}
        pageCounter={Math.round(pedidos.length/pageSize+1)}
      />
    </Container>
  );
};

export default PedidoListado;