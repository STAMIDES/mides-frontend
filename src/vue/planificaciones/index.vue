<template>
  <div class="main-container">
    <MontevideoMap :processedPedidos="processedPedidos" :planificacion="planificacion" />
    <RightSidebar 
      :selectedDate="selectedDate" 
      :processedPedidos="processedPedidos" 
      @date-changed="handleDateChange"
      @planificar="planificar"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import MontevideoMap from '../components/montevideoMap.vue';
import RightSidebar from '../components/rightSideNavBar.vue';

import { api } from "../../network/axios";
const TIMEWINDOW_TOLERANCE = 15;
export default {
  name: 'MainPage',
  components: {
    MontevideoMap,
    RightSidebar
  },
  setup() {
    const selectedDate = ref(new Date().toISOString().split('T')[0]);
    const pedidos = ref([]);
    const vehiculos = ref([]);
    const lugaresComunes = ref([]);
    const planificacion = ref({});

    const procesarPedidos = (pedidosSinProcesar) => { // Funcion ya definida en react :/ #FIXME mover a utils
      const nuevoListado = [];
      console.log(pedidosSinProcesar);
      pedidosSinProcesar.sort((a, b) => new Date(a.fecha_programado) - new Date(b.fecha_programado));
      pedidosSinProcesar.forEach(pedido => {
        const paradas = pedido.paradas;
        const nombreYApellido = `${pedido.cliente.nombre}\n${pedido.cliente.apellido}`;
        paradas.sort((a, b) => a.posicion_en_pedido - b.posicion_en_pedido);
        
        for (let i = 0; i + 1 < paradas.length; i += 1) {
          const origen = paradas[i];
          const destino = paradas[i + 1];
          
          const direccionOrigenYHorario = `${origen.direccion} \n ${origen.ventana_horaria_inicio  || 'Sin horario'}`;
          const direccionDestinoYHorario = `${destino.direccion} \n ${destino.ventana_horaria_inicio || 'Sin horario'}`;
          
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
        }
      });
      console.log(nuevoListado);
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
        lugaresComunes.value = response.data.lugares_comunes;
      } catch (error) {
        console.error('Error fetching lugares comunes:', error);
      }
    };
    const crearPlanificacion = async (pedidosNormalizados, unselectedPedidos) => {
      const problem = {"depot": {
                    "id": "5774",
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
                  "vehicles": [
                    {
                      "id": "24457",
                      "capacity": 10,
                      "time_window": {
                        "start": "08:00:00",
                        "end": "23:00:00"
                      }
                    }
                  ],
                  "ride_requests": pedidosNormalizados
                };
      const response = await api.post(`http://localhost:4210/optimization/v1/solve`,  problem);
      console.log(response);
      planificacion.value = response.data;
      planificacion.value.unselectedPedidos = unselectedPedidos;
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
      console.log(updatedTime); // Outputs the time after adding 15 minutes
      return updatedTime;
    };

    const planificar = (unselectedPedidos) => {
      console.log('Planificar', unselectedPedidos);
      const pedidosNormalizados = pedidos.value.reduce((acc, pedido) => {
        if (!unselectedPedidos.includes(pedido.id)) {
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
                  address: origen.direccion
                },
                delivery: {
                  coordinates: {
                    latitude: destino.latitud,
                    longitude: destino.longitud
                  },
                  address: destino.direccion,
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
                    start: addTolerance(origen.ventana_horaria_inicio),
                    end: addTolerance(origen.ventana_horaria_inicio, false),
                  };
                }else{ //solo cuando va a 2 o mas lugares y vuelve a su casa
                  normalized.direction = "undefined"; //TODO: definir
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
      return crearPlanificacion(pedidosNormalizados, unselectedPedidos);
    };

    onMounted(() => {
      fetchPedidos()
      fetchVehiculos()
      fetchLugaresComunes()
    });

    return {
      selectedDate,
      processedPedidos,
      planificacion,
      handleDateChange,
      planificar
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