<template>
  <div class="sidebar" :class="{ 'sidebar-hidden': isHidden }">
    <button class="toggle-btn" @click="toggleSidebar">
      {{ isHidden ? '>' : '<' }}
    </button>
    <div class="sidebar-content">
      <div class="button-group">
        <div v-if="Object.keys(planificacion).length > 0" >
          <button class="btn" @click="fetchPedidos()">
            Crear nueva planificación
          </button>
          <div class="planification-results">
            <div>

              <h3 style="margin:0">
                Detalles de Planificación {{ planificacion.id }} 
              </h3>
              <p>
                {{ formatDate2(planificacion.fecha) }}
              </p>
            </div>
            
            <div class="rutas-container">
              <div v-for="(ruta, index) in planificacion.rutas" :key="index" class="ruta-block">
                <div class="ruta-header">
                  <h3 class="font-bold">
                    Turno: {{ formatTime(ruta.hora_inicio) }} - {{ formatTime(ruta.hora_fin) }}
                  </h3>
                  <p class="text-sm">
                    Vehículo: {{ ruta.vehiculo.matricula }} - {{ ruta.vehiculo.descripcion }}
                  </p>
                </div>
                
                <div class="visitas-container">
                  <div v-for="(visita, vIndex) in ruta.visitas" :key="vIndex" class="visita-row">
                    <div class="visita-time">{{ formatTime(visita.hora_llegada) }}</div>
                    <div class="visita-status-wrapper" :class="getStatusClass(visita.estado)">
                      <div class="visita-status-circle" :class="getStatusClass(visita.estado)"/>
                    </div>
                    <div class="visita-address">{{ visita.item.direccion }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          <div v-else>
            <DatePicker v-model="date" dateFormat="yy-mm-dd" @date-select="handleDateChange" class="date-input" />
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
                    <td style="white-space: pre-line">
                      {{ pedido.direccion_origen_y_horario }}
                    </td>
                    <td style="white-space: pre-line">
                      {{ pedido.direccion_destino_y_horario }}
                    </td>
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
                    :checked="selectedVehicles['morning'].some(v => v.vehicle_id === vehicle.id)"
                    @change="toggleSelectionVehiculo('morning', vehicle.id)"
                  />
                  <label :for="'morning-' + vehicle.id" class="truncate">{{ vehicle.descripcion }}</label>
                  <label :for="'morning-' + vehicle.id">{{ vehicle.matricula }}</label>
                  <template v-if="selectedVehicles['morning'].some(v => v.vehicle_id === vehicle.id)">
                  <select
                    @change="selectLugarComun('morning', vehicle.id, $event.target.value)">
                    <option value="">Lugar de salida</option>
                    <option v-for="lugar in lugaresComunes" :key="lugar.id" :value="lugar.id">
                      {{ lugar.nombre }}
                    </option>
                  </select>
                  <select
                    @change="selectChofer('morning', vehicle.id, $event.target.value)">
                    <option value="">Chofer</option>
                    <option v-for="chofer in choferes" :key="chofer.id" :value="chofer.id">
                      {{ chofer.nombre }}
                    </option>
                  </select>
                </template>
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
                    :checked="selectedVehicles['afternoon'].some(v => v.vehicle_id === vehicle.id)"
                    @change="toggleSelectionVehiculo('afternoon', vehicle.id)"
                  />
                  <label :for="'afternoon-' + vehicle.id" class="truncate">{{ vehicle.descripcion }}</label>
                  <label :for="'afternoon-' + vehicle.id">{{ vehicle.matricula }}</label>
                  <template v-if="selectedVehicles['afternoon'].some(v => v.vehicle_id === vehicle.id)">
                  <select
                    @change="selectLugarComun('afternoon', vehicle.id, $event.target.value, selectedVehicles['afternoon'])">
                    <option value="">Lugar de salida</option>
                    <option v-for="lugar in lugaresComunes" :key="lugar.id" :value="lugar.id">
                      {{ lugar.nombre }}
                    </option>
                  </select>
                  <select
                    @change="selectChofer('afternoon', vehicle.id, $event.target.value)">
                    <option value="">Chofer</option>
                    <option v-for="chofer in choferes" :key="chofer.id" :value="chofer.id">
                      {{ chofer.nombre }}
                    </option>
                  </select>
                </template>
                </div>
              </div>
            </div>
          </div>
          <div class="bottom-button">
            <button class="btn big" @click="planificar" :disabled="isPlanificando">
              <span v-if="!isPlanificando">Planificar</span>
              <span v-else class="spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, watch } from 'vue';
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
    },
    planificacion: {
      type: Object,
      default: {}
    },
    fetchPedidos: {
      type: Function,
      required: true
    }
  },
  emits: ['date-changed', 'planificar', 'checkbox-change-pedidos', 'selected-vehicles'],
  setup(props, { emit }) {
    const isHidden = ref(false);
    const activeButton = ref('Pedidos');
    const date = ref(new Date(props.selectedDate).toISOString().split('T')[0]);
    const unselectedPedidos = ref([]);
    const isPlanificando = ref(false);

    const selectedVehicles = ref({
      morning: [],
      afternoon: []
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
    const formatDate2 = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (timeString) => {
      if (!timeString) return '';
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    };

    const getStatusClass = (status) => {
      return {
        'status-pending': status === 'Pendiente',
        'status-completed': status === 'Realizada'
      };
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

    const toggleSelectionVehiculo = (period, id) => {
      const index = selectedVehicles.value[period].findIndex(item => item.vehicle_id === id);
      if (index === -1) {
        selectedVehicles.value[period].push({ vehicle_id: id, lugares_comunes_id: null, chofer_id: null });
      } else {
        selectedVehicles.value[period].splice(index, 1);
      }
      emit('selected-vehicles', selectedVehicles.value);
    };
    const selectLugarComun = (period, vehicleId, lugarComunId) => {
      const index = selectedVehicles.value[period].findIndex(item => item.vehicle_id === vehicleId);
      if (index !== -1) {
        selectedVehicles.value[period][index].lugares_comunes_id = lugarComunId;
        emit('selected-vehicles', selectedVehicles.value);
      }
    };

    const selectChofer = (period, vehicleId, choferId) => {
      const index = selectedVehicles.value[period].findIndex(item => item.vehicle_id === vehicleId);
      if (index !== -1) {
        selectedVehicles.value[period][index].chofer_id = choferId;
        emit('selected-vehicles', selectedVehicles.value);
      }
    };

    const planificar = async () => {
      if (selectedVehicles.value.morning.length === 0 && selectedVehicles.value.afternoon.length === 0) {
        alert('Debe seleccionar al menos un vehículo para planificar');
        return;
      }
      isPlanificando.value = true;
      emit('planificar');
    };

    watch(() => props.planificacion, (newValue) => {
      if (newValue !== null) {
        console.log(newValue);
        isPlanificando.value = false;
      }
    });

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
      isPlanificando,
      planificar,
      formatDate2,
      formatTime,
      getStatusClass
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
  width: 100%;
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
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.btn.big {
  width: 100%;
}

.btn:hover {
  background-color: #0056b3;
}

.btn.active {
  background-color: #0056b3;
  font-weight: bold;
}
.btn.save {
  background-color: #28a745;
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
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.planification-results {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.ruta-block {
  background-color: #abafb2;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  font-size: 0.8em;
}

.ruta-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.visitas-container {
  display: flex;
  flex-direction: column;
}

.visita-row {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  padding-left: 8px;
  padding-right: 8px;
  gap: 1rem;
  background-color: white;
  font-size: 0.9em;
  border-bottom-style: double;
  border-bottom-color: #dee2e6;
}

.visita-time {
  font-weight: 500;
  color: #495057;
}

.visita-status-circle {
  position: relative;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  z-index: 1;
}
.status-pending.visita-status-circle {
  background-color: blue;
}
.status-completed.visita-status-circle {
  background-color: rgb(154, 157, 181);
}

.visita-status-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}

.visita-status-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%; 
  width: 8px; 
  transform: translateX(-50%); 
}
.status-pending.visita-status-wrapper::before {
  background-color: blue;
}

.status-completed.visita-status-wrapper::before {
  background-color: rgb(154, 157, 181);
}

.visita-address {
  color: #6c757d;
}
</style>