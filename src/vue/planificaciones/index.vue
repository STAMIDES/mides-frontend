<template>
  <div class="main-container">
    <MontevideoMap :processedPedidos="processedPedidos"  />
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

export default {
  name: 'MainPage',
  components: {
    MontevideoMap,
    RightSidebar
  },
  setup() {
    const selectedDate = ref(new Date().toISOString().split('T')[0]);
    const pedidos = ref([]);

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
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };
    const crearPlanificacion = async (pedidosNormalizados) => {
      console.log('Planificar');
      const response = await api.post(`http://localhost:5000/planificaciones`, {
        pedidos: pedidosNormalizados
      });

    };

    const handleDateChange = (newDate) => {
      selectedDate.value = newDate;
      fetchPedidos();
    };
    const planificar = (unselectedPedidos) => {
      console.log('Planificar', unselectedPedidos);
      console.log(pedidos.value);
      const pedidosNormalizados = pedidos.value.reduce((acc, pedido) => {
        if (!unselectedPedidos.includes(pedido.id)) {
          pedido.paradas.sort((a, b) => a.posicion_en_pedido - b.posicion_en_pedido);
          for (let i = 0; i + 1 < paradas.length; i += 1) {
            const origen = paradas[i];
            const destino = paradas[i + 1];
            let normalized ={
                id: pedido.id,
                user_id: pedido.cliente_documento,
                has_companion: pedido.acompanante,
                weelchair_required:  cliente.caracteristicas.contains(silla_de_ruedas),
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
                  start: destino.ventana_horaria_inicio,
                  end: null
                };
              }else if (pedido.tipo=="Solo vuelta"){
                normalized.direction = "return";
                normalized.pickup.time_window = {
                  start: origen.ventana_horaria_inicio,
                  end: null
                };
              }else if (pedido.tipo=="Ida y vuelta"){
                if (i==0){
                  normalized.direction = "going";
                  normalized.delivery.time_window = {
                    start: destino.ventana_horaria_inicio,
                    end: null
                  };
                }else if (i + 2 == paradas.length){//last element, return
                  normalized.direction = "return";
                  normalized.pickup.time_window = {
                    start: origen.ventana_horaria_inicio,
                    end: null
                  };
                }else{ //solo cuando va a 2 o mas lugares y vuelve a su casa
                  normalized.direction = "undefined"; //TODO: definir
                  normalized.pickup.time_window = {
                    start: origen.ventana_horaria_fin,
                    end: null
                  };
                  normalized.delivery.time_window = {
                    start: destino.ventana_horaria_inicio,
                    end: null
                  };
                }
                
              }
              acc.push(normalized);
            }}
        return acc;
      }, []);
      console.log(pedidosNormalizados);
      return crearPlanificacion(pedidosNormalizados);
    };

    onMounted(() => {
      fetchPedidos().then(() => {
        console.log('Pedidos fetched and component is fully mounted');
      });
    });

    return {
      selectedDate,
      processedPedidos,
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