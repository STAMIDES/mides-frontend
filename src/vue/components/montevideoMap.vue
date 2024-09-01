<template>
  <div class="map-container">
    <div id="map"></div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'Planificaciones',
  setup() {
    onMounted(() => {
      // Initialize the map with new coordinates
      const map = L.map('map').setView([-34.8704884, -56.1401427], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add a marker at the specified location
      L.marker([-34.8704884, -56.1401427]).addTo(map)
        .bindPopup('Specified Location')
        .openPopup();
    });
  }
};
</script>

<style scoped>
.map-container {
  height: 100vh;
  width: 100%;
}

#map {
  height: 100%;
  width: 100%;
}
</style>