import React, { useState, useEffect, useCallback } from "react";
import { Container } from "@mui/material";
import Header from "../components/headerList";
import ListComponent from "../components/listados";
import useApi from "../network/axios";
import DateFilter from "../components/dateFilter";
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import moment from 'moment';

const columns = [
  { label: "Id", key: "id" },
  { label: "Fecha de creado", key: "fmt_fecha_creacion" },
  { label: "Planificado por", key: "creado_por" },
  { label: "Rutas", key: "rutas", borderSeparation: true, columns: [
      { label: "Origen", key: "direccion_origen_y_horario"},
      { label: "Destino", key: "direccion_destino_y_horario"},
      { label: "Vehículo", key: "vehiculo"},
      { label: "Chofer", key: "chofer" } ],
  }
]

const PlanificacionListado = () => {
  const [planificaciones, setPlanificaciones] = useState([]); 
  const [date, setDate] = useState(moment());
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [cantidadPlanificaciones, setCantidadPlanificaciones] = useState(0);
  const [currentPage, setPage] = useState(1);
  const api = useApi();

  moment.locale('es', {
    longDateFormat: {
      L: 'DD-MM-YYYY',
    }
  });
  
  const setStatus = async (id, status) => {
    try {
      const response = await api.put(`/planificaciones/estado/${id}?definitiva=${status}`);
      obtenerPlanificaciones(currentPage, date);
    } catch (error) {
      console.error("Error al marcar como activo o inactivo:", error);
    }
  };

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
        definitiva: planificacion.definitiva,
        fecha_creacion: planificacion.fecha_creacion,
        rutas: planificacion.rutas.map(ruta => ({
          direccion_origen_y_horario: `${ruta.hora_inicio}  ${ruta.visitas[0].lugar_comun.nombre}`,
          direccion_destino_y_horario: `${ruta.hora_fin} ${ruta.visitas[ruta.visitas.length-1].lugar_comun.nombre}`,
          vehiculo: `${ruta.vehiculo.descripcion} ${ruta.vehiculo.matricula}`,
          chofer: `${ruta.chofer.nombre} ${ruta.chofer.apellido}`
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

  const handleDelete = (planificacion) => {
    try{
      // TODO:: Agregar algun tipo de freno, el usuario no deberia poder cualquier planificacion
      const response = api.delete(`/planificaciones/${planificacion.id}`);
      // wait for db to delete the planificacion
      setTimeout(() => {
        if (planificaciones.length==1 && currentPage>1){  
          obtenerPlanificaciones(currentPage-1, date);
        }else{
          obtenerPlanificaciones(currentPage, date);
        }
      }, 1000);
    } catch (error) {
      console.error('Error borrando cliente:', error);
    }
  };
  
  const handleDateChange = (newDate) => {
    if (moment(newDate, "DD-MM-YYYY", true).isValid()) {
      setDate(moment(newDate, "DD-MM-YYYY"));
    }
  };
  
  const handleSearch = (searchTerm) => {
    obtenerPlanificaciones(1, date, searchTerm);
  };

  return (
    <Container>
      <Header createLink="./crear"  onSearch={handleSearch}
      customButtons={[
        { customLink: "/planificaciones/informe", customMessage: "Generar informe estadístico", 
          customColor: "lightseagreen" }
      ]}
      />
      {error && <p>{error}</p>}
      <ListComponent 
        title="Planificaciones" 
        filterComponent={DateFilter}
        filterComponentProps={{ date: date, handleDateChange: handleDateChange }}
        data={planificaciones} 
        columns={columns} 
        icons={[<ToggleOffIcon style={{color: 'red'}}/>, <ToggleOnIcon style={{color: 'green'}} /> ,<DeleteIcon />]}
        iconsTooltip={[  "Marcar como definitiva", "Desmarcar planificación definitiva", "Eliminar Planificación"]}
        setStatus={setStatus}
        onDelete={handleDelete}
        getFunction={obtenerPlanificaciones}
        currentPage={currentPage}
        pageCounter={Math.ceil(cantidadPlanificaciones/pageSize)}
      />
    </Container>
  );
};

export default PlanificacionListado;