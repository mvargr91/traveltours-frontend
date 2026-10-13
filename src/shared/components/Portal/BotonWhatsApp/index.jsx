// Botones de WhatsApp del portal. El número sale del parámetro WHATSAPP_NUMERO (llega con publico/apariencia)
// y los mensajes de Parametrización > Apariencia > Textos > WhatsApp. Sin número no se pinta ningún botón.
//  - BotonWhatsAppFlotante: va en PublicLayout; mensaje general, o el de la experiencia cuando se está en su ficha.
//  - BotonWhatsApp: botón dentro de una página, con el mensaje de la acción (experiencia, fecha o reserva).
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useMatch } from 'react-router-dom';
import { Button, Fab, Tooltip } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useApariencia, useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';
import { RUTAS_PORTAL } from '../../../constants/RutasPortal';
import { aHoraCorta } from '../../../constants/Turismo';

const VERDE = '#25D366';
const VERDE_OSCURO = '#1DA851';

const urlTour = (slug) => `${window.location.origin}${RUTAS_PORTAL.tour(slug)}`;

/**
 * { disponible, enlace(mensaje, variables) }: arma el enlace wa.me con uno de los mensajes editables.
 * mensaje: 'mensajeGeneral' | 'mensajeExperiencia' | 'mensajeFecha' | 'mensajeReserva'.
 */
export const useWhatsApp = () => {
  const { contacto, marca } = useApariencia().apariencia;
  const t = useTextos('whatsapp');
  const numero = contacto.whatsapp;

  return {
    disponible: Boolean(numero),
    enlace: (mensaje, variables = {}) =>
      `https://wa.me/${numero}?text=${encodeURIComponent(t(mensaje, { marca: marca.nombre, ...variables }))}`,
  };
};

/**
 * Mensaje según lo que se sabe: reserva hecha, experiencia con fecha elegida, solo experiencia o general.
 */
export const mensajeWhatsApp = ({ experiencia, disponibilidad, personas, reserva } = {}) => {
  if (reserva) {
    return [
      'mensajeReserva',
      { codigo: reserva.codigo_reserva, experiencia: reserva.experiencia_nombre, fecha: reserva.fecha },
    ];
  }
  if (!experiencia) return ['mensajeGeneral', {}];
  const variables = { experiencia: experiencia.nombre, enlace: urlTour(experiencia.slug) };
  if (!disponibilidad) return ['mensajeExperiencia', variables];
  return [
    'mensajeFecha',
    { ...variables, fecha: disponibilidad.fecha, hora: aHoraCorta(disponibilidad.hora_inicio), personas: personas ?? 1 },
  ];
};

const BotonWhatsApp = ({ experiencia, disponibilidad, personas, reserva, ...props }) => {
  const { disponible, enlace } = useWhatsApp();
  const t = useTextos('whatsapp');
  if (!disponible) return null;

  return (
    <Button
      fullWidth
      variant='outlined'
      startIcon={<WhatsAppIcon />}
      href={enlace(...mensajeWhatsApp({ experiencia, disponibilidad, personas, reserva }))}
      target='_blank'
      rel='noopener noreferrer'
      {...props}
      sx={{
        color: VERDE_OSCURO,
        borderColor: VERDE,
        '&:hover': { borderColor: VERDE_OSCURO, bgcolor: 'rgba(37, 211, 102, 0.08)' },
        ...props.sx,
      }}
    >
      {t('boton')}
    </Button>
  );
};

BotonWhatsApp.propTypes = {
  experiencia: PropTypes.object,
  disponibilidad: PropTypes.object,
  personas: PropTypes.number,
  reserva: PropTypes.object,
  sx: PropTypes.object,
};

export const BotonWhatsAppFlotante = () => {
  const { disponible, enlace } = useWhatsApp();
  const t = useTextos('whatsapp');
  // En la ficha de una experiencia el mensaje pregunta por ella.
  const enFicha = useMatch(RUTAS_PORTAL.tour(':slug'));
  const actual = useSelector((state) => state.portalExperiencias.actual);
  const experiencia = enFicha && actual?.slug === enFicha.params.slug ? actual : null;
  if (!disponible) return null;

  return (
    <Tooltip title={t('flotante')} placement='left'>
      <Fab
        aria-label={t('flotante')}
        href={enlace(...mensajeWhatsApp({ experiencia }))}
        target='_blank'
        rel='noopener noreferrer'
        sx={{
          position: 'fixed',
          right: { xs: 16, md: 24 },
          bottom: { xs: 16, md: 24 },
          zIndex: (theme) => theme.zIndex.speedDial,
          color: '#fff',
          bgcolor: VERDE,
          '&:hover': { bgcolor: VERDE_OSCURO },
        }}
      >
        <WhatsAppIcon sx={{ fontSize: 32 }} />
      </Fab>
    </Tooltip>
  );
};

export default BotonWhatsApp;
