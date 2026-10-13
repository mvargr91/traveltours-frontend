// Parametrización > Generar fechas: lanza a mano la creación de fechas de los tours con horario semanal
// (POST disponibilidad/generar). Normalmente corre sola: al guardar un horario y con la primera visita del día
// al portal. Sirve, por ejemplo, después de ampliar el parámetro DIAS_DISPONIBILIDAD.
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import HelpButton from '../../../shared/components/HelpButton';

const GenerarFechas = ({ route }) => {
  const { titulo, urlAyuda, permisos, cargado } = usePermisosOpcion(route.path);
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState(null); // { tipo: 'success' | 'error', texto }

  const generar = async () => {
    setGenerando(true);
    setResultado(null);
    try {
      const { data } = await jwtAxios.post('disponibilidad/generar');
      setResultado({ tipo: 'success', texto: data.mensajes?.[0] });
    } catch (e) {
      setResultado({ tipo: 'error', texto: extraerMensajeError(e) });
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: '20px' }}>
      <Paper sx={{ p: '15px', mb: 4, boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)', borderRadius: '4px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant='h2' component='h1' sx={{ fontWeight: 'bold' }}>
            {titulo || 'Generar fechas'}
          </Typography>
          {urlAyuda && <HelpButton url={urlAyuda} />}
        </Box>
        <Typography variant='subtitle1' color='text.secondary'>
          Fechas de disponibilidad de los tours con horario semanal.
        </Typography>
      </Paper>

      <Paper sx={{ p: 5, boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)', borderRadius: '4px' }}>
        <Typography sx={{ mb: 2 }}>
          El sistema crea solas las fechas de cada tour a partir de sus horarios semanales: al guardar un horario y, una vez
          al día, con la primera visita al portal. Con este botón se ejecuta ahora mismo.
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 4 }}>
          Crea las fechas que falten para los próximos días según el parámetro DIAS_DISPONIBILIDAD (Parametrización ›
          Parámetros). No modifica las fechas que ya existen ni vuelve a crear las que se cancelaron.
        </Typography>

        {cargado && !permisos.includes('Modificar') ? (
          <Alert severity='warning'>No tienes permiso para ejecutar esta tarea.</Alert>
        ) : (
          <Button
            variant='contained'
            size='large'
            disabled={generando}
            startIcon={generando ? <CircularProgress size={20} color='inherit' /> : <EventRepeatIcon />}
            onClick={generar}
          >
            {generando ? 'Generando…' : 'Generar fechas ahora'}
          </Button>
        )}

        {resultado && (
          <Alert severity={resultado.tipo} sx={{ mt: 4 }}>
            {resultado.texto}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

GenerarFechas.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default GenerarFechas;
