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
              coords: coords
          });
      });
      console.log(nuevoListado);
      return nuevoListado;
    }
    
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
            const vehicle = vehiculosNormalizados.find(v => v.id === Number(p.vehicle_id) && v.time_window.start === p.time_window.start && v.time_window.end === p.time_window.end);
            normalizedRutas.push({
                    id_vehiculo: p.vehicle_id,
                    hora_inicio: vehicle.time_window.start,
                    hora_fin: vehicle.time_window.end,
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
                normalizedTurnos.push({
                    hora_inicio: vehicle.time_window.start,
                    hora_fin: vehicle.time_window.end,
                });
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

    const crearPlanificacion = async (pedidosNormalizados) => {
      var vehiculosNormalizados =  turnos.value.reduce((acc, turno) => {
        turno.vehicles.forEach((vehiculo_selected)=>{
          const v = vehiculos.value.find(v => v.id === vehiculo_selected.vehicle_id);
          if (v) {
            acc.push({
              id: v.id,
              capacity: v.capacidad_convencional,
              time_window: {
                start: turno.start+':00',
                end: turno.end+':00',
              }
            });
          }
        })
        return acc;
      }, []);

      const problem = {
        "depot": { //FIXME: hardcodeado
          "id": 101,
          "address": "Dr. Martín C. Martínez 1222",
          "coordinates": {
            "latitude": -34.8704884,
            "longitude": -56.1401427
          },
          "time_window": {
            "start": "08:00:00",
            "end": "23:00:00"
          }
        },
         "vehicles": vehiculosNormalizados,
        "ride_requests": pedidosNormalizados
      };

      try {
        const response = await api.post('http://localhost:4210/optimization/v1/solve', problem, {withCredentials: false});
        const planificacionProcesada = procesarNuevaPlanificacion(response.data, vehiculosNormalizados);
        guardarPlanificacion(planificacionProcesada)
        showPedidos.value = false;
      }catch (error) {
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