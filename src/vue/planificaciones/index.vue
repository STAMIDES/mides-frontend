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
          const lc = lugaresComunes.value.find(l => l.id === Number(vehiculo_selected.lugares_comunes_id));
          const has_electric_ramp = v?.caracteristicas.some(c => c.nombre === "rampa_electrica");
          if (v) {
            acc.push({
              id: vehiculo_selected.vehicleIdWithTurnoIndex, 
              seat_capacity : v.capacidad_convencional,
              wheelchair_capacity : v.capacidad_silla_de_ruedas,
              has_electric_ramp: has_electric_ramp,
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
                wheelchair_required: pedido.cliente.caracteristicas.some(c => c.nombre === "silla_de_ruedas"),
                electric_ramp_required:  pedido.cliente.caracteristicas.some(c => c.nombre === "rampa_electrica"),
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