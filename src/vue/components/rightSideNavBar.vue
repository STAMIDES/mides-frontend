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
                    @change="toggleSelectionPedido(pedido.id)" 
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
                  :checked="selectedVehicles['morning'].includes(vehicle.id)"
                  @change="toggleSelectionVehiculo('morning', vehicle.id)"
                />
                <label :for="'morning-' + vehicle.id" class="truncate">{{ vehicle.descripcion }}</label>
                <label :for="'morning-' + vehicle.id">{{ vehicle.matricula }}</label>
                <select v-if="selectedVehicles['morning'].includes(vehicle.id)" 
                  @change="selectLugarComun('morning', vehicle.id, $event.target.value)">
                  <option value="">Lugar de salida</option>
                  <option v-for="lugar in lugaresComunes" :key="lugar.id" :value="lugar.id">
                    {{ lugar.nombre }}
                  </option>
                </select>
                <select v-if="selectedVehicles['morning'].includes(vehicle.id)" 
                  @change="selectChofer('morning', vehicle.id, $event.target.value)">
                  <option value="">Chofer</option>
                  <option v-for="chofer in choferes" :key="chofer.id" :value="chofer.id">
                    {{ chofer.nombre }}
                  </option>
                </select>
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
                  :checked="selectedVehicles['afternoon'].includes(vehicle.id)"
                  @change="toggleSelectionVehiculo('afternoon', vehicle.id)"
                />
                <label :for="'afternoon-' + vehicle.id" class="truncate">{{ vehicle.descripcion }}</label>
                <label :for="'afternoon-' + vehicle.id">{{ vehicle.matricula }}</label>
                <select v-if="selectedVehicles['afternoon'].includes(vehicle.id)" 
                  @change="selectLugarComun('afternoon', vehicle.id, $event.target.value)">
                  <option value="">Lugar de salida</option>
                  <option v-for="lugar in lugaresComunes" :key="lugar.id" :value="lugar.id">
                    {{ lugar.nombre }}
                  </option>
                </select>
                <select v-if="selectedVehicles['afternoon'].includes(vehicle.id)" 
                  @change="selectChofer('afternoon', vehicle.id, $event.target.value)">
                  <option value="">Chofer</option>
                  <option v-for="chofer in choferes" :key="chofer.id" :value="chofer.id">
                    {{ chofer.nombre }}
                  </option>
                </select>
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
import { ref, reactive, watch } from 'vue';
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
    },
    choferes: {
      type: Array,
      required: true
    }
  },
  emits: ['date-changed', 'planificar', 'checkbox-change-pedidos', 'checkbox-change-vehicles', 'selector-change-lugares-comunes', 'selector-change-choferes'],
  setup(props, { emit }) {
    const isHidden = ref(false);
    const activeButton = ref('Pedidos');
    const date = ref(new Date(props.selectedDate).toISOString().split('T')[0]);
    const unselectedPedidos = ref([]);

    const selectedVehicles = ref({
      morning: [],
      afternoon: []
    });

    const selectLugaresComunes = ref({
      morning: [],
      afternoon: [],
    });

    const selectChoferes = ref({
      morning: [],
      afternoon: [],
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

    const toggleSelectionPedido = (id) => {
      if (unselectedPedidos.value.includes(id)) {
        unselectedPedidos.value = unselectedPedidos.value.filter(pedidoId => pedidoId !== id);
      } else {
        unselectedPedidos.value.push(id);
      }
      emit('checkbox-change-pedidos', unselectedPedidos.value);
    };

    const toggleSelectionVehiculo = (period,id) => {
      console.log(selectedVehicles.value);
      console.log(selectedVehicles.value['morning']);
      const index = selectedVehicles.value[period].indexOf(id);
        if (index === -1) {
          selectedVehicles.value[period].push(id);  
        } else {
          selectedVehicles.value[period].splice(index, 1);
          selectLugaresComunes.value[period] = selectLugaresComunes.value[period].filter(item => item.vehicle_id !== id);
          selectChoferes.value[period] = selectChoferes.value[period].filter(item => item.vehicle_id !== id);
        }
      emit('checkbox-change-vehicles', selectedVehicles.value);
    };  

    const planificar = () => {
      emit('planificar');
    };

    const selectLugarComun = (period, vehicleId, lugarComunId) => {
      // Check if the vehicle is selected in both periods
      if (selectedVehicles.value.morning.includes(vehicleId) && selectedVehicles.value.afternoon.includes(vehicleId)) {
        // skip for now
      } else {
        // Add to the current period array
        const index = selectLugaresComunes.value[period].findIndex(item => item.vehicle_id === vehicleId);
        if (index !== -1) {
          selectLugaresComunes.value[period][index].lugares_comunes_id = lugarComunId;
        } else {
          selectLugaresComunes.value[period].push({ vehicle_id: vehicleId, lugares_comunes_id: lugarComunId });
        }
      }
      emit('selector-change-lugares-comunes', selectLugaresComunes.value);
    };
    
    const selectChofer = (period, vehicleId, choferId) => {
      // Check if the vehicle is selected in both periods
      if (selectedVehicles.value.morning.includes(vehicleId) && selectedVehicles.value.afternoon.includes(vehicleId)) {
        // skip for now
      } else {
        // Add to the current period array
        const index = selectChoferes.value[period].findIndex(item => item.vehicle_id === vehicleId);
        if (index !== -1) {
          selectChoferes.value[period][index].chofer_id = choferId;
        } else {
          selectChoferes.value[period].push({ vehicle_id: vehicleId, chofer_id: choferId });
        }
      }
      emit('selector-change-choferes', selectChoferes.value);
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
      toggleSelectionPedido,
      planificar,
      selectedVehicles,
      toggleSelectionVehiculo,
      selectLugarComun,
      selectChofer,
      selectLugaresComunes
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
  grid-template-columns: repeat(4, 1fr); /* Set 4 columns for the grid */
  gap: 10px;
  margin-top: 10px;
  overflow-x: auto; /* Enable horizontal scrolling */
  white-space: nowrap;
}

.vehicle-box {
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 120px; /* Ensure each vehicle box takes a minimum width */
  max-width: 200px; /* Set a max-width to prevent the box from expanding too much */
  box-sizing: border-box; /* Include padding in width calculation */
  overflow: hidden;
}

.vehicle-box label {
  font-size: 14px;
  text-align: center;
}

.truncate {
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Add ellipsis for text overflow */
}
.vehicle-box select {
  width: 100%; /* Make the select element take full width of the box */
  max-width: 100%; /* Prevent the select from overflowing the box */
  box-sizing: border-box; /* Include padding in width calculation */
  font-size: 10px;
}
</style>