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
              <div v-for="(turno, index) in turnos" :key="index" class="turno" :class="getTurnoClass(index)">
                <div class="turno-header"> 
                <h3>Turno {{ index + 1 }}</h3>
                  <div v-if="turnos.length > 2">
                    <button 
                        class="delete-turno-btn"
                        @click="removeTurno(index)"
                      >
                        ×
                      </button>
                  </div>
                  </div>
                <div class="time-inputs">
                  <input 
                    type="time" 
                    v-model="turno.start"
                    class="time-input"
                    @change="updateTurno(index)"
                  />
                  <span>-</span>
                  <input 
                    type="time" 
                    v-model="turno.end"
                    class="time-input"
                    @change="updateTurno(index)"
                  />
                </div>
                <div class="vehicles-grid">
                  <div v-for="vehicle in vehiculos" :key="vehicle.id" class="vehicle-box">
                    <input 
                      type="checkbox" 
                      :id="'turno-' + index + '-' + vehicle.id"
                      :checked="isTurnoVehicleSelected(index, vehicle.id)"
                      @change="toggleSelectionVehiculo(index, vehicle.id)"
                    />
                    <label :for="'turno-' + index + '-' + vehicle.id" class="truncate">{{ vehicle.descripcion }}</label>
                    <label :for="'turno-' + index + '-' + vehicle.id">{{ vehicle.matricula }}</label>
                    <template v-if="isTurnoVehicleSelected(index, vehicle.id)">
                      <select
                        @change="selectLugarComun(index, vehicle.id, $event.target.value)">
                        <option value="">Lugar de salida</option>
                        <option v-for="lugar in lugaresComunes" :key="lugar.id" :value="lugar.id" :selected="turnos[index].vehicles.some(v => parseInt(v.lugares_comunes_id) === lugar.id)">
                          {{ lugar.nombre }}
                        </option>
                      </select>
                      <select
                        @change="selectChofer(index, vehicle.id, $event.target.value)">
                        <option value="">Chofer</option>
                        <option v-for="chofer in choferes" :key="chofer.id" :value="chofer.id" :selected="turnos[index].vehicles.some(v => parseInt(v.chofer_id) === chofer.id)">
                          {{ chofer.nombre }}
                        </option>
                      </select>
                    </template>
                  </div>
                </div>
              </div>
              <button class="add-turno-btn" @click="addTurno">
                <span class="plus-icon">+</span>
                Agregar turno
              </button>
            </div>
          <div v-if="errorPlanificacion" class="error-planificacion">
            {{ errorPlanificacion }}
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
import { ref, watch, onMounted } from 'vue';
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
    },
    errorPlanificacion: {
      type: String,
      required: false
    } 
  },
  emits: ['date-changed', 'planificar', 'checkbox-change-pedidos', 'selected-turnos'],
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

    const turnos = ref([
      { start: '08:00', end: '12:00', vehicles: [] },
      { start: '12:00', end: '23:00', vehicles: [] }
    ]);

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

    const addTurno = () => {
      const lastTurno = turnos.value[turnos.value.length - 1];
      const newStart = lastTurno.end;
      const endHour = parseInt(newStart.split(':')[0]) + 6;
      const newEnd = `${endHour.toString().padStart(2, '0')}:00`;
      turnos.value.push({ start: newStart, end: newEnd, vehicles: [] });
      emit('selected-turnos', turnos);
    };  
    const removeTurno = (index) => {
      turnos.value.splice(index, 1);
      emit('selected-turnos', turnos);
    };

    const updateTurno = (index) => {
      // Ensure the changes are reflected in the parent component
      emit('selected-turnos', turnos);
    };

    const getTurnoClass = (index) => {
      const classes = ['turno-custom'];
      return [...classes, `turno-${index}`];
    };

    const isTurnoVehicleSelected = (turnoIndex, vehicleId) => {
      return turnos.value[turnoIndex].vehicles.some(v => v.vehicle_id === vehicleId);
    };

    const toggleSelectionVehiculo = (turnoIndex, vehicleId) => {
      const turno = turnos.value[turnoIndex];
      const index = turno.vehicles.findIndex(v => v.vehicle_id === vehicleId);
      
      if (index === -1) {
        turno.vehicles.push({ vehicle_id: vehicleId, lugares_comunes_id: null, chofer_id: null });
      } else {
        turno.vehicles.splice(index, 1);
      }
      
      emit('selected-turnos', turnos);
    };

    const selectLugarComun = (turnoIndex, vehicleId, lugarComunId) => {
      const turno = turnos.value[turnoIndex];
      const index = turno.vehicles.findIndex(v => v.vehicle_id === vehicleId);
      if (index !== -1) {
        turno.vehicles[index].lugares_comunes_id = lugarComunId;
        emit('selected-turnos', turnos.value);
      }
    };

    const selectChofer = (turnoIndex, vehicleId, choferId) => {
      const turno = turnos.value[turnoIndex];
      const index = turno.vehicles.findIndex(v => v.vehicle_id === vehicleId);
      if (index !== -1) {
        turno.vehicles[index].chofer_id = choferId;
        emit('selected-turnos', turnos.value);
      }
    };

    const planificar = async () => {
      const allEmpty = turnos.value.every(t => t.vehicles.length === 0);
      if (allEmpty){
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
    watch(() => props.errorPlanificacion, (newValue) => {
      if (newValue !== null) {
        isPlanificando.value = false;
      }
    });
    onMounted(() => {
      const selectedTurnos = JSON.parse(localStorage.getItem('selectedTurnos'));
      if (selectedTurnos) {
        console.log('local storage selectedTurnos', selectedTurnos);
        turnos.value = selectedTurnos;
        emit('selected-turnos', selectedTurnos);
      }
    });
    console.log(selectedVehicles.value);
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
      turnos,
      addTurno,
      removeTurno,
      updateTurno,
      getTurnoClass,
      isTurnoVehicleSelected,
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
  white-space: wrap;
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


.turno-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100px;
}

.delete-turno-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
}

.add-turno-btn {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.plus-icon {
  font-size: 20px;
  font-weight: bold;
}

.turno-custom {
  border: 1px solid #ddd;
  margin-bottom: 15px;
}

/* Generate different background colors for each shift */
.turno-0 { background-color: #ffedcc; }
.turno-1 { background-color: #e6f2ff; }
.turno-2 { background-color: #f0e6ff; }
.turno-3 { background-color: #e6ffe6; }
.turno-4 { background-color: #ffe6e6; }
</style>