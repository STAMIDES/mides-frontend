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
        <div v-else class="turnos-container">
          <div class="turno morning-shift">
            <h3>Turno mañana (7:00 - 13:00)</h3>
            <div class="vehicles-grid">
              <div v-for="vehicle in vehiculos" :key="vehicle.id" class="vehicle-box">
                <input 
                  type="checkbox" 
                  :id="'morning-' + vehicle.id"
                  v-model="selectedVehicles.morning[vehicle.id]"
                  @change="emitSelectedVehicles"
                />
                <label :for="'morning-' + vehicle.id">{{ vehicle.descripcion }}</label>
                <label :for="'morning-' + vehicle.id">{{ vehicle.matricula }}</label>
              </div>
            </div>
          </div>
          <div class="turno afternoon-shift">
            <h3>Turno tarde (13:00 - 20:00)</h3>
            <div class="vehicles-grid">
              <div v-for="vehicle in vehiculos" :key="vehicle.id" class="vehicle-box">
                <input 
                  type="checkbox" 
                  :id="'afternoon-' + vehicle.id"
                  v-model="selectedVehicles.afternoon[vehicle.id]"
                  @change="emitSelectedVehicles"
                />
                <label :for="'afternoon-' + vehicle.id">{{ vehicle.descripcion }}</label>
                <label :for="'afternoon-' + vehicle.id">{{ vehicle.matricula }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-button">
          <button class="btn" @click="planificar">Planificar</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, reactive } from 'vue';
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
    },
    vehiculos: {
      type: Array,
      required: true
    },
    lugaresComunes: {
      type: Array,
      required: true
    }
  },
  emits: ['date-changed', 'planificar', 'checkbox-change', 'selected-vehicles'],
  setup(props, { emit }) {
    const isHidden = ref(false);
    const activeButton = ref('Pedidos');
    const date = ref(new Date(props.selectedDate).toISOString().split('T')[0]);
    const unselectedPedidos = ref([]);

    const selectedVehicles = reactive({
      morning: {},
      afternoon: {}
    });

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
        unselectedPedidos.value = unselectedPedidos.value.filter(pedidoId => pedidoId !== id);
      } else {
        unselectedPedidos.value.push(id);
      }
      emit('checkbox-change', unselectedPedidos.value);
    };

    const emitSelectedVehicles = () => {
      emit('selected-vehicles', selectedVehicles);
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
      planificar,
      selectedVehicles,
      emitSelectedVehicles
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
.turnos-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.turno {
  padding: 15px;
  border-radius: 5px;
}

.morning-shift {
  background-color: #ffedcc;
}

.afternoon-shift {
  background-color: #e6f2ff;
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.vehicle-box {
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.vehicle-box label {
  font-size: 14px;
}
</style>
