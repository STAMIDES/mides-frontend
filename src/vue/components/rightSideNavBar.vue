<template>
  <div class="sidebar" :class="{ 'sidebar-hidden': isHidden }">
    <button class="toggle-btn" @click="toggleSidebar">
      {{ isHidden ? '>' : '<' }}
    </button>
    <div class="sidebar-content">
      <DatePicker v-model="date" dateFormat="yy-mm-dd" @date-select="handleDateChange" class="date-input" />
      <div class="button-group">
        <div class="top-buttons">
          <button
            class="btn"
            :class="{ 'active': activeButton === 'Pedidos' }"
            @click="setActiveButton('Pedidos')"
          >
            Pedidos
          </button>
          <button
            class="btn"
            :class="{ 'active': activeButton === 'Turnos' }"
            @click="setActiveButton('Turnos')"
          >
            Turnos
          </button>
        </div>
        <div v-if="activeButton === 'Pedidos'" class="pedidos-list">
          <table class="pedidos-table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Origen y Horario</th>
                <th>Destino y Horario</th>
              </tr>
            </thead>
            <tbody style="font-size: 10px;">
              <tr
                v-for="(pedido, index) in processedPedidos"
                :key="index"
                :style="{ backgroundColor: getPedidoColor(pedido.id) }"
              >
                <td>
                  <input 
                    type="checkbox" 
                    :checked="!unselectedPedidos.includes(pedido.id)" 
                    @change="toggleSelection(pedido.id)" 
                  />
                </td>
                <td>{{ pedido.id }}</td>
                <td>{{ pedido.direccion_origen_y_horario }}</td>
                <td>{{ pedido.direccion_destino_y_horario }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="bottom-button">
          <button class="btn" @click="planificar">Planificar</button>
        </div>
      </div>
    </div>
  </div>
</template>
  

<script>
import { ref } from 'vue';
import DatePicker from 'primevue/datepicker';

export default {
  name: 'RightSidebar',
  components: {
    DatePicker
  },
  props: {
    selectedDate: {
      type: String,
      required: true
    },
    processedPedidos: {
      type: Array,
      required: true
    }
  },
  emits: ['date-changed', 'planificar', 'checkbox-change'],
  setup(props, { emit }) {
    const isHidden = ref(false);
    const activeButton = ref('Pedidos');
    const date = ref(new Date(props.selectedDate).toISOString().split('T')[0]);

    const unselectedPedidos = ref([]);  // Start with an empty array

    const toggleSidebar = () => {
      isHidden.value = !isHidden.value;
    };

    const handleDateChange = (value) => {
      const formattedDate = formatDate(value);
      emit('date-changed', formattedDate);
    };

    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };

    const setActiveButton = (button) => {
      activeButton.value = button;
    };

    const getPedidoColor = (id) => {
      const baseLightness = 60;
      const variance = (id % 30) - 10;
      const lightness = baseLightness + variance;
      return `hsl(220, 15%, ${lightness}%)`;
    };

    const toggleSelection = (id) => {
      if (unselectedPedidos.value.includes(id)) {
        // Remove id from unselectedPedidos when checked
        unselectedPedidos.value = unselectedPedidos.value.filter(pedidoId => pedidoId !== id);
      } else {
        // Add id to unselectedPedidos when unchecked
        unselectedPedidos.value.push(id);
      }
      emit('checkbox-change', unselectedPedidos.value);
    };

    const planificar = () => {
      emit('planificar');
    };

    return {
      isHidden,
      activeButton,
      date,
      toggleSidebar,
      handleDateChange,
      setActiveButton,
      getPedidoColor,
      unselectedPedidos,
      toggleSelection,
      planificar
    };
  }
};

</script>

<style>
.p-datepicker-calendar-container {
  background-color: white !important;
  z-index: 1001 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 400px;
  background-color: #f8f8f8;
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar-hidden {
  transform: translateX(400px);
}


.toggle-btn {
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #f8f8f8;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.sidebar-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.date-input {
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
  background-color: white;
}
.button-group {
  background-color: #e8e8e8;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.top-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.bottom-button {
  margin-top: 20px;
  display: grid
}

.btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

.btn.active {
  background-color: #0056b3;
  font-weight: bold;
}

.pedidos-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pedidos-table {
  width: 100%;
  border-collapse: collapse;
}

.pedidos-table th,
.pedidos-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.pedidos-table tr:hover {
  background-color: #f1f1f1;
}
</style>
