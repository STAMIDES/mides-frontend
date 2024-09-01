<template>
  <div class="main-container">
    <Planificaciones :pedidos="pedidos" />
    <RightSidebar 
      :selectedDate="selectedDate" 
      :pedidos="pedidos" 
      @date-changed="handleDateChange"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Planificaciones from '../components/montevideoMap.vue';
import RightSidebar from '../components/rightSideNavBar.vue';
import { api } from "../../network/axios";

export default {
  name: 'MainPage',
  components: {
    Planificaciones,
    RightSidebar
  },
  setup() {
    const selectedDate = ref(new Date().toISOString().split('T')[0]);
    const pedidos = ref([]);

    const fetchPedidos = async () => {
      try {
        const response = await api.get(`/pedidos/fecha/${selectedDate.value}`);
        pedidos.value = response.data;
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      }
    };

    const handleDateChange = (newDate) => {
      selectedDate.value = newDate;
      fetchPedidos();
    };

    onMounted(() => {
      fetchPedidos();
    });

    return {
      selectedDate,
      pedidos,
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