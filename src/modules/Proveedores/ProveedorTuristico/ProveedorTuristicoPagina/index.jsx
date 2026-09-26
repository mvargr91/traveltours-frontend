// Formulario de proveedor turístico en su propia ruta (crear, editar o ver),
// en lugar del modal: el formulario es largo y así se trabaja a pantalla completa.
import React from 'react';
import PropTypes from 'prop-types';
import AppCrudPagina from '../../../../shared/components/AppCrudPagina';
import ProveedorTuristicoCreador from '../ProveedorTuristicoCreador';

const TITULOS = {
  crear: 'Nuevo proveedor turístico',
  editar: 'Editar proveedor turístico',
  ver: 'Detalle del proveedor turístico',
};

const ProveedorTuristicoPagina = ({ route, accion }) => (
  <AppCrudPagina route={route} accion={accion} parametro='proveedor_id' titulos={TITULOS}>
    {({ id, ...props }) => <ProveedorTuristicoCreador proveedor={id} {...props} enPagina />}
  </AppCrudPagina>
);

ProveedorTuristicoPagina.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
  accion: PropTypes.oneOf(['crear', 'editar', 'ver']).isRequired,
};

export default ProveedorTuristicoPagina;
