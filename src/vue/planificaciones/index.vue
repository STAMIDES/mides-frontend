<template>
  <div class="main-container">
    <MontevideoMap :processedPedidos="processedPedidos" :planificacion="planificacion" 
    :unselectedPedidosIds="unselectedPedidosIds" :showPedidos="showPedidos" />
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
      @date-changed="handleDateChange"
      @planificar="planificar"
      @checkbox-change-pedidos="handleCheckboxChangePedidos"
      @selected-turnos="handleSelectedTurnos"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import MontevideoMap from '../components/montevideoMap.vue';
import RightSidebar from '../components/rightSideNavBar.vue';
import {useRoute} from "vue-router";


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
    const selectedDate = ref(new Date().toISOString().split('T')[0]);
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

    const procesarPedidos = (pedidosSinProcesar) => { // Funcion ya definida en react :/ #FIXME mover a utils
      const nuevoListado = [];
      pedidosSinProcesar.sort((a, b) => new Date(a.fecha_programado) - new Date(b.fecha_programado));
      pedidosSinProcesar.forEach(pedido => {
        const paradas = pedido.paradas;
        const nombreYApellido = `${pedido.cliente.nombre}\n${pedido.cliente.apellido}`;
        paradas.sort((a, b) => a.posicion_en_pedido - b.posicion_en_pedido);
        let lastDestino
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
            direccion_origen_y_horario: direccionOrigenYHorario,
            direccion_destino_y_horario: direccionDestinoYHorario,
            latitud_origen: origen.latitud,
            longitud_origen: origen.longitud,
            latitud_destino: destino.latitud,
            longitud_destino: destino.longitud
          });
          lastDestino = destino;
        }
      });
      return nuevoListado;
    };
    
    const processedPedidos = computed(() => procesarPedidos(pedidos.value));

    const fetchPedidos = async () => {
      try {
        const response = await api.get(`/pedidos/fecha/${selectedDate.value}`);
        pedidos.value = response.data.pedidos;
        planificacion.value = {};
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };

    const fetchPlanificacion = async (id) => {
      try {
        const response = await api.get(`/planificaciones/${id}`);
        planificacion.value = response.data.planificacion;
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
          turnos: normalizedTurnos
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
      } catch (error) {
        errorPlanificacion.value++
        estadoError.value = error.response.data.detail;
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
          if (v) {
            const start_tolerance = addMinutesToTime(turno.start, 30);
            const end_tolerance = addMinutesToTime(turno.end, 30);
            acc.push({
              id: vehiculo_selected.vehicleIdWithTurnoIndex, 
              capacity: v.capacidad_convencional,
              depot_start: { //FIXME: hardcodeado
                id: 101,
                address: "Dr. Martín C. Martínez 1222",
                coordinates: {
                  latitude: -34.8704884,
                  longitude: -56.1401427
                },
                time_window: {
                  start: turno.start+':00',
                  end: start_tolerance+':00',
                }
              },
              depot_end: { //FIXME: hardcodeado
                id: 101,
                address: "Dr. Martín C. Martínez 1222",
                coordinates: {
                  latitude: -34.8704884,
                  longitude: -56.1401427
                },
                time_window: {
                  start: turno.end+':00',
                  end: end_tolerance+':00',
                }
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

    const addTolerance = (time, substract=true) => {

      let date = new Date(`1970-01-01T${time}Z`);

      if (substract){
        date.setTime(date.getTime() - TIMEWINDOW_TOLERANCE * 60 * 1000);
      }else{
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
    const planificar = () => {
      const pedidosNormalizados = pedidos.value.reduce((acc, pedido) => {
        if (!unselectedPedidosIds.value.includes(pedido.id)) {
          const paradas = pedido.paradas;
          paradas.sort((a, b) => a.posicion_en_pedido - b.posicion_en_pedido);
          for (let i = 0; i + 1 < paradas.length; i += 1) {
            const origen = paradas[i];
            const destino = paradas[i + 1];
            let normalized ={
                id: pedido.id,
                user_id: pedido.cliente_documento,
                has_companion: pedido.acompanante,
                weelchair_required:   true,//cliente.caracteristicas.contains(silla_de_ruedas),
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
                  start: addTolerance(destino.ventana_horaria_inicio),
                  end: addTolerance(destino.ventana_horaria_inicio, false),
                };
              }else if (pedido.tipo=="Solo vuelta"){
                normalized.direction = "return";
                normalized.pickup.time_window = {
                  start: addTolerance(origen.ventana_horaria_inicio) ,
                  end: addTolerance(origen.ventana_horaria_inicio, false),
                };
              }else if (pedido.tipo=="Ida y vuelta"){
                if (i==0){
                  normalized.direction = "going";
                  normalized.delivery.time_window = {
                    start: addTolerance(destino.ventana_horaria_inicio),
                    end: addTolerance(destino.ventana_horaria_inicio, false),
                  };
                }else if (i + 2 == paradas.length){//last element, return
                  normalized.direction = "return";
                  normalized.pickup.time_window = {
                    start: addTolerance(origen.ventana_horaria_fin),
                    end: addTolerance(origen.ventana_horaria_fin, false),
                  };
                }else{ //solo cuando va a 2 o mas lugares y vuelve a su casa
                  normalized.direction = "going"; //TODO: definir que va aca cuando tiene doble time window
                  normalized.pickup.time_window = {
                    start: addTolerance(origen.ventana_horaria_fin),
                    end: addTolerance(origen.ventana_horaria_fin, false),
                  };
                  normalized.delivery.time_window = {
                    start: addTolerance(destino.ventana_horaria_inicio),
                    end: addTolerance(destino.ventana_horaria_inicio, false),
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
      fetchVehiculos()
      fetchChoferes()
      fetchLugaresComunes()
      if (route.params.planificacionId) {
        fetchPlanificacion(route.params.planificacionId);
        showPedidos.value = false;
      } else {
        fetchPedidos(); 
        showPedidos.value = true;
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
      estadoError
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