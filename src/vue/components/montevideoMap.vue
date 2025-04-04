<template>
  <div class="map-container">
    <div id="map"></div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import homeImg from '../../imgs/map_home.png';
import buildingImg from '../../imgs/map_building.png';
import hospitalImg from '../../imgs/map_hospital.png';

const props = defineProps({
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
});

let map;
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'];

var myIcon = L.Icon.extend({
    options: {
      iconSize:     [10, 20],
      popupAnchor:  [-3, -76]
    }
});
var homeIcon = new myIcon({iconUrl: homeImg});
var buildingIcon = new myIcon({iconUrl: buildingImg});
var hospitalIcon = new myIcon({iconUrl: hospitalImg, iconSize: [30, 50]});

const clearMapLayers = () => {
  if (map) {
    map.eachLayer(layer => {
      if (!layer._url) {  // Don't remove the base tile layer
        map.removeLayer(layer);
      }
    });
  }
};

const addPedidosToMap = () => {
  clearMapLayers();
  
  props.processedPedidos.forEach(pedido => {
    if (props.unselectedPedidosIds.includes(pedido.id)) {
      return;
    }
    const originLatLng = pedido.coords[0];
    const destinationLatLng = pedido.coords[pedido.coords.length - 1];
    if (originLatLng[0] === destinationLatLng[0] && originLatLng[1] === destinationLatLng[1]){
      L.marker(originLatLng)
      .addTo(map)
      .bindPopup(`Origen: ${pedido.direccion_origen_y_horario} \n----- \nDestino: ${pedido.direccion_destino_y_horario}`);
    }else{
      L.marker(originLatLng)
      .addTo(map)
      .bindPopup(`Origen: ${pedido.direccion_origen_y_horario}`);

      L.marker(destinationLatLng)
      .addTo(map)
      .bindPopup(`Destino: ${pedido.direccion_destino_y_horario}`);
    }
    if (pedido.tipo !== 'Ida y vuelta'){
      L.polyline([originLatLng, destinationLatLng], { 
        color: 'blue',
        weight: 3,
        opacity: 0.7 
      }).addTo(map)
        .bindPopup(`Pedido de ${pedido.nombre_y_apellido}`);
    }else{
      let prevLatLng = originLatLng;
      for (let i = 1; i + 1< pedido.coords.length; i += 1) {
        const intermediaLatLng = pedido.coords[i];
        
        L.marker(intermediaLatLng)
        .addTo(map)
        .bindPopup(`Parada intermedia: ${pedido.paradasProcesadas[i]}`);
        
        L.polyline([prevLatLng, intermediaLatLng], { 
          color: 'blue',
          weight: 3,
          opacity: 0.7 
        }).addTo(map)
        .bindPopup(`Pedido de ${pedido.nombre_y_apellido}`);
        prevLatLng = intermediaLatLng;
      }
      L.polyline([prevLatLng, destinationLatLng], { 
          color: 'blue',
          weight: 3,
          opacity: 0.7 
        }).addTo(map)
        .bindPopup(`Pedido de ${pedido.nombre_y_apellido}`);
    }
  });
};

const addPlanificacionToMap = () => {
  clearMapLayers();
  
  if (!props.planificacion.rutas) {
    console.warn('No routes available in planificacion');
    return;
  }

  props.planificacion.rutas.forEach((ruta, index) => {
    const geometryCoordinates = ruta.geometria.map(coord => [coord[1], coord[0]]);
    const color = colors[index % colors.length];

    L.polyline(geometryCoordinates, { 
      color,
      weight: 3,
      opacity: 0.7 
    }).addTo(map);
    let all_coords = {};
    ruta.visitas.forEach(visita => {
      const latLng = [visita.item.latitud, visita.item.longitud];
      
      let icon;

      // Explicit icon selection logic with debug logging
      console.log('Visita tipo:', visita.tipo_item);
      if (visita.tipo_item === 'Lugar común') {
        icon = buildingIcon;
        console.log('Using building icon');
      } else if (visita.tipo_item === 'Parada') {
        if (visita.item?.tipo_parada?.nombre === 'Hospital') {
          icon = hospitalIcon;
          console.log('Using hospital icon');
        } else {
          icon = homeIcon;
          console.log('Using house icon');
        }
      }
      let cliente = visita.item?.pedido?.cliente?.nombre;
      let tipoViaje = visita.item?.pedido?.tipo;
      let msg='';
      if (icon) {  // Only create marker if we have a valid icon
        if (Object.keys(all_coords).indexOf(latLng.toString()) === -1){
          if (cliente){
            
            if (visita.item.posicion_en_pedido===0){
              msg = `${visita.tipo_item}: ${visita.item.direccion}  \nRecoger a ${cliente}:  ${visita.hora_llegada}`;
            }else{
              msg = `${visita.tipo_item}: ${visita.item.direccion}  \nDejar a ${cliente}:  ${visita.hora_llegada}`;
            }
          }else{
            msg = `${visita.tipo_item}: ${visita.item.direccion}  \nLlegada:  ${visita.hora_llegada}`;
          }
          const marker = L.marker(latLng, { icon })
          .addTo(map)
          .bindPopup(msg);
          all_coords[latLng] = marker;
        }else{
          if (cliente){
            if(tipoViaje==="Ida y vuelta" && visita.item.posicion_en_pedido && visita.item.posicion_en_pedido%2===1){
              msg = `\nRecoger a ${cliente}:  ${visita.hora_llegada}`;
            }else{
              msg = `\nDejar a ${cliente}:  ${visita.hora_llegada}`;
            }    
          }else{
            msg = `\nVuelta: ${visita.hora_llegada}`;
          }
          all_coords[latLng].bindPopup( 
          all_coords[latLng].getPopup()._content + msg);
          
        }
      }
    });
  });
};

onMounted(() => {
  map = L.map('map').setView([-34.8704884, -56.1401427], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  if (props.showPedidos && props.processedPedidos) {
    addPedidosToMap();
  } else if (props.planificacion.rutas) {
    addPlanificacionToMap();
  }
});

// Watchers
watch(() => props.processedPedidos, () => {
  if (props.showPedidos) {
    addPedidosToMap();
  }
});

watch(() => props.planificacion, () => {
  if (!props.showPedidos && props.planificacion.rutas) {
    addPlanificacionToMap();
  }
});

watch(() => props.unselectedPedidosIds, addPedidosToMap, { deep: true });
</script>

<style>
.map-container {
  height: 100vh;
  width: 100%;
}

#map {
  height: 100%;
  width: 100%;
}
.leaflet-popup-content-wrapper {  
  white-space: pre;
}
</style>