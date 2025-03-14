import React, { useState, useEffect, useCallback } from "react";
import { Container } from "@mui/material";
import Header from "../components/headerList";
import ListComponent from "../components/listados";
import useApi from "../network/axios";
import DateFilter from "../components/dateFilter";
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import moment from 'moment';

const columns = [
  { label: "Solicitado por", key: "nombre_y_apellido" },
  { label: "Documento", key: "usuario_documento" },
  { label: "Origen", key: "direccion_origen_y_horario"},
  { label: "Destino", key: "direccion_destino_y_horario" },
]

const PedidoListado = () => {
  const [pedidos, setPedidos] = useState([]); 
  const today = new Date();
  const defaultValue = today.toISOString().slice(0, 10);
  const [date, setDate] = useState(moment(defaultValue, "YYYY-MM-DD"));
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadPedidos, setCantidadPedidos] = useState(0);
  const [currentPage, setPage] = useState(1);
  const api = useApi();

  moment.locale('en', {
    longDateFormat: {
      L: 'DD-MM-YYYY',
    }
  });
  
  useEffect(() => {
    obtenerPedidos(currentPage, date);
  }, [date, currentPage]);

  const handleDelete = (pedido) => {
    try{
      if (pedido.estado !== 'Pendiente') {
        return alert('La solicitud debe estar en estado pendiente para poder ser eliminada');
      }
      const response = api.delete(`/pedidos/${pedido.id}`);
      if (pedidos.length==1 && currentPage>1){  
        obtenerPedidos(currentPage-1, date);
      }else{
        obtenerPedidos(currentPage, date);
      }
    } catch (error) {
      console.error('Error borrando cliente:', error);
    }
  };

  const procesarPedidos = (pedidosSinProcesar) => {
    const nuevoListado = [];
    pedidosSinProcesar.sort((a, b) => new Date(a.fecha_programado) - new Date(b.fecha_programado));
    pedidosSinProcesar.forEach(pedido => {
        const nombreYApellido = `${pedido.cliente.nombre}\n${pedido.cliente.apellido}`;
        const usuario_documento = pedido.cliente.documento;
        const paradas = pedido.paradas;
        paradas.sort((a, b) => a.posicion_en_pedido - b.posicion_en_pedido);
        var lastDestino
        for (let i = 0; i + 1 < paradas.length; i += 1) {
            const origen = paradas[i];
            const destino = paradas[i + 1];
            
            var direccionOrigenYHorario;
            var direccionDestinoYHorario;
            if (origen===lastDestino){
              direccionOrigenYHorario = `${origen.direccion} \n ${origen.ventana_horaria_fin || 'Sin horario'}`;
            }else{
              direccionOrigenYHorario = `${origen.direccion} \n ${origen.ventana_horaria_inicio  || 'Sin horario'}`;
            }
            direccionDestinoYHorario = `${destino.direccion} \n ${destino.ventana_horaria_inicio || 'Sin horario'}`;
            nuevoListado.push({
                id: pedido.id,
                nombre_y_apellido: nombreYApellido,
                usuario_documento: usuario_documento,
                direccion_origen_y_horario: direccionOrigenYHorario,
                direccion_destino_y_horario: direccionDestinoYHorario,
                estado: pedido.estado
            });
            lastDestino = destino;
        }
    });
    
    return nuevoListado;
  }


  const obtenerPedidos = async (page=1, selectedDate, search = '') => {
    try {
      const offset = (page - 1) * pageSize;
      setPage(page);
      const response = await api.get(`/pedidos/fecha/${selectedDate.format("YYYY-MM-DD")}?offset=${offset}&limit=${pageSize}&search=${search}`);
      setPedidos(procesarPedidos(response.data.pedidos));
      setCantidadPedidos(response.data.cantidad);
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
  const handleSearch = (searchTerm) => {
    obtenerPedidos(1, date, searchTerm);
  };

  return (
    <Container>
      <Header onSearch={handleSearch}/>
      {error && <p>{error}</p>}
      <ListComponent 
        title="Pedidos" 
        filterComponent={DateFilter}
        filterComponentProps={{ date: date, handleDateChange: handleDateChange }}
        data={pedidos} 
        columns={columns} 
        icons={[ <DeleteIcon />]}
        iconsTooltip={[ "Eliminar Solicitud"]}
        onDelete={handleDelete}
        getFunction={obtenerPedidos}
        currentPage={currentPage}
        pageCounter={Math.ceil(cantidadPedidos/pageSize)}
      />
    </Container>
  );
};

export default PedidoListado;