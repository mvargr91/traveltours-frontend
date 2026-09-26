// Formulario de destino en su propia ruta (crear, editar o ver),
// en lugar del modal: el formulario es largo y así se trabaja a pantalla completa.
import React from 'react';
import PropTypes from 'prop-types';
import AppCrudPagina from '../../../../shared/components/AppCrudPagina';
import DestinoCreador from '../DestinoCreador';

const TITULOS = {
  crear: 'Nuevo destino',
  editar: 'Editar destino',
  ver: 'Detalle del destino',
};

const DestinoPagina = ({ route, accion }) => (
  <AppCrudPagina route={route} accion={accion} parametro='destino_id' titulos={TITULOS}>
    {({ id, ...props }) => <DestinoCreador destino={id} {...props} enPagina />}
  </AppCrudPagina>
);

DestinoPagina.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
  accion: PropTypes.oneOf(['crear', 'editar', 'ver']).isRequired,
};

export default DestinoPagina;
