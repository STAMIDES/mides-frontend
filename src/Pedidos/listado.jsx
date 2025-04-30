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
  { label: "Tipo", key: "tipo" },
  { label: "Origen", key: "direccion_origen_y_horario"},
  { label: "Paradas Intermedias", key: "paradas_intermedias"},
  { label: "Destino", key: "direccion_destino_y_horario" },
]

const PedidoListado = () => {
  const [pedidos, setPedidos] = useState([]); 
  const today = new Date();
  const defaultValue = today.toISOString().slice(0, 10);
  const [date, setDate] = useState(moment(defaultValue, "YYYY-MM-DD"));
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    obtenerPedidos(currentPage, date, searchTerm);
  }, [date, currentPage, searchTerm]);

  const handleDelete = async (pedido) => {
    try{
      if (pedido.estado !== 'Pendiente') {
        return alert('La solicitud debe estar en estado pendiente para poder ser eliminada');
      }

      await api.delete(`/pedidos/${pedido.id}`);

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
        const paradas = pedido.paradas;
        paradas.sort((a, b) => a.posicion_en_pedido - b.posicion_en_pedido);
        var direccionOrigenYHorario = `${paradas[0].direccion} \n ${paradas[0].ventana_horaria_inicio || 'Sin horario'}`;
        var cantParadas = paradas.length;
        var direccionDestinoYHorario = `${paradas[cantParadas-1].direccion} \n ${paradas[cantParadas-1].ventana_horaria_inicio || 'Sin horario'}`;
        var paradasIntermedias = '';
        for (let i = 1; i +1 < cantParadas ; i += 1) {
            paradasIntermedias += '*' + paradas[i].direccion + '\n Llegada: ' + paradas[i].ventana_horaria_inicio + '\n Salida: ' + paradas[i].ventana_horaria_fin + '\n\n' ;
        }
        nuevoListado.push({
            id: pedido.id,
            tipo: pedido.tipo,
            nombre_y_apellido: nombreYApellido,
            usuario_documento: pedido.cliente_documento,
            direccion_origen_y_horario: direccionOrigenYHorario,
            paradas_intermedias: paradasIntermedias,
            direccion_destino_y_horario: direccionDestinoYHorario,
            estado: pedido.estado
        });
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
        console.trace(error);
        setError('An unexpected error occurred');
      }
    }
  };

  const handleDateChange = (newDate) => {
    if (moment(newDate, "DD-MM-YYYY", true).isValid()) {
      setDate(moment(newDate, "YYYY-MM-DD"));
      setPage(1);
    }
  };
  const handleSearch = (searchTerm) => {
    console.log(searchTerm);
    setPage(1);
    setSearchTerm(searchTerm);
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
        getFunction={setPage}
        currentPage={currentPage}
        pageCounter={Math.ceil(cantidadPedidos/pageSize)}
      />
    </Container>
  );
};

export default PedidoListado;