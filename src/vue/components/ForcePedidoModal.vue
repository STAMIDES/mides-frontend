<template>
  <div class="modal-overlay" v-if="show" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Forzar Pedido #{{ pedido?.id }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-content">
        <div v-if="!pedido" class="loading">Cargando...</div>
        <div v-else>
          <div class="pedido-info">
            <div class="info-section">
              <h3>Detalles del Pedido</h3>
              <p><strong>Cliente:</strong> {{ pedido.nombre_y_apellido }}</p>
              <div class="characteristics-container">
                <span v-for="(caracteristica, index) in pedido.caracteristicas" :key="index" 
                      class="characteristic-badge">
                  {{ caracteristica.nombre }}
                </span>
              </div>
            </div>
          </div>

          <div class="paradas-mapping">
            <h3>Asignar paradas a rutas</h3>
            <p class="instruction-text">Selecciona dónde insertar cada parada en las rutas existentes</p>

            <div v-for="(parada, index) in pedido.paradasProcesadas" :key="index" class="parada-item">
              <div class="parada-header">
                <div class="parada-number">{{ index + 1 }}</div>
                <div class="parada-details">
                  <h4>{{ getParadaTitle(index, pedido.paradasProcesadas.length) }}</h4>
                  <p>{{ parada }}</p>
                </div>
              </div>

              <div class="assignment-controls">
                <div class="select-group">
                  <label>Ruta:</label>
                  <select v-model="paradaAssignments[index].rutaId">
                    <option v-for="ruta in planificacion.rutas" :key="ruta.id_vehiculo" :value="ruta.id_vehiculo">
                      {{ getRutaLabel(ruta) }}
                    </option>
                  </select>
                </div>
                
                <div class="select-group">
                  <label>Posición:</label>
                  <select v-model="paradaAssignments[index].position" 
                          :disabled="!paradaAssignments[index].rutaId">
                    <option v-for="position in getPositionOptions(paradaAssignments[index].rutaId)" 
                            :key="position.index" :value="position.index">
                      {{ position.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="error-message" v-if="error">
            {{ error }}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-button" @click="closeModal">Cancelar</button>
        <button class="confirm-button" @click="confirmForceAdd" 
                :disabled="!isFormValid">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'ForcePedidoModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    pedido: {
      type: Object,
      default: null
    },
    planificacion: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'force-add'],
  setup(props, { emit }) {
    const paradaAssignments = ref([]);
    const error = ref('');

    // Reset assignments whenever the pedido changes
    watch(() => props.pedido, (newPedido) => {
      if (newPedido && newPedido.paradasProcesadas) {
        paradaAssignments.value = newPedido.paradasProcesadas.map(() => ({
          rutaId: '',
          position: 0
        }));
      }
    });

    const closeModal = () => {
      emit('close');
    };

    const getParadaTitle = (index, totalParadas) => {
      if (totalParadas <= 2) {
        return index === 0 ? 'Origen' : 'Destino';
      } else {
        if (index === 0) return 'Origen';
        if (index === totalParadas - 1) return 'Destino';
        return `Parada Intermedia ${index}`;
      }
    };

    const getRutaLabel = (ruta) => {
      const vehiculo = ruta.vehiculo || { matricula: 'Desconocido', descripcion: '' };
      return `${vehiculo.matricula} - ${vehiculo.descripcion} (${ruta.hora_inicio.substring(0, 5)} - ${ruta.hora_fin.substring(0, 5)})`;
    };

    const getPositionOptions = (rutaId) => {
      if (!rutaId || !props.planificacion.rutas) return [];
      
      const ruta = props.planificacion.rutas.find(r => r.id_vehiculo === rutaId);
      if (!ruta) return [];
      
      // Create position options for the selected route
      // +1 for the option to add at the end
      const options = [];
      
      ruta.visitas.forEach((visita, index) => {
        options.push({
          index: index,
          label: `Antes de: ${visita.direccion} (${visita.hora_llegada.substring(0, 5)})`
        });
      });
      
      // Option to add at the end
      options.push({
        index: ruta.visitas.length,
        label: 'Al final de la ruta'
      });
      
      return options;
    };

    const isFormValid = computed(() => {
      if (!props.pedido || !props.pedido.paradasProcesadas) return false;
      
      // Check if all paradas have a route and position assigned
      return paradaAssignments.value.every(assignment => 
        assignment.rutaId !== '' && assignment.position !== null
      );
    });

    const confirmForceAdd = () => {
      if (!isFormValid.value) {
        error.value = 'Por favor, asigna todas las paradas a una ruta y posición.';
        return;
      }

      // Prepare data for forcing the pedido into the planification
      const forceData = {
        pedido_id: props.pedido.id,
        asignaciones: paradaAssignments.value.map((assignment, index) => ({
            id_ruta: assignment.rutaId,
            posicion_en_planificacion: assignment.position,
            posicion_en_pedido: index
        }))
      };

      emit('force-add', forceData);
    };

    return {
      paradaAssignments,
      error,
      closeModal,
      getParadaTitle,
      getRutaLabel,
      getPositionOptions,
      isFormValid,
      confirmForceAdd
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  max-height: 60vh;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #64748b;
  font-size: 1.2rem;
}

.pedido-info {
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 20px;
}

.info-section {
  margin-bottom: 16px;
}

.info-section h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #334155;
  font-size: 1.2rem;
}

.info-section p {
  margin: 8px 0;
  color: #475569;
}

.characteristics-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.characteristic-badge {
  background-color: #e2e8f0;
  color: #334155;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.paradas-mapping {
  margin-bottom: 24px;
}

.paradas-mapping h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #334155;
  font-size: 1.2rem;
}

.instruction-text {
  color: #64748b;
  margin-bottom: 16px;
  font-size: 0.9rem;
}

.parada-item {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f8fafc;
  transition: box-shadow 0.2s;
}

.parada-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.parada-header {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.parada-number {
  background-color: #3b82f6;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.parada-details {
  flex: 1;
}

.parada-details h4 {
  margin: 0 0 8px 0;
  color: #1e293b;
}

.parada-details p {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
  white-space: pre-line;
}

.assignment-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.select-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 180px;
}

.select-group label {
  margin-bottom: 6px;
  color: #64748b;
  font-size: 0.9rem;
}

.select-group select {
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  color: #1e293b;
  font-size: 0.95rem;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.select-group select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  outline: none;
}

.select-group select:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  background-color: #fef2f2;
  padding: 12px;
  border-radius: 6px;
  margin-top: 16px;
  font-size: 0.95rem;
  border-left: 3px solid #ef4444;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-button, .confirm-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.cancel-button:hover {
  background-color: #e2e8f0;
}

.confirm-button {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.confirm-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.confirm-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}
</style>
