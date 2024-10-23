<template>
  <div class="map-container">
    <div id="map"></div>
  </div>
</template>

<script>
import { onMounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import homeIcon from '../../imgs/map_home.png';
import building from '../../imgs/map_building.png';

export default {
  name: 'MontevideoMap',
  props: {
    processedPedidos: {
      type: Array,
      required: true
    },
    planificacion: {
      type: Object,
      required: true
    },
    unselectedPedidosIds: {
      type: Array,
      required: true
    },
    showPedidos: {  
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    let map;
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'];
    var houseIcon = L.icon({
          iconUrl: homeIcon,
          iconSize:     [20, 30], // size of the icon
          iconAnchor:   [20, 30], // point of the icon which will correspond to marker's location
      });
    var buildingIcon = L.icon({
          iconUrl: building,
          iconSize:     [20, 30], // size of the icon
          iconAnchor:   [20, 30], // point of the icon which will correspond to marker's location
      });
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
        if (props.unselectedPedidosIds.includes(pedido.id)){
          return;
        }
        // Add origin marker
        L.marker(originLatLng)
          .addTo(map)
          .bindPopup(`Origen: ${pedido.direccion_origen_y_horario}`)
          .openPopup();

        // Add destination marker
        L.marker(destinationLatLng)
          .addTo(map)
          .bindPopup(`Destino: ${pedido.direccion_destino_y_horario}`);

        // Draw a line between origin and destination for each pedido
        L.polyline([originLatLng, destinationLatLng], { color: 'blue' })
            .addTo(map)
            .bindPopup(`Pedido de ${pedido.nombre_y_apellido}`);
        });
    };

    const addPlanificacionToMap = () => {
      // Clear existing layers if any (optional)
      if (map) {
        map.eachLayer(layer => {
          if (!layer._url) {
            map.removeLayer(layer);
          }
        });
      }
      console.log(props.planificacion)
      // Add planificacion geometry to the map
      props.planificacion.rutas.forEach((ruta, index) => {
        const geometryCoordinates = ruta.geometria.map(coord => [coord[1], coord[0]]);
        const color = colors[index % colors.length];

        L.polyline(geometryCoordinates, { color })
          .addTo(map);
        ruta.visitas.map(visita => {
          const latLng = [visita.item.latitud, visita.item.longitud];
          var newIcon= '';
          if (visita.tipo_item === 'Lugar común') {
            newIcon = buildingIcon;
          }else if(visita.tipo_item === 'Parada'){
            newIcon = houseIcon;
          }
            L.marker(latLng, {icon: newIcon})
            .addTo(map)
            .bindPopup(`Pedido: ${visita.item.direccion}`);
        });
      });
    };

    onMounted(() => {
      // Initialize the map with new coordinates
      map = L.map('map').setView([-34.8704884, -56.1401427], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add the pedidos to the map
      if (props.showPedidos && props.processedPedidos){
        console.log(props.showPedidos);
        addPedidosToMap();
      }else if (props.planificacion.rutas){
        addPlanificacionToMap();
      }
    });

    watch(() => props.processedPedidos, 
    () => {
      if (props.showPedidos){
        addPedidosToMap();
      }
    });
    watch(() => props.planificacion, 
    () => {
      if (!props.showPedidos && props.planificacion.rutas){
        console.log(props.planificacion.rutas);
        addPlanificacionToMap();
      }
    });
    watch(() => props.unselectedPedidosIds, addPedidosToMap, { deep: true });

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
