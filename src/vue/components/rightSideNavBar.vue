<template>
  <div class="sidebar" :class="{ 'sidebar-hidden': isHidden }">
    <button class="toggle-btn" @click="toggleSidebar">
      {{ isHidden ? '>' : '<' }}
    </button>
    <div class="sidebar-content">
      <input type="date" :value="selectedDate" @input="handleDateChange" class="date-input">
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
        <div 
          v-for="(pedido, index) in processedPedidos" 
          :key="index" 
          class="pedido-item"
          :style="{ backgroundColor: getPedidoColor(pedido.id, index) }"
        >
          <div>{{ pedido.direccion_origen_y_horario }}</div>
          <div>{{ pedido.direccion_destino_y_horario }}</div>
        </div>
      </div>
        <div class="bottom-button">
          <button class="btn">Planificar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'RightSidebar',
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
  emits: ['date-changed'],
  setup(props, { emit }) {
    const isHidden = ref(false);
    const activeButton = ref('Pedidos');

    const toggleSidebar = () => {
      isHidden.value = !isHidden.value;
    };

    const handleDateChange = (event) => {
      emit('date-changed', event.target.value);
    };

    const setActiveButton = (button) => {
      activeButton.value = button;
    };

    const getPedidoColor = (id, index) => {
      const baseHue = (id * 137.5) % 360; // Using golden angle approximation for color distribution
      const lightness = 70 - (index * 5); // Gradually darken for items with the same ID
      return `hsl(${baseHue}, 70%, ${lightness}%)`;
    };

    return {
      isHidden,
      activeButton,
      toggleSidebar,
      handleDateChange,
      setActiveButton,
      getPedidoColor
    };
  }
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 300px;
  background-color: #f0f0f0;
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar-hidden {
  transform: translateX(300px);
}

.toggle-btn {
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #f0f0f0;
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
  margin-bottom: 20px;
  padding: 10px;
  font-size: 16px;
}

.button-group {
  background-color: #e0e0e0;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.top-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.bottom-button {
  margin-top: 20px;
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

.pedido-item {
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pedido-item div {
  white-space: pre-line;
}
</style>