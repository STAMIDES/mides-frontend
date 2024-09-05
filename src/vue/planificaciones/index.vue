<template>
  <div class="main-container">
    <MontevideoMap :processedPedidos="processedPedidos"  />
    <RightSidebar 
      :selectedDate="selectedDate" 
      :processedPedidos="processedPedidos" 
      @date-changed="handleDateChange"
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
        console.log(selectedDate);
        const response = await api.get(`/pedidos/fecha/${selectedDate.value}`);
        pedidos.value = response.data.pedidos;
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };

    const handleDateChange = (newDate) => {
      selectedDate.value = newDate;
      fetchPedidos();
    };

    onMounted(() => {
      fetchPedidos().then(() => {
        console.log('Pedidos fetched and component is fully mounted');
      });
    });

    return {
      selectedDate,
      processedPedidos,
      handleDateChange
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