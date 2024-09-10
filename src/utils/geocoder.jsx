// utils/geocoder.js
import axios from 'axios';

export const geocodeAddress = async (address) => {
  console.log(`Dirección a geocodificar: ${address}`);

  // Reemplaza espacios por '+'
  const formattedAddress = address.replace(/\s+/g, '+');

  // Crea la URL
  const url = `https://nominatim.openstreetmap.org/search.php?street=${formattedAddress}&country=Uruguay&format=jsonv2`;

  try {
    // Realiza la solicitud HTTP
    const response = await axios.get(url);

    // Verifica si la respuesta contiene datos
    if (response.data && response.data.length > 0) {
      const location = response.data[0]; // Obtiene el lugar más probable
      console.log('Coordenadas:', location.lat, location.lon);
      return {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon)
      };
    } else {
      throw new Error('No se encontraron coordenadas para la dirección proporcionada.');
    }
  } catch (error) {
    console.error('Error al geocodificar la dirección:', error);
    throw error;
  }
};