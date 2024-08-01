import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import React from "react";

const ArcGISMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new Map({
      basemap: "topo-vector",
    });
    
    const view = new MapView({
      map: map,
      center: [-56.1401427, -34.8704884],
      zoom: 10,
    });

    view.container = mapRef.current; 
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%"
      }}
    ></div> 
  );
};

export default ArcGISMap;