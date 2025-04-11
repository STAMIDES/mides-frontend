import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapaUbicacion = ({ latitudes = [], longitudes = [], height = "300px", modoSeleccion = false, onMapClick }) => {
  latitudes = latitudes.filter(lat => lat !== undefined && lat !== null && !isNaN(lat));
  longitudes = longitudes.filter(lng => lng !== undefined && lng !== null && !isNaN(lng));
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-34.9011, -56.1645], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    if (!mapRef.current || !mapRef.current._container) return;

    let mapClickHandler;

    if (modoSeleccion && mapRef.current) {
      mapClickHandler = (e) => {
        const { lat, lng } = e.latlng;
        if (onMapClick) onMapClick({ lat, lng });
      };
      mapRef.current.on("click", mapClickHandler);
      mapRef.current.getContainer().style.cursor = "crosshair";
    }
    
    // Eliminar marcadores previos
    markersRef.current.forEach(marker => mapRef.current.removeLayer(marker));
    markersRef.current = [];

    // Filtrar coordenadas inválidas (null, undefined, NaN)
    const validCoords = latitudes
      .map((lat, i) => (lat !== null && lat !== undefined && !isNaN(lat) && 
                        longitudes[i] !== null && longitudes[i] !== undefined && !isNaN(longitudes[i])) 
                      ? [lat, longitudes[i]] 
                      : null)
      .filter(coord => coord !== null);

    // Agregar nuevos marcadores
    validCoords.forEach(coord => {
      const marker = L.marker(coord).addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    // Ajustar vista si hay marcadores válidos
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    } else if (validCoords.length === 0) {
      mapRef.current.setView([-34.9011, -56.1645], 13); // Fallback si no hay coordenadas
    }    

    return () => {
      if (mapClickHandler && mapRef.current) {
        mapRef.current.off("click", mapClickHandler);
      }
      if (mapRef.current) {
        mapRef.current.getContainer().style.cursor = "";
      }
    };
    

  }, [latitudes, longitudes]);
  
  return <div ref={mapContainerRef} style={{ height: height, width: "100%" }}></div>;
};

export default MapaUbicacion;
