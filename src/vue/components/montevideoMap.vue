<template>
  <div class="map-container">
    <div id="map"></div>
  </div>
</template>

<script>
import { onMounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'MontevideoMap',
  props: {
    processedPedidos: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    let map;

    const addPedidosToMap = () => {
      // Clear existing layers if any (optional)
      if (map) {
        map.eachLayer(layer => {
          if (!layer._url) {
            map.removeLayer(layer);
          }
        });
      }

      // Add markers and lines for each pedido
      props.processedPedidos.forEach(pedido => {
        const originLatLng = [pedido.latitud_origen, pedido.longitud_origen];
        const destinationLatLng = [pedido.latitud_destino, pedido.longitud_destino];

        // Add origin marker
        L.marker(originLatLng)
          .addTo(map)
          .bindPopup(`Origen: ${pedido.direccion_origen_y_horario}`)
          .openPopup();

        // Add destination marker
        L.marker(destinationLatLng)
          .addTo(map)
          .bindPopup(`Destino: ${pedido.direccion_destino_y_horario}`);

        // Draw a line between origin and destination
        L.polyline([originLatLng, destinationLatLng], { color: 'blue' }).addTo(map).bindPopup(`Pedido de ${pedido.nombre_y_apellido}`);
      });
    };

    onMounted(() => {
      // Initialize the map with new coordinates
      map = L.map('map').setView([-34.8704884, -56.1401427], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add the pedidos to the map
      addPedidosToMap();
    });

    watch(() => props.processedPedidos, addPedidosToMap);

    return {};
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
