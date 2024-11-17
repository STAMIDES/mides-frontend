// utils/geocoder.js
import axios from 'axios';

export const geocodeAddress = async (address) => {
  console.log(`Geocodificando: ${address}`);
  
  const formattedAddress = address.replace(/\s+/g, '+');
  const url = `https://nominatim.openstreetmap.org/search.php?street=${formattedAddress}&country=Uruguay&format=jsonv2`;

  try {
    const response = await axios.get(url);

    if (response.data && response.data.length > 0) {
      // Devolver hasta 5 resultados
      const locations = response.data.slice(0, 5).map(location => ({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
        display_name: location.display_name
      }));
      console.log("#######", locations);
      return locations;
    } else {
      throw new Error(`No se encontraron coordenadas para la dirección: ${address}`);
    }
  } catch (error) {
    console.error(error);
    throw new Error(`Error al geocodificar la dirección: ${address}.`);
  }
};