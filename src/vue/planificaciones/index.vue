<template>
  <div class="main-container">
    <MontevideoMap :processedPedidos="processedPedidos" :planificacion="planificacion" 
    :unselectedPedidosIds="unselectedPedidosIds" :showPedidos="showPedidos"
    :hoveredPedidoId="hoveredPedidoId" :hoverOrigin="hoverOrigin" @marker-hover="handleMarkerHover" />
    <RightSidebar 
      :selectedDate="selectedDate" 
      :processedPedidos="processedPedidos"
      :vehiculos="vehiculos"
      :choferes="choferes"
      :lugaresComunes="lugaresComunes" 
      :planificacion="planificacion"
      :fetchPedidos="fetchPedidos"
      :errorPlanificacion="errorPlanificacion"
      :estadoError="estadoError"
      :hoveredPedidoId="hoveredPedidoId"
      :hoverOrigin="hoverOrigin"
      :downloadPlanificacionPDF="downloadPlanificacionPDF"
      @date-changed="handleDateChange"
      @planificar="planificar"
      @checkbox-change-pedidos="handleCheckboxChangePedidos"
      @selected-turnos="handleSelectedTurnos"
      @row-hover="handleRowHover"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import MontevideoMap from '../components/montevideoMap.vue';
import RightSidebar from '../components/rightSideNavBar.vue';
import {useRoute} from "vue-router";
import moment from 'moment';



import { api } from "../../network/axios";
const TIMEWINDOW_TOLERANCE = 15;
export default {
  name: 'MainPage',
  components: {
    MontevideoMap,
    RightSidebar
  },
  setup() {
    const route = useRoute();
    const selectedDate = ref(moment().format('YYYY-MM-DD'));
    const errorPlanificacion = ref(null);
    const estadoError = ref(null);
    const pedidos = ref([]);
    const vehiculos = ref([]);
    const choferes = ref([]);
    const lugaresComunes = ref([]);
    const planificacion = ref({});
    const unselectedPedidosIds = ref([]);
    const showPedidos = ref(null);
    const turnos = ref([]);
    const hoveredPedidoId = ref(null);
    const hoverOrigin = ref(null); // 'map' or 'sidebar'

    // Handle hover events
    const handleRowHover = (pedidoId) => {
      hoveredPedidoId.value = pedidoId;
      hoverOrigin.value = pedidoId ? 'sidebar' : null;
    };

    const handleMarkerHover = (pedidoId) => {
      hoveredPedidoId.value = pedidoId;
      hoverOrigin.value = pedidoId ? 'map' : null;
    };

    // Download planificacion PDF function
    const downloadPlanificacionPDF = async () => {
      if (!planificacion.value || !planificacion.value.id) return;
      
      try {
        const response = await api.get(`/planificaciones/${planificacion.value.id}/descargar`, {
          responseType: 'blob'
        });
        
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `planificacion-${planificacion.value.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading PDF:', error);
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

          var coords = [[paradas[0].latitud, paradas[0].longitud]];
          var paradasProcesadas = [direccionOrigenYHorario]
          var cantParadas = paradas.length;
          var direccionDestinoYHorario = `${paradas[cantParadas-1].direccion} \n ${paradas[cantParadas-1].ventana_horaria_inicio || 'Sin horario'}`;
          var paradasIntermedias = '';
          for (let i = 1; i +1 < cantParadas ; i += 1) {
              var parada = '*' + paradas[i].direccion + '\n Llegada: ' + paradas[i].ventana_horaria_inicio + '\n Salida: ' + paradas[i].ventana_horaria_fin + '\n\n' ;
              paradasIntermedias += parada ;
              coords.push([paradas[i].latitud, paradas[i].longitud]);
              paradasProcesadas.push(parada);
          }
          coords.push([paradas[cantParadas-1].latitud, paradas[cantParadas-1].longitud]);
          paradasProcesadas.push(direccionDestinoYHorario);
          nuevoListado.push({
              id: pedido.id,
              tipo: pedido.tipo,
              nombre_y_apellido: nombreYApellido,
              usuario_documento: pedido.cliente_documento,
              direccion_origen_y_horario: direccionOrigenYHorario,
              paradas_intermedias: paradasIntermedias,
              direccion_destino_y_horario: direccionDestinoYHorario,
              paradasProcesadas: paradasProcesadas,
              coords: coords,
              caracteristicas: pedido.cliente.caracteristicas
          });
      });
      return nuevoListado;
    }
    
    const processedPedidos = computed(() => procesarPedidos(pedidos.value));

    const fetchPedidos = async () => {
      try {
        const response = await api.get(`/pedidos/fecha/${selectedDate.value}`);
        pedidos.value = response.data.pedidos;
        planificacion.value = {};
        showPedidos.value = true;
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };

    const fetchPlanificacion = async (id) => {
      try {
        const response = await api.get(`/planificaciones/${id}`);
        planificacion.value = response.data.planificacion;
        planificacion.value.pedidos_no_atendidos = procesarPedidos(response.data.planificacion.pedidos_no_atendidos);
      } catch (error) {
        console.error('Error fetching planificacion:', error);
      }
    };

    const fetchVehiculos = async () => {
      try {
        const response = await api.get(`/vehiculos`);
        vehiculos.value = response.data.vehiculos;
      } catch (error) {
        console.error('Error fetching vehiculos:', error);
      }
    };
    
    const fetchLugaresComunes = async () => {
      try {
        const response = await api.get(`/lugares_comunes`);
        lugaresComunes.value = response.data.lugares;
      } catch (error) {
        console.error('Error fetching lugares comunes:', error);
      }
    };
    const fetchChoferes = async () => {
      try {
        const response = await api.get(`/choferes`);
        choferes.value = response.data.choferes;
      } catch (error) {
        console.error('Error fetching choferes:', error);
      }
    };

    const procesarNuevaPlanificacion = (nueva_planificacion, vehiculosNormalizados) => {
        const normalizedRutas = [];
        const normalizedTurnos = [];

        nueva_planificacion.routes.forEach(p => {
            // Normalize routes
            const arrival_time_start_depot = p.visits[0].arrival_time;
            const arrival_time_end_depot = p.visits[p.visits.length - 1].arrival_time;
            const turno = turnos.value.find(t => 
              t.vehicles.some(v => v.vehicleIdWithTurnoIndex === p.vehicle_id)
            );
            if (!turno){
              throw new Error('Turno no encontrado para el vehiculo ' + p.vehicle_id);
            }

            const vehicle = turno.vehicles.find(v => v.vehicleIdWithTurnoIndex === p.vehicle_id);
            normalizedRutas.push({
                    id_vehiculo: vehicle.vehicle_id,
                    id_chofer: vehicle.chofer_id,
                    hora_inicio: arrival_time_start_depot,
                    hora_fin: arrival_time_end_depot,
                    geometria: p.geometry,
                    visitas: p.visits.map(v=>{
                      return {
                        direccion: v.address,
                        item: {
                          latitud: v.coordinates.latitude,
                          longitud: v.coordinates.longitude
                        },
                        id_item: v.stop_id,
                        tipo_item: v.ride_id? "Parada" : "Lugar común",
                        hora_llegada: v.arrival_time,
                        hora_salida: v.arrival_time,
                        tipo_parada: v.type
                      }
                    })
            });
            if (normalizedTurnos.length==0 || !normalizedTurnos.find(t => t.hora_inicio === p.start_time && t.hora_fin === p.end_time)) {
              // find the vehicle with the same id as the one in the planificacion on the turnos
              
              let normalizedTurno = {
                hora_inicio: turno.start,
                hora_fin: turno.end,
              }
              normalizedTurnos.push(normalizedTurno);
            }
        });
        const normalizedPlanificacion = {
          planificacion: {fecha: selectedDate.value},
          rutas: normalizedRutas,
          turnos: normalizedTurnos,
          pedidos_no_atendidos: nueva_planificacion.dropped_rides.map(p => parseInt(p)),
        };
        return normalizedPlanificacion;
    }
    
    const guardarPlanificacion = async (nueva_planificacion) => {
      try {
        const response = await api.post(`/planificaciones`, nueva_planificacion);
        console.log('Planificacion guardada', response.data);
        // guardar en local storage los turnos
        localStorage.setItem('selectedTurnos', JSON.stringify(turnos.value));
        planificacion.value = response.data.planificacion
        planificacion.value.pedidos_no_atendidos = procesarPedidos(response.data.planificacion.pedidos_no_atendidos);
      } catch (error) {
        errorPlanificacion.value++
        if (error.response?.data?.detail) {
          estadoError.value = error.response.data.detail;
        } else {
          console.log(error);
        }
      }
    };
    function addMinutesToTime(time, minutesToAdd) {
      let [hours, minutes] = time.split(':').map(Number);
      
      // Add the minutes
      minutes += minutesToAdd;
      
      // Handle overflow of minutes into hours
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
      
      // Handle overflow of hours (e.g., 24 -> 00)
      hours = hours % 24;
      
      // Format the time back to "hh:mm" string
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } 

    const crearPlanificacion = async (pedidosNormalizados) => {
      var vehiculosNormalizados =  turnos.value.reduce((acc, turno) => {
        turno.vehicles.forEach((vehiculo_selected)=>{
          const v = vehiculos.value.find(v => v.id === vehiculo_selected.vehicle_id);
          const lc = lugaresComunes.value.find(l => l.id === vehiculo_selected.lugares_comunes_id);
          let supported_characteristics = []; //Agregar aca todas las caracteristicas que tenga el vehiculo que permite que se pueda utilizar si el pedido/cliente indica que tiene esa caracteristica
          if (v?.caracteristicas.some(c => c.nombre === "rampa_electrica")){
            supported_characteristics.push("rampa_electrica");
          }

          if (v) {
            acc.push({
              id: vehiculo_selected.vehicleIdWithTurnoIndex, 
              seat_capacity : v.capacidad_convencional,
              wheelchair_capacity : v.capacidad_silla_de_ruedas,
              supported_characteristics: supported_characteristics,
              time_window: {
                start: turno.start+':00',
                end: turno.end+':00',
              },
              depot_start: { //FIXME: hardcodeado
                id: lc.id,
                address: lc.nombre,
                coordinates: {
                  latitude: lc.latitud,
                  longitude: lc.longitud
                },
              },
              with_rest: vehiculo_selected.con_descanso !== false, // Use the new con_descanso property with a default to true
              depot_end: { //FIXME: hardcodeado
                id: lc.id,
                address:  lc.nombre,
                coordinates: {
                  latitude: lc.latitud,
                  longitude: lc.longitud
                },
              },
            });
          }
        })
        return acc;
      }, []);

      const problem = {
        "vehicles": vehiculosNormalizados,
        "ride_requests": pedidosNormalizados
      };

      try {
        const response = await api.post('http://localhost:4210/optimization/v1/solve', problem, {withCredentials: false});
        const planificacionProcesada = procesarNuevaPlanificacion(response.data, vehiculosNormalizados);
        guardarPlanificacion(planificacionProcesada)
        showPedidos.value = false;
        estadoError.value = null;
      }catch (error) {
        console.log('The error was:', error);
        errorPlanificacion.value++
        estadoError.value = "Error al planificar";
      }
  };


    const handleDateChange = (newDate) => {
      selectedDate.value = newDate;
      fetchPedidos();
    };

    const addTolerance = (time, commmand="none") => {
      let date = new Date(`1970-01-01T${time}Z`);

      if (commmand=="substract"){
        date.setTime(date.getTime() - TIMEWINDOW_TOLERANCE * 60 * 1000);
      }else if (commmand=="add"){
        date.setTime(date.getTime() + TIMEWINDOW_TOLERANCE * 60 * 1000);
      }
      let updatedTime = date.toISOString().substring(11, 19);
      return updatedTime;
    };

    const handleCheckboxChangePedidos = (unselectedPedidos) =>{
      unselectedPedidosIds.value = unselectedPedidos;
    }
    const handleSelectedTurnos = (t) =>{
      turnos.value = t
    }

    const validarPlanificacion = () => {
      // Validar que haya al menos un pedido seleccionado
      if (!pedidos.value || pedidos.value.length === 0) {
        estadoError.value = "No hay pedidos disponibles para planificar.";
        errorPlanificacion.value++;
        return false;
      }

      // Verificar que haya pedidos seleccionados
      if (unselectedPedidosIds.value.length === pedidos.value.length) {
        estadoError.value = "Debe seleccionar al menos un pedido para planificar.";
        errorPlanificacion.value++;
        return false;
      }

      // Validar que haya al menos un turno definido
      if (!turnos.value || turnos.value.length === 0) {
        estadoError.value = "No hay turnos definidos. Debe crear al menos un turno para planificar.";
        errorPlanificacion.value++;
        return false;
      }

      // Validar los vehículos en cada turno
      for (let i = 0; i < turnos.value.length; i++) {
        const turno = turnos.value[i];
        
        if (!turno.vehicles || turno.vehicles.length === 0) {
          estadoError.value = `El turno ${i+1} no tiene vehículos asignados.`;
          errorPlanificacion.value++;
          return false;
        }

        for (let j = 0; j < turno.vehicles.length; j++) {
          const vehicle = turno.vehicles[j];
          
          if (!vehicle.vehicle_id) {
            estadoError.value = `El vehículo ${j+1} del turno ${i+1} no tiene un ID de vehículo válido.`;
            errorPlanificacion.value++;
            return false;
          }
          
          if (vehicle.lugares_comunes_id === null || vehicle.lugares_comunes_id === undefined) {
            estadoError.value = `El vehículo ${j+1} del turno ${i+1} no tiene un lugar común asignado.`;
            errorPlanificacion.value++;
            return false;
          }
          
          if (vehicle.chofer_id === null || vehicle.chofer_id === undefined) {
            estadoError.value = `El vehículo ${j+1} del turno ${i+1} no tiene un chofer asignado.`;
            errorPlanificacion.value++;
            return false;
          }
          
          if (!vehicle.vehicleIdWithTurnoIndex) {
            estadoError.value = `El vehículo ${j+1} del turno ${i+1} no tiene un identificador combinado válido.`;
            errorPlanificacion.value++;
            return false;
          }
        }
      }
      
      return true;
    };

    const planificar = () => {
      // Ejecutar validación antes de continuar
      if (!validarPlanificacion()) {
        return;
      }

      const pedidosNormalizados = pedidos.value.reduce((acc, pedido) => {
        if (!unselectedPedidosIds.value.includes(pedido.id)) {
          const paradas = pedido.paradas;
          paradas.sort((a, b) => a.posicion_en_pedido - b.posicion_en_pedido);
          for (let i = 0; i + 1 < paradas.length; i += 1) {
            const origen = paradas[i];
            const destino = paradas[i + 1];
            let characteristics = []; // Agregar aca todas las caracteristicas que tenga el pedido/cliente que restringan que tipo de vehiculo se pueda utilizar
            if (pedido.cliente.caracteristicas.some(c => c.nombre === "rampa_electrica")){
              characteristics.push("rampa_electrica");
            }
            let normalized ={
                id: pedido.id,
                user_id: pedido.cliente_documento,
                has_companion: pedido.acompanante,
                wheelchair_required: pedido.cliente.caracteristicas.some(c => c.nombre === "silla_de_ruedas"),
                characteristics: characteristics, //Agregar aca todas las caracteristicas que tengan los pedidos/clientes que restringan que tipo de vehiculo se pueda utilizar
                pickup: {
                  coordinates: {
                    latitude: origen.latitud,
                    longitude: origen.longitud
                  },
                  stop_id: origen.id,
                  address: origen.direccion,
                  type: origen.tipo_parada? origen.tipo_parada.nombre: null
                },
                delivery: {
                  coordinates: {
                    latitude: destino.latitud,
                    longitude: destino.longitud
                  },
                  stop_id: destino.id,
                  address: destino.direccion,
                  type: destino.tipo_parada? destino.tipo_parada.nombre: null
                }
              };//TODO: agrupar los ifs, no se hace x claridad
              if (pedido.tipo=="Solo ida"){ 
                normalized.direction = "going";
                normalized.delivery.time_window = {
                  start: addTolerance(destino.ventana_horaria_inicio, "substract"),
                  end: addTolerance(destino.ventana_horaria_inicio),
                };
              }else if (pedido.tipo=="Solo vuelta"){
                normalized.direction = "return";
                normalized.pickup.time_window = {
                  start: addTolerance(origen.ventana_horaria_inicio, "substract"),
                  end: addTolerance(origen.ventana_horaria_inicio),
                };
              }else if (pedido.tipo=="Ida y vuelta"){
                if (i==0){
                  normalized.direction = "going";
                  normalized.delivery.time_window = {
                    start: addTolerance(destino.ventana_horaria_inicio, "substract"),
                    end: addTolerance(destino.ventana_horaria_inicio),
                  };
                }else if (i + 2 == paradas.length){//last element, return
                  normalized.direction = "return";
                  normalized.pickup.time_window = {
                    start: addTolerance(origen.ventana_horaria_fin),
                    end: addTolerance(origen.ventana_horaria_fin, "add"),
                  };
                }else{ //solo cuando va a 2 o mas lugares y vuelve a su casa
                  normalized.direction = "going"; //TODO: definir que va aca cuando tiene doble time window
                  normalized.pickup.time_window = {
                    start: addTolerance(origen.ventana_horaria_fin),
                    end: addTolerance(origen.ventana_horaria_fin, "add"),
                  };
                  normalized.delivery.time_window = {
                    start: addTolerance(destino.ventana_horaria_inicio, "substract"),
                    end: addTolerance(destino.ventana_horaria_inicio),
                  };
                }
                
              }
              acc.push(normalized);
            }}
        return acc;
      }, []);
      return crearPlanificacion(pedidosNormalizados);
    };

    onMounted(() => {
      console.log("onMounted1");
      fetchVehiculos()
      fetchChoferes()
      fetchLugaresComunes()
      if (route.params.planificacionId) {
        fetchPlanificacion(route.params.planificacionId);
        showPedidos.value = false;
      } else {
        fetchPedidos(); 
      }
    });

    return {
      selectedDate,
      processedPedidos,
      vehiculos,
      choferes,
      lugaresComunes,
      planificacion,
      unselectedPedidosIds,
      handleDateChange,
      planificar,
      handleCheckboxChangePedidos,
      handleSelectedTurnos,
      showPedidos,
      fetchPedidos,
      errorPlanificacion,
      estadoError,
      hoveredPedidoId,
      hoverOrigin,
      handleRowHover,
      handleMarkerHover,
      downloadPlanificacionPDF
    };
  }
};
</script>

<style scoped>
.main-container {
  position: relative;
  height: 100vh;
  width: 100vw;
}
</style>