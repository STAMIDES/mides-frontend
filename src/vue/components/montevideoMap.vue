<template>
  <div class="map-container">
    <div id="map"></div>
    <div class="map-legend" v-if="showLegend">
      <h3>Mapa de Referencias</h3>
      <div v-if="showPedidos">
        <div class="legend-item">
          <div class="line-sample dashed"></div>
          <span>Conexión solicitada</span>
        </div>
      </div>
      <div v-else>
        <div class="legend-item" v-for="(color, index) in colors.slice(0, routesCount)" :key="index">
          <div class="line-sample" :style="{ backgroundColor: color }"></div>
          <span>Ruta {{ index + 1 }}</span>
        </div>
      </div>
      <div class="legend-item">
        <span>🦽 Silla de ruedas</span>
      </div>
      <div class="legend-item">
        <span>🔧 Rampa eléctrica</span>
      </div>
      <button @click="showLegend = false" class="close-legend">×</button>
    </div>
    <button @click="showLegend = true" class="toggle-legend" v-if="!showLegend">
      <span>📋</span>
    </button>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, defineEmits, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import homeImg from '../../imgs/map_home.png';
import buildingImg from '../../imgs/map_building.png';
import hospitalImg from '../../imgs/map_hospital.png';
import 'leaflet-arrowheads';

const emit = defineEmits(['marker-hover']);

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
  },
  hoveredPedidoId: {
    type: Number,
    default: null
  },
  hoverOrigin: {
    type: String,
    default: null
  }
});

let map;
const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E44AD', '#F39C12'];
const showLegend = ref(true);
const routesCount = ref(0);
const markers = ref({}); // Store markers by pedido ID
const polylines = ref({}); // Store polylines by pedido ID

var myIcon = L.Icon.extend({
    options: {
      iconSize: [14, 24],
      iconAnchor: [7, 24],
      popupAnchor: [0, -24],
      className: 'custom-marker'
    }
});

var homeIcon = new myIcon({
  iconUrl: homeImg,
});
var destinationIcon = new myIcon({
  iconUrl: homeImg,
});
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

const createPopupContent = (title, details, icons, pedidoId) => {
  return `
    <div class="custom-popup" data-pedido-id="${pedidoId || ''}">
      <div class="popup-header">${title}</div>
      <div class="popup-content">${details}</div>
      <div class="hidden-placeholder"></div>
      <div class="popup-icons">${icons}</div>
    </div>
  `;
};

const addPedidosToMap = () => {
  clearMapLayers();
  markers.value = {}; // Reset markers
  polylines.value = {}; // Reset polylines
  
  const bounds = [];
  
  props.processedPedidos.forEach(pedido => {
    if (props.unselectedPedidosIds.includes(pedido.id)) {
      return;
    }
    
    // Add the icons for wheelchair and ramp
    let sillaIcon = pedido.caracteristicas?.some(c => c.nombre === 'silla_de_ruedas') ? '🦽' : '';
    let rampaIcon = pedido.caracteristicas?.some(c => c.nombre === 'rampa_electrica') ? '🔧' : '';
    let iconsSuffix = `${sillaIcon} ${rampaIcon}`;
    
    const originLatLng = pedido.coords[0];
    const destinationLatLng = pedido.coords[pedido.coords.length - 1];
    
    bounds.push(originLatLng);
    bounds.push(destinationLatLng);
    
    // Initialize arrays for this pedido
    if (!markers.value[pedido.id]) {
      markers.value[pedido.id] = [];
    }
    if (!polylines.value[pedido.id]) {
      polylines.value[pedido.id] = [];
    }
    
    if (originLatLng[0] === destinationLatLng[0] && originLatLng[1] === destinationLatLng[1]){
      // Same location for origin and destination
      const popupContent = createPopupContent(
        `Pedido de ${pedido.nombre_y_apellido}`,
        `<b>Origen:</b> ${pedido.direccion_origen_y_horario}<br/>
         <b>Destino:</b> ${pedido.direccion_destino_y_horario}`,
        iconsSuffix,
        pedido.id
      );
      
      const marker = L.marker(originLatLng, {
        icon: homeIcon,
        pedidoId: pedido.id,
        className: 'map-element pedido-marker'
      })
      .addTo(map)
      .bindPopup(popupContent);
      
      marker.on('mouseover', () => {
        emit('marker-hover', pedido.id);
      });
      
      marker.on('mouseout', () => {
        emit('marker-hover', null);
      });
      
      markers.value[pedido.id].push(marker);
      
    } else {
      // Different locations for origin and destination
      const originPopup = createPopupContent(
        'Punto de Origen', 
        `<b>Dirección:</b> ${pedido.direccion_origen_y_horario}<br/>
         <b>Usuario:</b> ${pedido.nombre_y_apellido}`,
        iconsSuffix,
        pedido.id
      );
      
      const destPopup = createPopupContent(
        'Punto de Destino', 
        `<b>Dirección:</b> ${pedido.direccion_destino_y_horario}<br/>
         <b>Usuario:</b> ${pedido.nombre_y_apellido}`,
        iconsSuffix,
        pedido.id
      );

      const originMarker = L.marker(originLatLng, {
        icon: homeIcon,
        pedidoId: pedido.id,
        className: 'map-element pedido-marker'
      })
      .addTo(map)
      .bindPopup(originPopup);
      
      originMarker.on('mouseover', () => {
        emit('marker-hover', pedido.id);
      });
      
      originMarker.on('mouseout', () => {
        emit('marker-hover', null);
      });
      
      const destMarker = L.marker(destinationLatLng, {
        icon: destinationIcon,
        pedidoId: pedido.id,
        className: 'map-element pedido-marker'
      })
      .addTo(map)
      .bindPopup(destPopup);
      
      destMarker.on('mouseover', () => {
        emit('marker-hover', pedido.id);
      });
      
      destMarker.on('mouseout', () => {
        emit('marker-hover', null);
      });
      
      markers.value[pedido.id].push(originMarker, destMarker);
    }
    
    // Create polylines and store them
    var cantidad_tramos = 0;
    if (pedido.tipo !== 'Ida y vuelta'){
      const polyline = L.polyline([originLatLng, destinationLatLng], { 
        color: '#3388ff',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 10',
        className: 'map-element pedido-polyline',
        arrowheads: { 
          fill: true,
          frequency: 'endonly',
          size: '12px'
        }
      }).addTo(map)
        .bindPopup(createPopupContent(
          `Pedido de ${pedido.nombre_y_apellido}`,
          `<b>Origen:</b> ${pedido.direccion_origen_y_horario}<br/>
           <b>Destino:</b> ${pedido.direccion_destino_y_horario}`,
          iconsSuffix
        ));
      
      polylines.value[pedido.id].push(polyline);
    } else {
      // For "Ida y vuelta" pedidos with intermediate stops
      let prevLatLng = originLatLng;
      cantidad_tramos = pedido.coords.length - 1;
      for (let i = 1; i + 1 < pedido.coords.length; i += 1) {
        const intermediaLatLng = pedido.coords[i];
        bounds.push(intermediaLatLng);
          
        const stopPopup = createPopupContent(
          'Parada Intermedia', 
          `<b>Dirección</b>: ${pedido.paradasProcesadas[i]}
           <b>Usuario</b>: ${pedido.nombre_y_apellido}`,
          iconsSuffix
        );
        
        let intermediaMarker = L.marker(intermediaLatLng, {
          icon: homeIcon,
          pedidoId: pedido.id,
          className: 'map-element pedido-marker'
        })
        .addTo(map)
        .bindPopup(stopPopup);
        
        intermediaMarker.on('mouseover', () => {
          emit('marker-hover', pedido.id);
        });
        
        intermediaMarker.on('mouseout', () => {
          emit('marker-hover', null);
        });
        
        markers.value[pedido.id].push(intermediaMarker);
          
        const polyline1 = L.polyline([prevLatLng, intermediaLatLng], { 
          color: '#3388ff',
          weight: 3,
          opacity: 0.8,
          dashArray: '5, 10',
          className: 'map-element pedido-polyline',
          arrowheads: {
            fill: true,
            frequency: 'endonly',
            size: '12px'
          }
        }).addTo(map)
        .bindPopup(createPopupContent(
          `Pedido de ${pedido.nombre_y_apellido}`,
          `<b>Tramo:</b> ${i} de ${cantidad_tramos}`,
          iconsSuffix
        ));
        
        polylines.value[pedido.id].push(polyline1);
        prevLatLng = intermediaLatLng;
      }
      
      const polyline2 = L.polyline([prevLatLng, destinationLatLng], { 
        color: '#3388ff',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 10',
        className: 'map-element pedido-polyline',
        arrowheads: {
          fill: true,
          frequency: 'endonly',
          size: '12px'
        }
      }).addTo(map)
      .bindPopup(createPopupContent(
        `Pedido de ${pedido.nombre_y_apellido}`,
        `<b>Tramo final:</b> ${cantidad_tramos} de ${cantidad_tramos}`,
        iconsSuffix
      ));
      
      polylines.value[pedido.id].push(polyline2);
    }
  });
  
  // Fit map to bounds if we have points
  if (bounds.length > 0) {
    map.fitBounds(bounds);
  }
};

const addPlanificacionToMap = () => {
  clearMapLayers();
  
  if (!props.planificacion.rutas) {
    console.warn('No routes available in planificacion');
    return;
  }

  const bounds = [];
  routesCount.value = props.planificacion.rutas.length;
  
  props.planificacion.rutas.forEach((ruta, index) => {
    const geometryCoordinates = ruta.geometria.map(coord => [coord[1], coord[0]]);
    geometryCoordinates.forEach(coord => bounds.push(coord));
    
    const color = colors[index % colors.length];

    // Add the route line with arrowheads
    L.polyline(geometryCoordinates, { 
      color,
      weight: 4,
      opacity: 0.8,
      arrowheads: {
        fill: true,
        frequency: '100px',
        size: '12px',
        yawn: 40
      }
    }).addTo(map)
    .bindPopup(createPopupContent(
      `Ruta ${index + 1}`,
      `<b>Vehículo:</b> ${ruta.vehiculo?.matricula || 'No asignado'}<br/>
       <b>Visitas:</b> ${ruta.visitas.length}`,
      ''
    ));
    
    let all_coords = {};
    ruta.visitas.forEach(visita => {
      const latLng = [visita.item.latitud, visita.item.longitud];
      bounds.push(latLng);
      
      let icon;

      // Determine appropriate icon
      if (visita.tipo_item === 'Lugar común') {
        icon = buildingIcon;
      } else if (visita.tipo_item === 'Parada') {
        if (visita.item?.tipo_parada?.nombre === 'Hospital') {
          icon = hospitalIcon;
        } else {
          icon = homeIcon;
        }
      }
      
      let cliente = visita.item?.cliente_nombre;
      let tipoViaje = visita.item?.pedido_tipo;
      let sillaIcon = visita.item?.cliente_caracteristicas?.includes('silla_de_ruedas') ? '🦽' : '';
      let rampaIcon = visita.item?.cliente_caracteristicas?.includes('rampa_electrica') ? '🔧' : '';
      let iconsSuffix = `${sillaIcon} ${rampaIcon}`;
      
      if (icon) {  // Only create marker if we have a valid icon
        let title = '';
        let details = '';
        
        if (Object.keys(all_coords).indexOf(latLng.toString()) === -1) {
          if (cliente) {
            if (visita.item.posicion_en_pedido === 0) {
              title = 'Punto de Recogida';
              details = `<b>Dirección:</b> ${visita.item.direccion}<br/>
                         <b>Usuario:</b> ${cliente}<br/>
                         <b>Hora de llegada:</b> ${visita.hora_calculada_de_llegada}`;
            } else if (tipoViaje ==='Ida y vuelta' && !visita.item.es_destino){
              title = 'Parada Intermedia';
              details = `<b>Dirección:</b> ${visita.item.direccion}<br/>
                         <b>Usuario:</b> ${cliente}<br/>
                         <b>Hora de llegada:</b> ${visita.hora_calculada_de_llegada}`;
            } 
            else {
              title = 'Punto de Entrega';
              details = `<b>Dirección:</b> ${visita.item.direccion}<br/>
                         <b>Usuario:</b> ${cliente}<br/>
                         <b>Hora de llegada:</b> ${visita.hora_calculada_de_llegada}`;
            }
          } else {
            title = visita.tipo_item;
            details = `<b>Dirección:</b> ${visita.item.direccion}<br/>
                       <b>Hora de llegada:</b> ${visita.hora_calculada_de_llegada}`;
          }
          
          const marker = L.marker(latLng, { 
            icon: icon,
          })
            .addTo(map)
            .bindPopup(createPopupContent(title, details, iconsSuffix));
            
          all_coords[latLng] = marker;
        } else {
          // Location already has a marker, append to popup
          if (cliente) {
            if (tipoViaje === "Ida y vuelta" && !visita.item.es_destino) {
              details = `<b>Recoger a:</b> ${cliente}<br/><b>Hora:</b> ${visita.hora_calculada_de_llegada}`;
            } else{
              details = `<b>Dejar a:</b> ${cliente}<br/><b>Hora:</b> ${visita.hora_calculada_de_llegada}`;
            }
          } else {
            details = `<b>Vuelta:</b> ${visita.hora_calculada_de_llegada}`;
          }
          
          // Get existing popup content and add new content
          const existingPopup = all_coords[latLng].getPopup()._content;
          const updatedPopup = existingPopup.replace('<div classs="hidden-placeholder"></div>', 
            `<hr/><div class="popup-content">${details}</div>`);
          
          all_coords[latLng].bindPopup(updatedPopup);
        }
      }
    });
  });
  
  // Fit map to bounds if we have points
  if (bounds.length > 0) {
    map.fitBounds(bounds);
  }
};

onMounted(() => {
  nextTick(() => {
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

watch(() => props.showPedidos, (newVal) => {
  if (newVal) {
    addPedidosToMap();
  } else {
    addPlanificacionToMap();
  }
});

watch(() => props.unselectedPedidosIds, addPedidosToMap, { deep: true });

// Watch for hover state changes from sidebar
watch(() => [props.hoveredPedidoId, props.hoverOrigin], ([newId, origin]) => {
  if (props.showPedidos) {
    // Reset all elements to default style and show them
    Object.keys(markers.value).forEach(pedidoId => {
      markers.value[pedidoId].forEach(marker => {
        const element = marker.getElement();
        if (element) {
          element.classList.remove('marker-highlight', 'marker-hidden');
          element.style.opacity = '1';
        }
        marker.setZIndexOffset(0);
        if (origin === 'map') {
          marker.closePopup();
        }
      });
    });
    
    Object.keys(polylines.value).forEach(pedidoId => {
      polylines.value[pedidoId].forEach(polyline => {
        const element = polyline.getElement();
        if (element) {
          element.classList.remove('polyline-highlight', 'polyline-hidden');
          element.style.opacity = '0.8';
        }
      });
    });
    
    // If hovering over a specific pedido, hide others and highlight the selected one
    if (newId) {
      // Hide all other elements
      Object.keys(markers.value).forEach(pedidoId => {
        if (parseInt(pedidoId) !== newId) {
          markers.value[pedidoId].forEach(marker => {
            const element = marker.getElement();
            if (element) {
              element.classList.add('marker-hidden');
              element.style.opacity = '0.2';
            }
          });
        }
      });
      
      Object.keys(polylines.value).forEach(pedidoId => {
        if (parseInt(pedidoId) !== newId) {
          polylines.value[pedidoId].forEach(polyline => {
            const element = polyline.getElement();
            if (element) {
              element.classList.add('polyline-hidden');
              element.style.opacity = '0.1';
            }
          });
        }
      });
      
      // Highlight the hovered pedido elements
      if (markers.value[newId]) {
        markers.value[newId].forEach(marker => {
          const element = marker.getElement();
          if (element) {
            element.classList.add('marker-highlight');
            element.style.opacity = '1';
            element.style.transform = 'scale(1.2)';
          }
          marker.setZIndexOffset(1000);
        });
      }
      
      if (polylines.value[newId]) {
        polylines.value[newId].forEach(polyline => {
          const element = polyline.getElement();
          if (element) {
            element.classList.add('polyline-highlight');
            element.style.opacity = '1';
            element.style.strokeWidth = '5';
          }
        });
      }
    }
  }
});
</script>

<style>
.map-container {
  height: 100vh;
  width: 100%;
  position: relative;
}

#map {
  height: 100%;
  width: 100%;
}

/* Custom popup styling */
.custom-popup {
  font-family: 'Arial', sans-serif;
}

.popup-header {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.popup-content {
  font-size: 12px;
  line-height: 1.5;
}

.popup-icons {
  margin-top: 8px;
  font-size: 16px;
}

.leaflet-popup-content-wrapper {
  border-radius: 8px;
  padding: 5px;
  box-shadow: 0 3px 14px rgba(0,0,0,0.2);
}

/* Legend styling */
.map-legend {
  position: absolute;
  top: 100px;
  left: 10px;
  background: rgb(255, 255, 255, 0.4);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.4);
  z-index: 1000;
  max-width: 300px;
}


.map-legend h3 {
  margin-top: 0;
  font-size: 16px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.marker-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 10px;
}

.origin {
  background-color: #4285F4;
}

.destination {
  background-color: #EA4335;
}

.line-sample {
  height: 3px;
  width: 30px;
  margin-right: 10px;
  background-color: #3388ff;
}

.line-sample.dashed {
  background: repeating-linear-gradient(
    to right,
    #3388ff,
    #3388ff 5px,
    transparent 5px,
    transparent 10px
  );
}

.close-legend {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
}

.toggle-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.marker-highlight {
  z-index: 900 !important;
  filter: drop-shadow(0 0 8px #fff59d) drop-shadow(0 0 15px #ffd700) !important;
  transition: all 0.3s ease !important;
}

.custom-marker {
  transition: all 0.3s ease;
}

.map-element {
  transition: all 0.3s ease;
}

.marker-highlight::after {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background-color: rgba(255, 245, 157, 0.4);
  border-radius: 8px;
  z-index: -1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
}

/* Hide class for markers and polylines */
.marker-hidden {
  display: none !important;
}

.polyline-hidden {
  display: none !important;
}

.polyline-highlight {
  filter: drop-shadow(0 0 5px #fff59d) drop-shadow(0 0 10px #3388ff) !important;
  transition: all 0.3s ease !important;
}
</style>