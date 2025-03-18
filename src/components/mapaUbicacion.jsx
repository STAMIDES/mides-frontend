import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapaUbicacion = ({ lat, lng, height = "300px" }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([-34.9011, -56.1645], 13); // Montevideo por defecto

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    if (lat && lng) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]); // Mueve el marcador si ya existe
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      }

      mapRef.current.setView([lat, lng], 15);
    }
  }, [lat, lng]);

  return <div id="map" style={{ height: height, width: "100%" }}></div>;
};

export default MapaUbicacion;
