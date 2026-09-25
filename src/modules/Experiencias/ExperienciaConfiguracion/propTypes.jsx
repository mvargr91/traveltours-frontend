import PropTypes from 'prop-types';

// Props que reciben todas las pestañas de la configuración de experiencia.
export const pestanaPropTypes = {
  experienciaId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  permisos: PropTypes.arrayOf(PropTypes.string).isRequired,
  urlAyuda: PropTypes.string,
};

// Props que reciben todos los creadores de las pestañas.
export const creadorPropTypes = {
  experienciaId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};
