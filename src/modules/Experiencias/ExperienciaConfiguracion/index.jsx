// Configuración de una experiencia: agrupa en pestañas sus recursos hijos
// (precios, horarios, disponibilidad, multimedia, categorías y características).
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Chip, IconButton, Paper, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { onShow } from '../../../@crema/redux/features/experiencias/experienciasSlice';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import {
  ESTADOS_EXPERIENCIA,
  colorDe,
  formatoMoneda,
  nombreDe,
} from '../../../shared/constants/Turismo';
import ExperienciaPrecio from './ExperienciaPrecio';
import ExperienciaHorario from './ExperienciaHorario';
import ExperienciaDisponibilidad from './ExperienciaDisponibilidad';
import ExperienciaMultimedia from './ExperienciaMultimedia';
import ExperienciaCategoria from './ExperienciaCategoria';
import ExperienciaCaracteristica from './ExperienciaCaracteristica';

const PESTANAS = [
  { id: 'precios', label: 'Precios', Componente: ExperienciaPrecio },
  { id: 'horarios', label: 'Horarios', Componente: ExperienciaHorario },
  { id: 'disponibilidad', label: 'Disponibilidad', Componente: ExperienciaDisponibilidad },
  { id: 'multimedia', label: 'Multimedia', Componente: ExperienciaMultimedia },
  { id: 'categorias', label: 'Categorías', Componente: ExperienciaCategoria },
  { id: 'caracteristicas', label: 'Características', Componente: ExperienciaCaracteristica },
];

const ExperienciaConfiguracion = ({ route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { experiencia_id: experienciaId } = useParams();
  const { urlAyuda, permisos } = usePermisosOpcion(route.path);
  const experiencia = useSelector((state) => state.experiencias.actual);
  const [pestana, setPestana] = useState(0);

  useEffect(() => {
    dispatch(onShow(experienciaId));
  }, [dispatch, experienciaId]);

  const { Componente } = PESTANAS[pestana];

  return (
    <Box sx={{ width: '100%', pt: '20px', px: '20px' }}>
      <Paper
        sx={{
          p: '15px',
          boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)',
          borderRadius: '4px',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
          <Tooltip title='Volver a Experiencias'>
            <IconButton onClick={() => navigate('/experiencias')}>
              <ArrowBackIosIcon />
            </IconButton>
          </Tooltip>
          <Box flex='1 1 auto'>
            <Typography variant='h2' fontWeight='bold'>
              {experiencia?.nombre ?? 'Experiencia'}
            </Typography>
            {experiencia && (
              <Typography variant='subtitle1' color='text.secondary'>
                {experiencia.duracion ? `${experiencia.duracion} · ` : ''}
                Desde {formatoMoneda(experiencia.precio_desde)}
                {experiencia.capacidad_maxima ? ` · Capacidad ${experiencia.capacidad_maxima}` : ''}
              </Typography>
            )}
          </Box>
          {experiencia && (
            <Chip
              label={nombreDe(ESTADOS_EXPERIENCIA, experiencia.estado)}
              sx={{ backgroundColor: colorDe(ESTADOS_EXPERIENCIA, experiencia.estado), color: 'white' }}
            />
          )}
        </Box>
        <Tabs
          value={pestana}
          onChange={(e, nueva) => setPestana(nueva)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{ mt: 2 }}
        >
          {PESTANAS.map((p) => (
            <Tab key={p.id} label={p.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Solo se monta la pestaña activa: cada una tiene su propia tabla y mensajes. */}
      <Box sx={{ mx: '-20px' }}>
        <Componente
          key={PESTANAS[pestana].id}
          experienciaId={experienciaId}
          permisos={permisos}
          urlAyuda={urlAyuda}
        />
      </Box>
    </Box>
  );
};

ExperienciaConfiguracion.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default ExperienciaConfiguracion;
