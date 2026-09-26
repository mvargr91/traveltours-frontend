// Formulario de reserva en su propia ruta (crear, editar o ver),
// en lugar del modal: el formulario es largo y así se trabaja a pantalla completa.
import React from 'react';
import PropTypes from 'prop-types';
import AppCrudPagina from '../../../../shared/components/AppCrudPagina';
import ReservaCreador from '../ReservaCreador';

const TITULOS = {
  crear: 'Nueva reserva',
  editar: 'Editar reserva',
  ver: 'Detalle de la reserva',
};

const ReservaPagina = ({ route, accion }) => (
  <AppCrudPagina route={route} accion={accion} parametro='reserva_id' titulos={TITULOS}>
    {({ id, ...props }) => <ReservaCreador reserva={id} {...props} enPagina />}
  </AppCrudPagina>
);

ReservaPagina.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
  accion: PropTypes.oneOf(['crear', 'editar', 'ver']).isRequired,
};

export default ReservaPagina;
