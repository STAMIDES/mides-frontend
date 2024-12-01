// utils/geocoder.js
import axios from 'axios';

const SIMPLE_GEOCODER_URL = 'https://nominatim.openstreetmap.org/search.php';
const SOAP_URL = '/api/ServiciosMUI/ServiciosDireccionGeorreferencia?wsdl';

// ---- Geocodificador Simple ----
/**
 * Geocodifica una dirección utilizando el servicio simple (Nominatim).
 * @param {string} address - Dirección en lenguaje natural.
 * @returns {Promise<Array>} - Lista de coordenadas [{ lat, lng, display_name }, ...].
 */
export const geocodeAddress = async (address) => {
  console.log(`Geocificando (simple): ${address}`);
  const formattedAddress = address.replace(/\s+/g, '+');
  const url = `${SIMPLE_GEOCODER_URL}?street=${formattedAddress}&country=Uruguay&format=jsonv2`;

  try {
    const response = await axios.get(url);

    if (response.data && response.data.length > 0) {
      // Devolver hasta 5 resultados
      const locations = response.data.slice(0, 5).map(location => ({
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
        display_name: location.display_name
      }));
      console.log("Resultados del geocodificador simple:", locations);
      return locations;
    } else {
      throw new Error(`No se encontraron coordenadas para la dirección: ${address}`);
    }
  } catch (error) {
    console.error('Error en el geocodificador simple:', error);
    throw new Error(`Error al geocodificar la dirección: ${address}.`);
  }
};

// ---- Geocodificador Avanzado (SOAP) ----

/**
 * Realiza una solicitud SOAP genérica.
 * @param {string} action - Acción SOAP específica (SOAPAction).
 * @param {string} body - Body XML para la solicitud.
 * @returns {Promise<any>} - Respuesta procesada de la solicitud.
 */
const sendSoapRequest = async (action, body) => {
  try {
    const response = await axios.post(SOAP_URL, body, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al realizar la solicitud SOAP:', error);
    throw error;
  }
};

/**
 * Obtiene los departamentos disponibles.
 * @returns {Promise<Array>} - Lista de departamentos [{ id, nombre }, ...].
 */
export const traerDepartamentos = async () => {
  const action = 'http://direcciones.servicios.mides.gub.uy/traerDepartamentos';
  const body = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:dir="http://direcciones.servicios.mides.gub.uy/">
      <soapenv:Header/>
      <soapenv:Body>
        <dir:traerDepartamentos/>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const response = await sendSoapRequest(action, body);
  const matches = response.match(/<return>(.*?)<\/return>/g) || [];
  return matches.map((match) => {
    const id = match.match(/<id>(\d+)<\/id>/)?.[1];
    const nombre = match.match(/<nombre>([^<]+)<\/nombre>/)?.[1];
    return { id: Number(id), nombre };
  });
};

/**
 * Obtiene las localidades de un departamento específico.
 * @param {number} deptoId - ID del departamento.
 * @returns {Promise<Array>} - Lista de localidades [{ locId, locNombre }, ...].
 */
export const traerLocalidades = async (deptoId) => {
  const action = 'http://direcciones.servicios.mides.gub.uy/traerLocalidades';
  const body = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:dir="http://direcciones.servicios.mides.gub.uy/">
      <soapenv:Header/>
      <soapenv:Body>
        <dir:traerLocalidades>
          <deptoId>${deptoId}</deptoId>
        </dir:traerLocalidades>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const response = await sendSoapRequest(action, body);
  const matches = response.match(/<return>(.*?)<\/return>/g) || [];
  return matches.map((match) => {
    const locId = match.match(/<locId>(\d+)<\/locId>/)?.[1];
    const locNombre = match.match(/<locNombre>([^<]+)<\/locNombre>/)?.[1];
    return { locId: Number(locId), locNombre };
  });
};

/**
 * Obtiene las calles de una localidad específica filtradas por prefijo.
 * @param {number} locId - ID de la localidad.
 * @param {string} [prefijo] - Prefijo para filtrar calles (opcional).
 * @returns {Promise<Array>} - Lista de calles [{ id, nombre }, ...].
 */
export const traerCalles = async (locId, prefijo = '') => {
  const action = 'http://direcciones.servicios.mides.gub.uy/traerCalles';
  const body = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:dir="http://direcciones.servicios.mides.gub.uy/">
      <soapenv:Header/>
      <soapenv:Body>
        <dir:traerCalles>
          <locId>${locId}</locId>
          <prefijo>${prefijo}</prefijo>
        </dir:traerCalles>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const response = await sendSoapRequest(action, body);
  const matches = response.match(/<return>(.*?)<\/return>/g) || [];
  return matches.map((match) => {
    const id = match.match(/<id>(\d+)<\/id>/)?.[1];
    const nombre = match.match(/<nombre>([^<]+)<\/nombre>/)?.[1];
    return { id: Number(id), nombre };
  });
};

/**
 * Georreferencia una dirección específica.
 * @param {object} params - Parámetros para la georreferenciación.
 * @param {number} params.depId - ID del departamento.
 * @param {number} params.locId - ID de la localidad.
 * @param {number} params.calleId - ID de la calle.
 * @param {number} [params.dirNumero] - Número de dirección (opcional).
 * @param {number} [params.esq1Id] - ID de la primera esquina (opcional).
 * @param {number} [params.esq2Id] - ID de la segunda esquina (opcional).
 * @param {number} [params.km] - Kilómetro (opcional).
 * @param {number} [params.padron] - Número de padrón (opcional).
 * @returns {Promise<object>} - Coordenadas { lat, lng, utmX, utmY, source }.
 */
export const georreferenciar = async (params) => {
  const action = 'http://direcciones.servicios.mides.gub.uy/georreferenciar';
  const {
    depId, locId, calleId, dirNumero, esq1Id, esq2Id, km, padron, manzana, solar,
  } = params;

  const body = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:dir="http://direcciones.servicios.mides.gub.uy/">
      <soapenv:Header/>
      <soapenv:Body>
        <dir:georreferenciar>
          <depId>${depId}</depId>
          <locId>${locId}</locId>
          <calleId>${calleId}</calleId>
          ${dirNumero ? `<dirNumero>${dirNumero}</dirNumero>` : ''}
          ${esq1Id ? `<esq1Id>${esq1Id}</esq1Id>` : ''}
          ${esq2Id ? `<esq2Id>${esq2Id}</esq2Id>` : ''}
          ${km ? `<km>${km}</km>` : ''}
          ${padron ? `<padron>${padron}</padron>` : ''}
          ${manzana ? `<manzana>${manzana}</manzana>` : ''}
          ${solar ? `<solar>${solar}</solar>` : ''}
        </dir:georreferenciar>
      </soapenv:Body>
    </soapenv:Envelope>
  `;

  const response = await sendSoapRequest(action, body);
  const result = response.match(/<return>(.*?)<\/return>/)?.[1];
  const [lat, lng, utmX, utmY, source] = result.split('$');
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    utmX: parseFloat(utmX),
    utmY: parseFloat(utmY),
    source,
  };
};
