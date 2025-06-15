<template>
  <div class="sidebar" :class="{ 'sidebar-hidden': isHidden }">
    <button class="toggle-btn" @click="toggleSidebar" aria-label="Toggle sidebar">
      <i class="toggle-icon" :class="isHidden ? 'icon-chevron-left' : 'icon-chevron-right'"></i>
    </button>
    <div class="sidebar-content">
      <div class="button-group">
        <div v-if="Object.keys(planificacion).length > 0" >
          <button class="btn" @click="fetchPedidos()">
            Crear nueva planificación
          </button>
          <div class="planification-results">
            <div class="planification-header">
              <div>
                <h3 style="margin:0">
                  Detalles de Planificación {{ planificacion.id }}
                </h3>
                <p>
                  {{ formatDate2(planificacion.fecha) }}
                </p>
              </div>
              <button 
                class="btn download-btn" 
                @click="downloadPlanificacionPDF" 
                :disabled="isDownloadingPDF"
              >
                <span v-if="isDownloadingPDF" class="spinner-small"></span>
                <i v-else class="icon-download"></i>
                {{ isDownloadingPDF ? 'Generando PDF...' : 'Descargar PDF' }}
              </button>
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
                  <template v-for="(item) in getProcessedVisitas(ruta)" :key="item.unique_key">
                    <div v-if="item.type === 'visita'" class="visita-row">
                      <div class="visita-time">{{ formatTime(item.hora_calculada_de_llegada) }}</div>
                      <div class="visita-status-wrapper" :class="getStatusClass(item.estado)">
                        <div class="visita-status-circle" :class="getStatusClass(item.estado)"></div>
                      </div>
                      <div class="visita-address">
                        <span v-if="item.tipo_item === 'Lugar común'">
                          Lugar Comun: {{ item.item.nombre }}
                        </span>
                        <span v-else>
                          {{ item.item.direccion }}
                        </span>
                      </div>
                    </div>
                    <div v-else-if="item.type === 'descanso'" class="visita-row descanso-row">
                      <div class="descanso-time-container">
                        <div class="visita-time">{{ formatTime(item.inicio) }}</div>
                        <div class="visita-time descanso-end-time">{{ formatTime(item.fin) }}</div>
                      </div>
                      <div class="visita-status-wrapper descanso-status-wrapper">
                        <div class="visita-status-circle descanso-status-circle">
                          ☕
                        </div>
                      </div>
                      <div class="visita-address descanso-details">
                        <strong>Descanso Programado</strong>
                      </div>
                    </div>
                  </template>
                </div>
            </div>
          </div>

            <div v-if="planificacion.pedidos_no_atendidos && planificacion.pedidos_no_atendidos.length > 0" class="unattended-pedidos">
              <h3 class="unattended-title">Solicitudes no atendidas</h3>
              <div class="unattended-list">
                <table class="pedidos-table unattended-table">
                  <thead>
                    <tr>
                      <th style="width: 4%;">Pedido ID</th>
                      <th style="width: 19%;">Origen y Horario</th>
                      <th style="width: 29%;">Paradas Intermedias</th>
                      <th style="width: 19%;">Destino y Horario</th>
                      <th style="width: 10%; text-align: center;">Motivo</th>
                      <th style="width: 10%; text-align: center;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(pedido, index) in planificacion.pedidos_no_atendidos"
                      :key="index"
                      class="unattended-row"
                    >
                      <td>{{ pedido.id }}</td>
                      <td class="td-wrapper" v-html="pedido.direccion_origen_y_horario">
                      </td>
                      <td class="td-wrapper" v-html="pedido.paradas_intermedias">
                      </td>
                      <td class="td-wrapper" v-html="pedido.direccion_destino_y_horario">
                      </td>
                      <td class="td-wrapper icon-cell" style="text-align: center;">
                        <span v-if="pedido.no_enviado_al_optimizador" title="No enviado al optimizador">👤</span>
                        <span v-else title="Descartado por optimizador">🤖</span>
                      </td>
                      <td class="caracteristicas-cell" style="text-align: center;">
                        <span v-if="pedido.caracteristicas.some(c => c.nombre === 'silla_de_ruedas')" title="Requiere silla de ruedas">🦽</span>
                        <span v-if="pedido.caracteristicas.some(c => c.nombre === 'rampa_electrica')" title="Requiere rampa eléctrica">🔧</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-if="downloadError" class="error-download">
              {{ downloadError }}
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
              <table class="pedidos-table pedidos-for-the-day">
                <thead>
                  <tr>
                    <th></th>
                    <th>Usuario</th>
                    <th>Pedido id</th>
                    <th>Origen y Horario</th>
                    <th>Paradas Intermedias</th>
                    <th>Destino y Horario</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody style="font-size: 9px;">
                  <tr
                    v-for="(pedido, index) in processedPedidos"
                    :key="index"
                    :style="{ backgroundColor: getRowBackgroundColor(pedido.id) }"
                    @mouseover="handleRowHover(pedido.id)"
                    @mouseout="handleRowHover(null)"
                    :class="{ 'row-highlight': hoveredPedidoId === pedido.id }"
                    :data-pedido-id="pedido.id"
                  >
                    <td>
                      <input 
                        type="checkbox" 
                        :checked="!unselectedPedidos.includes(pedido.id)" 
                        @change="toggleSelectionPedido(pedido.id)" 
                      />
                    </td>
                    <td>{{ pedido.nombre_y_apellido }}</td>
                    <td>{{ pedido.id }}</td>
                    <td class="td-wrapper" v-html="pedido.direccion_origen_y_horario">
                    </td>
                    <td class="td-wrapper" v-html="pedido.paradas_intermedias">
                    </td>
                    <td class="td-wrapper" v-html="pedido.direccion_destino_y_horario">
                    </td>
                    <td>
                      <!-- Add icons for silla_de_ruedas and rampa_electrica -->
                      <span v-if="pedido.caracteristicas.some(c => c.nombre === 'silla_de_ruedas')" title="Requiere silla de ruedas">🦽</span>
                      <span v-if="pedido.caracteristicas.some(c => c.nombre === 'rampa_electrica')" title="Requiere rampa eléctrica">🔧</span>
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
                    <div>
                      <span title="Contiene rampa eléctrica" v-if="vehicle.caracteristicas.some(c => c.nombre === 'rampa_electrica')">🔧</span>
                      <span title="# Capacidad de silla de ruedas" v-if="vehicle.capacidad_silla_de_ruedas"> {{ vehicle.capacidad_silla_de_ruedas }} 🦽</span>
                    </div>
                      <template v-if="isTurnoVehicleSelected(index, vehicle.id)">
                      <select
                        @change="selectLugarComunStart(index, vehicle.id, $event.target.value)">
                        <option value="">Lugar de salida</option>
                        <option 
                          v-for="lugar in lugaresComunes" 
                          :key="lugar.id" 
                          :value="lugar.id"
                          :selected="turnos[index].vehicles?.some(tv => tv.vehicle_id === vehicle.id && parseInt(tv.lugar_comun_start_id) === lugar.id)"
                        >
                          {{ lugar.nombre }}
                        </option>
                      </select>
                      <select
                        @change="selectLugarComunEnd(index, vehicle.id, $event.target.value)">
                        <option value="">Lugar de llegada</option>
                        <option 
                          v-for="lugar in lugaresComunes" 
                          :key="lugar.id" 
                          :value="lugar.id"
                          :selected="turnos[index].vehicles?.some(tv => tv.vehicle_id === vehicle.id && parseInt(tv.lugar_comun_end_id) === lugar.id)"
                        >
                          {{ lugar.nombre }}
                        </option>
                      </select>
                      <select
                        @change="selectChofer(index, vehicle.id, $event.target.value)">
                        <option value="">Chofer</option>
                        <option 
                        v-for="chofer in choferes" 
                        :key="chofer.id" 
                        :value="chofer.id" 
                        :selected="turnos[index].vehicles?.find(tv=> tv.vehicle_id === vehicle.id && tv.chofer_id === chofer.id)">
                          {{ chofer.nombre }}
                        </option>
                      </select>
                      <div class="checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          :id="'descanso-' + index + '-' + vehicle.id"
                          :checked="getTurnoVehicleDescanso(index, vehicle.id)"
                          @change="toggleDescanso(index, vehicle.id, $event.target.checked)"
                        />
                        <label :for="'descanso-' + index + '-' + vehicle.id">Con descanso</label>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
              <button class="add-turno-btn" @click="addTurno">
                <span class="plus-icon">+</span>
                Agregar turno
              </button>
            </div>
          <div v-if="estadoError" class="error-planificacion">
            {{ estadoError }}
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
    },
    estadoError: {
    },
    hoveredPedidoId: {
      type: Number,
      default: null
    },
    hoverOrigin: {
      type: String,
      default: null
    },
    downloadPlanificacionPDF: {
      type: Function,
      required: true
    }
  },
  emits: ['date-changed', 'planificar', 'checkbox-change-pedidos', 'selected-turnos', 'row-hover'],
  setup(props, { emit }) {
    const isHidden = ref(false);
    const activeButton = ref('Pedidos');
    const date = ref(props.selectedDate);
    const unselectedPedidos = ref([]);
    const isPlanificando = ref(false);
    const isDownloadingPDF = ref(false);
    const downloadError = ref(null);

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
      emit('selected-turnos', turnos.value);
    };  
    const removeTurno = (index) => {
      turnos.value.splice(index, 1);
      emit('selected-turnos', turnos.value);
    };

    const updateTurno = (index) => {
      // Ensure the changes are reflected in the parent component
      emit('selected-turnos', turnos.value);
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
        turno.vehicles.push({ 
          vehicle_id: vehicleId, 
          con_descanso: true,
          lugar_comun_start_id: null, 
          lugar_comun_end_id: null, 
          chofer_id: null, 
          vehicleIdWithTurnoIndex: `${vehicleId}${turnoIndex}` 
        });
      } else {
        turno.vehicles.splice(index, 1);
      }
      
      emit('selected-turnos', turnos.value);
    };

    const selectLugarComunStart = (turnoIndex, vehicleId, lugarComunId) => {
      const turno = turnos.value[turnoIndex];
      const index = turno.vehicles.findIndex(v => v.vehicle_id === vehicleId);
      if (index !== -1) {
        turno.vehicles[index].lugar_comun_start_id = parseInt(lugarComunId);
        emit('selected-turnos', turnos.value);
      }
    };

    const selectLugarComunEnd = (turnoIndex, vehicleId, lugarComunId) => {
      const turno = turnos.value[turnoIndex];
      const index = turno.vehicles.findIndex(v => v.vehicle_id === vehicleId);
      if (index !== -1) {
        turno.vehicles[index].lugar_comun_end_id = parseInt(lugarComunId);
        emit('selected-turnos', turnos.value);
      }
    }; 
    
    const selectChofer = (turnoIndex, vehicleId, choferId) => {
      const turno = turnos.value[turnoIndex];
      const index = turno.vehicles.findIndex(v => v.vehicle_id === vehicleId);
      if (index !== -1) {
        turno.vehicles[index].chofer_id = parseInt(choferId);
        emit('selected-turnos', turnos.value);
      }
    };


    const getTurnoVehicleDescanso = (turnoIndex, vehicleId) => {
      const vehicle = turnos.value[turnoIndex].vehicles.find(v => v.vehicle_id === vehicleId);
      return vehicle ? vehicle.con_descanso !== false : true; // Default to true if not explicitly set
    };

    const toggleDescanso = (turnoIndex, vehicleId, isChecked) => {
      const turno = turnos.value[turnoIndex];
      const index = turno.vehicles.findIndex(v => v.vehicle_id === vehicleId);
      
      if (index !== -1) {
        turno.vehicles[index].con_descanso = isChecked;
        emit('selected-turnos', turnos.value);
      }
    };

    const planificar = async () => {
      isPlanificando.value = true;
      emit('planificar');
    };

    // Download PDF function using the prop passed from parent
    const downloadPlanificacionPDF = async () => {
      if (!props.planificacion || !props.planificacion.id) {
        downloadError.value = "No hay planificación disponible para descargar.";
        return;
      }

      try {
        isDownloadingPDF.value = true;
        downloadError.value = null;
        await props.downloadPlanificacionPDF();
      } catch (error) {
        downloadError.value = "Error al descargar el PDF. Intente nuevamente.";
        console.error('Error en la descarga del PDF:', error);
      } finally {
        isDownloadingPDF.value = false;
      }
    };

    const handleRowHover = (pedidoId) => {
      emit('row-hover', pedidoId);
    };

    const getRowBackgroundColor = (id) => {
      if (id === props.hoveredPedidoId) {
        return '#fff59d'; // Light yellow highlight
      }
      const baseLightness = 60;
      const variance = (id % 30) - 10;
      const lightness = baseLightness + variance;
      return `hsl(220, 15%, ${lightness}%)`;
    };

    // Scroll the table to the hovered pedido ONLY when hover originated from map
    watch(() => props.hoveredPedidoId, (newId) => {
      if (newId && props.hoverOrigin === 'map') {
        setTimeout(() => {
          const element = document.querySelector(`tr[data-pedido-id="${newId}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300); // Reduced from 500ms to 300ms for more responsive feeling
      }
    });

    watch(() => props.planificacion, (newValue) => {
      if (newValue !== null) {
        console.log(newValue);
        isPlanificando.value = false;
        downloadError.value = null; // Clear download error when planificacion changes
      }
    });
    watch(() => props.errorPlanificacion, (newValue) => {
      isPlanificando.value = false;
    });

    onMounted(() => {
      const selectedTurnos = JSON.parse(localStorage.getItem('selectedTurnos'));
      if (selectedTurnos) {
        console.log('local storage selectedTurnos', selectedTurnos);
        turnos.value = selectedTurnos;
        emit('selected-turnos', selectedTurnos);
      }
    });
    const getProcessedVisitas = (ruta) => {
      const processedItems = [];
      let keyCounter = 0; 

      if (ruta.visitas) {
        ruta.visitas.forEach(v => {
          processedItems.push({ 
            ...v, 
            type: 'visita', 
            sortTime: v.hora_calculada_de_llegada,
            unique_key: `visita_${v.id !== undefined ? v.id : keyCounter++}_${v.item?.id || keyCounter++}` 
          });
        });
      }

      if (ruta.descanso_inicio && ruta.descanso_fin) {
        processedItems.push({ 
          type: 'descanso', 
          inicio: ruta.descanso_inicio, 
          fin: ruta.descanso_fin, 
          sortTime: ruta.descanso_inicio,
          unique_key: `descanso_${ruta.id !== undefined ? ruta.id : keyCounter++}_${ruta.descanso_inicio}`
        });
      }

      processedItems.sort((a, b) => {
        if (a.sortTime < b.sortTime) return -1;
        if (a.sortTime > b.sortTime) return 1;
        // If times are equal, ensure 'visita' comes before 'descanso' if one is a start/end point
        // This specific sorting might need adjustment based on exact business logic for ties
        if (a.type === 'visita' && b.type === 'descanso') return -1;
        if (a.type === 'descanso' && b.type === 'visita') return 1;
        return 0;
      });
      
      return processedItems;
    };

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
      selectLugarComunStart,
      selectLugarComunEnd,
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
      getStatusClass,
      getProcessedVisitas,
      handleRowHover,
      getRowBackgroundColor,
      downloadPlanificacionPDF,
      isDownloadingPDF,
      downloadError,
      getTurnoVehicleDescanso,
      toggleDescanso
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
  width: 450px;
  background-color: #f8fafc;
  box-shadow: -2px 0 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border-left: 1px solid #e2e8f0;
}

.sidebar-hidden {
  transform: translateX(450px);
}

.toggle-btn {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background-color: #f1f5f9;
  transform: translateY(-50%) scale(1.05);
}

.toggle-icon {
  width: 16px;
  height: 16px;
  position: relative;
}

.icon-chevron-left::before,
.icon-chevron-right::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.icon-chevron-left::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='15 18 9 12 15 6'%3E%3C/polyline%3E%3C/svg%3E");
}

.icon-chevron-right::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'%3E%3C/polyline%3E%3C/svg%3E");
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.sidebar-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #f8fafc;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.button-group {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.top-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  gap: 10px;
}

.bottom-button {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn.big {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.btn:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn.active {
  background-color: #1d4ed8;
  font-weight: bold;
}

.btn.save {
  background-color: #10b981;
}

.btn.save:hover {
  background-color: #059669;
}

.pedidos-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow: auto;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.pedidos-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
}

.pedidos-table th,
.pedidos-table td {
  padding: 9px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  width: 20%;
  box-sizing: border-box;
}

/* Add these new styles for checkbox and ID columns */
.pedidos-table th:first-child,
.pedidos-table td:first-child {
  width: 2%;
  padding: 3px;
  text-align: center;
}

.unattended-pedido .pedidos-table th:nth-child(1),
.unattended-pedido .pedidos-table td:nth-child(1),
.pedidos-table.pedidos-for-the-day th:nth-child(2),
.pedidos-table.pedidos-for-the-day td:nth-child(2),
.pedidos-table.pedidos-for-the-day th:nth-child(3),
.pedidos-table.pedidos-for-the-day td:nth-child(3) {
  width: 3%;
  padding: 1px;
  text-align: center;
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  font-size: 1em;
  white-space: nowrap;
}

.pedidos-table th {
  background-color: #f1f5f9;
  font-weight: 600;
  color: #475569;
  position: sticky;
  top: 0;
  z-index: 10;
}

.pedidos-table tr:hover {
  background-color: #f8fafc;
}

.pedidos-table tr:last-child td {
  border-bottom: none;
}

.direccion {
  font-weight: 500;
  margin-bottom: 4px;
  color: #1e293b;
}

.horario {
  font-size: 0.85em;
  color: #64748b;
  margin-bottom: 2px;
  padding-left: 4px;
}

.td-wrapper {
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  max-width: 0;
  min-width: 0;
  font-size: 0.9em;
  color: #475569;
  padding: 6px !important;
}

.turnos-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: #ffffff;
}

.turno {
  padding: 15px;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.turno:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 15px;
}

.vehicle-box {
  background-color: white;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 120px;
  max-width: 200px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.vehicle-box:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.vehicle-box label {
  font-size: 14px;
  text-align: center;
  color: #475569;
}

.vehicle-box input[type="checkbox"] {
  margin: 0;
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
}

.vehicle-box select {
  width: 100%;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #475569;
}

.truncate {
  display: block;
  width: 100%;
  white-space: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
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
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.turno-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.turno-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.1em;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.time-input {
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #1e293b;
  transition: border-color 0.2s ease;
}

.time-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.delete-turno-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.delete-turno-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.add-turno-btn {
  width: 100%;
  padding: 12px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-turno-btn:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.plus-icon {
  font-size: 20px;
  font-weight: bold;
}

.turno-0 { background-color: #f0f9ff; border-left: 4px solid #0284c7; }
.turno-1 { background-color: #f0fdf4; border-left: 4px solid #16a34a; }
.turno-2 { background-color: #fef2f2; border-left: 4px solid #dc2626; }
.turno-3 { background-color: #fffbeb; border-left: 4px solid #d97706; }
.turno-4 { background-color: #f5f3ff; border-left: 4px solid #7c3aed; }

.planification-results {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.rutas-container {
  margin-top: 15px;
  font-size: 0.7em;
}

.ruta-block {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  font-size: 0.9em;
  border: 1px solid #e2e8f0;
}

.ruta-header {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 12px;
  margin-bottom: 15px;
}

.ruta-header h3 {
  margin: 0 0 5px 0;
  color: #1e293b;
}

.visitas-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.visita-row {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  padding: 10px;
  gap: 1rem;
  background-color: white;
  font-size: 0.9em;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.visita-row:hover {
  background-color: #f1f5f9;
}

.visita-time {
  font-weight: 600;
  color: #1e293b;
}

.visita-status-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}

.visita-status-circle {
  position: relative;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  z-index: 1;
  transition: transform 0.2s ease;
}

.visita-row:hover .visita-status-circle {
  transform: scale(1.1);
}

.status-pending.visita-status-circle {
  background-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.status-completed.visita-status-circle {
  background-color: #6b7280; 
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.2); 
}

.visita-status-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
}

.status-pending.visita-status-wrapper::before {
  background-color: #3b82f6;
}

.status-completed.visita-status-wrapper::before {
  background-color: #6b7280;
}

.visita-address {
  color: #475569;
  font-size: 0.95em;
}

.unattended-pedidos {
  margin-top: 24px;
  background-color: #fef2f2;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #fecaca;
}

.unattended-title {
  color: #b91c1c;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  font-weight: 600;
}

.unattended-title:before {
  content: "⚠️";
  margin-right: 8px;
}

.unattended-list {
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.unattended-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.5em;
}
.descanso-row{
  background-color: #f3e6b5; /* Light creamy yellow for rest periods */
}
.descanso-row:hover {
  background-color: #fff5cc; /* Slightly darker on hover */
}
.unattended-table th {
  background-color: #fee2e2;
  color: #991b1b;
  font-weight: 600;
  padding: 5px;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 10;
}

.unattended-table td {
  padding: 5px;
  text-align: left;
  border-bottom: 1px solid #fee2e2;
  word-wrap: break-word;
}

.unattended-table td.icon-cell {
  font-size: 1.2em; /* Slightly larger icons */
}

.unattended-row {
  background-color: #fff;
}

.unattended-row:hover {
  background-color: #fef2f2;
}

/* Date picker styling */
.date-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 16px;
  background-color: white;
  transition: border-color 0.2s ease;
}

.date-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* Error message styling */
.error-planificacion {
  margin-top: 15px;
  padding: 12px;
  background-color: #fef2f2;
  color: #b91c1c;
  border-radius: 6px;
  border-left: 4px solid #dc2626;
  font-size: 0.9em;
}

.row-highlight {
  background-color: #fff59d !important; /* Light yellow */
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  transform: translateZ(0);
  transition: background-color 0.3s ease;
}

.pedidos-table tr {
  transition: background-color 0.3s ease;
}

.pedidos-table tr:hover {
  background-color: #e3f2fd !important; /* Light blue on hover */
}

.planification-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.download-btn {
  background-color: #10b981; /* Green color */
  padding: 8px 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.download-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}
.descanso-status-wrapper.visita-status-wrapper::before { /* Ensure specificity */
  background-color: #fbbf24; /* Amber/Orange for rest line */
}

.descanso-status-circle.visita-status-circle { /* Ensure specificity */
  background-color: #fbbf24; /* Amber/Orange for rest circle */
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.3);
  color: #78350f; /* Dark brown for icon color for contrast */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.descanso-details {
  color: #78350f; /* Dark brown text for rest details */
  font-style: italic;
}
.visita-row.descanso-row .visita-time {
  color: #78350f; /* Match text color */
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  margin-top: 8px;
  gap: 5px;
}

.descanso-time-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.descanso-end-time {
  border-top: 1px dotted #78350f;
}

.descanso-row {
  min-height: 60px;
}
</style>