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
  { label: "Planificado por", key: "creado_por" },
  { label: "Rutas", key: "rutas", columns: [
                                { label: "Origen", key: "direccion_origen_y_horario"},
                                { label: "Destino", key: "direccion_destino_y_horario"},
                                { label: "Vehículo", key: "vehiculo"}]},
]

const PlanificacionListado = () => {
  const [planificaciones, setPlanificaciones] = useState([]); 
  const today = new Date();
  const defaultValue = today.toISOString().slice(0, 10);
  const [date, setDate] = useState(moment(defaultValue, "YYYY-MM-DD"));
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadPlanificaciones, setCantidadPlanificaciones] = useState(0);
  const [currentPage, setPage] = useState(1);
  const api = useApi();

  moment.locale('en', {
    longDateFormat: {
      L: 'DD-MM-YYYY',
    }
  });
  
  useEffect(() => {
    obtenerPlanificaciones(currentPage, date);
  }, [date, currentPage]);

  const obtenerPlanificaciones = async (page=1, selectedDate, search = '') => {
    try {
      const offset = (page - 1) * pageSize;
      setPage(page);
      const response = await api.get(`/planificaciones/fecha/${selectedDate.format("YYYY-MM-DD")}?offset=${offset}&limit=${pageSize}&search=${search}`);
      const planificaciones = response.data.planificaciones;
      const planificacionesProcesados = planificaciones.map(planificacion => ({
        ...planificacion,
        creado_por: `${planificacion.creado_por.nombre}`,
        rutas: planificacion.rutas.map(ruta => ({
          direccion_origen_y_horario: `${ruta.hora_inicio}  ${ruta.visitas[0].lugar_comun.nombre}`,
          direccion_destino_y_horario: `${ruta.hora_fin} ${ruta.visitas[ruta.visitas.length-1].lugar_comun.nombre}`,
          vehiculo: `${ruta.vehiculo.descripcion} ${ruta.vehiculo.matricula}`
        }))
      }));
      setPlanificaciones(planificacionesProcesados);
      setCantidadPlanificaciones(response.data.cantidad);
    } catch (error) {
      if (error.response) {
        setError(error.response.statusText);
      } else {
        console.log(error)
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
    obtenerPlanificaciones(1, date, searchTerm);
  };

  return (
    <Container>
      <Header createLink="./crear"  onSearch={handleSearch}/>
      {error && <p>{error}</p>}
      <ListComponent 
        title="Planificaciones" 
        filterComponent={DateFilter}
        filterComponentProps={{ date: date, handleDateChange: handleDateChange }}
        data={planificaciones} 
        columns={columns} 
        icons={[<ModeEditOutlineIcon />, <DeleteIcon />]}
        iconsLinks={[ "/planificaciones/editar",  "/planificaciones/eliminar"]} 
        iconsTooltip={[ "Editar Planificación", "Eliminar Planificación"]}
        getFunction={obtenerPlanificaciones}
        currentPage={currentPage}
        pageCounter={Math.floor(cantidadPlanificaciones/pageSize)+1}
      />
    </Container>
  );
};

export default PlanificacionListado;