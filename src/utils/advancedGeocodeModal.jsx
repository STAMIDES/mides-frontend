// src/components/AdvancedGeocodeModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Paper, Typography, TextField, Select, MenuItem, Button, Grid, Box } from '@mui/material';
import { traerDepartamentos, traerLocalidades, traerCalles, georreferenciar } from '../utils/geocoder';

const AdvancedGeocodeModal = ({ open, onClose, onGeocodeSuccess }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [calles, setCalles] = useState([]);
  const [esquina1Calles, setEsquina1Calles] = useState([]);
  const [esquina2Calles, setEsquina2Calles] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [selectedLocalidad, setSelectedLocalidad] = useState('');
  const [selectedCalle, setSelectedCalle] = useState('');
  const [selectedEsquina1, setSelectedEsquina1] = useState('');
  const [selectedEsquina2, setSelectedEsquina2] = useState('');
  const [callePrefijo, setCallePrefijo] = useState('');
  const [esquina1Prefijo, setEsquina1Prefijo] = useState('');
  const [esquina2Prefijo, setEsquina2Prefijo] = useState('');
  const [numero, setNumero] = useState('');
  const [km, setKm] = useState('');
  const [padron, setPadron] = useState('');
  const [manzana, setManzana] = useState('');
  const [solar, setSolar] = useState('');
  const [error, setError] = useState('');
  const [hasSearchedCalle, setHasSearchedCalle] = useState(false);
  const [hasSearchedEsquina1, setHasSearchedEsquina1] = useState(false);
  const [hasSearchedEsquina2, setHasSearchedEsquina2] = useState(false);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const deps = await traerDepartamentos();
        setDepartamentos(deps);
      } catch (err) {
        setError('Error al cargar departamentos.');
        console.error(err);
      }
    };

    if (open) {
      fetchDepartamentos();
    }
  }, [open]);

  const handleDepartamentoChange = async (event) => {
    const depId = event.target.value;
    setSelectedDepartamento(depId);
    setSelectedLocalidad('');
    setLocalidades([]);
    setSelectedCalle('');
    setCalles([]);
    setSelectedEsquina1('');
    setEsquina1Calles([]);
    setSelectedEsquina2('');
    setEsquina2Calles([]);
    setCallePrefijo('');
    setEsquina1Prefijo('');
    setEsquina2Prefijo('');
    setHasSearchedCalle(false);
    setHasSearchedEsquina1(false);
    setHasSearchedEsquina2(false);

    try {
      const locs = await traerLocalidades(depId);
      setLocalidades(locs);
    } catch (err) {
      setError('Error al cargar localidades.');
      console.error(err);
    }
  };

  const handleLocalidadChange = (event) => {
    const locId = event.target.value;
    setSelectedLocalidad(locId);
    setSelectedCalle('');
    setCalles([]);
    setSelectedEsquina1('');
    setEsquina1Calles([]);
    setSelectedEsquina2('');
    setEsquina2Calles([]);
    setCallePrefijo('');
    setEsquina1Prefijo('');
    setEsquina2Prefijo('');
    setHasSearchedCalle(false);
    setHasSearchedEsquina1(false);
    setHasSearchedEsquina2(false);
  };

  const handleBuscarCalles = async () => {
    try {
      setHasSearchedCalle(true);
      const callesData = await traerCalles(selectedLocalidad, callePrefijo);
      setCalles(callesData);
    } catch (err) {
      setError('Error al cargar calles.');
      console.error(err);
    }
  };

  const handleBuscarEsquina1 = async () => {
    try {
      setHasSearchedEsquina1(true);
      const esquina1Data = await traerCalles(selectedLocalidad, esquina1Prefijo);
      setEsquina1Calles(esquina1Data);
    } catch (err) {
      setError('Error al cargar esquina 1.');
      console.error(err);
    }
  };

  const handleBuscarEsquina2 = async () => {
    try {
      setHasSearchedEsquina2(true);
      const esquina2Data = await traerCalles(selectedLocalidad, esquina2Prefijo);
      setEsquina2Calles(esquina2Data);
    } catch (err) {
      setError('Error al cargar esquina 2.');
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      const params = {
        depId: selectedDepartamento,
        locId: selectedLocalidad,
        calleId: selectedCalle,
        dirNumero: numero || undefined,
        esq1Id: selectedEsquina1 || undefined,
        esq2Id: selectedEsquina2 || undefined,
        km: km || undefined,
        padron: padron || undefined,
        manzana: manzana || undefined,
        solar: solar || undefined,
      };

      const result = await georreferenciar(params);
      if (onGeocodeSuccess) {
        onGeocodeSuccess(result);
      }
      onClose();
    } catch (err) {
      setError('Error al georreferenciar la dirección.');
      console.error(err);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Paper
        sx={{
          padding: 3,
          width: '90%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto',
          marginTop: '5vh',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Modo Avanzado de Geocodificación
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

        <Grid container spacing={2}>
          {/* Departamento y Localidad */}
          <Grid item xs={6}>
            <Select
              fullWidth
              value={selectedDepartamento}
              onChange={handleDepartamentoChange}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Selecciona un departamento
              </MenuItem>
              {departamentos.map((dep) => (
                <MenuItem key={dep.id} value={dep.id}>
                  {dep.nombre}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={6}>
            <Select
              fullWidth
              value={selectedLocalidad}
              onChange={handleLocalidadChange}
              displayEmpty
              disabled={!localidades.length}
            >
              <MenuItem value="" disabled>
                Selecciona una localidad
              </MenuItem>
              {localidades.map((loc) => (
                <MenuItem key={loc.locId} value={loc.locId}>
                  {loc.locNombre}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Calle Principal */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Calle Principal
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Prefijo de Calle"
                    value={callePrefijo}
                    onChange={(e) => setCallePrefijo(e.target.value)}
                    disabled={!selectedLocalidad}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBuscarCalles}
                    disabled={!selectedLocalidad || !callePrefijo}
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Buscar
                  </Button>
                </Grid>
                <Grid item xs={8}>
                  <Select
                    fullWidth
                    value={selectedCalle}
                    onChange={(e) => setSelectedCalle(e.target.value)}
                    displayEmpty
                    disabled={!calles.length && !hasSearchedCalle}
                  >
                    <MenuItem value="" disabled>
                      Selecciona una calle
                    </MenuItem>
                    {calles.length > 0 ? (
                      calles.map((calle) => (
                        <MenuItem key={calle.id} value={calle.id}>
                          {calle.nombre}
                        </MenuItem>
                      ))
                    ) : (
                      hasSearchedCalle && (
                        <MenuItem value="" disabled>
                          No se encontraron calles
                        </MenuItem>
                      )
                    )}
                  </Select>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Número"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    required
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Esquina 1 */}
          <Grid item xs={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Esquina 1
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Prefijo Esquina 1"
                    value={esquina1Prefijo}
                    onChange={(e) => setEsquina1Prefijo(e.target.value)}
                    disabled={!selectedLocalidad}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBuscarEsquina1}
                    disabled={!selectedLocalidad || !esquina1Prefijo}
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Buscar
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Select
                    fullWidth
                    value={selectedEsquina1}
                    onChange={(e) => setSelectedEsquina1(e.target.value)}
                    displayEmpty
                    disabled={!esquina1Calles.length && !hasSearchedEsquina1}
                  >
                    <MenuItem value="" disabled>
                      Selecciona Esquina 1
                    </MenuItem>
                    {esquina1Calles.length > 0 ? (
                      esquina1Calles.map((calle) => (
                        <MenuItem key={calle.id} value={calle.id}>
                          {calle.nombre}
                        </MenuItem>
                      ))
                    ) : (
                      hasSearchedEsquina1 && (
                        <MenuItem value="" disabled>
                          No se encontraron calles
                        </MenuItem>
                      )
                    )}
                  </Select>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Esquina 2 */}
          <Grid item xs={6}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Esquina 2
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Prefijo Esquina 2"
                    value={esquina2Prefijo}
                    onChange={(e) => setEsquina2Prefijo(e.target.value)}
                    disabled={!selectedLocalidad}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBuscarEsquina2}
                    disabled={!selectedLocalidad || !esquina2Prefijo}
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Buscar
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Select
                    fullWidth
                    value={selectedEsquina2}
                    onChange={(e) => setSelectedEsquina2(e.target.value)}
                    displayEmpty
                    disabled={!esquina2Calles.length && !hasSearchedEsquina2}
                  >
                    <MenuItem value="" disabled>
                      Selecciona Esquina 2
                    </MenuItem>
                    {esquina2Calles.length > 0 ? (
                      esquina2Calles.map((calle) => (
                        <MenuItem key={calle.id} value={calle.id}>
                          {calle.nombre}
                        </MenuItem>
                      ))
                    ) : (
                      hasSearchedEsquina2 && (
                        <MenuItem value="" disabled>
                          No se encontraron calles
                        </MenuItem>
                      )
                    )}
                  </Select>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Otros campos */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Kilómetro"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Padrón"
              value={padron}
              onChange={(e) => setPadron(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Manzana"
              value={manzana}
              onChange={(e) => setManzana(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Solar"
              value={solar}
              onChange={(e) => setSolar(e.target.value)}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!selectedDepartamento || !selectedLocalidad || !selectedCalle || !numero}
            >
              Geocodificar
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

export default AdvancedGeocodeModal;
