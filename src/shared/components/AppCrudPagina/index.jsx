// Ruta propia para crear/editar/ver un registro cuando el formulario es demasiado
// largo para un modal. Revisa el permiso de la acción, toma el id de la URL y
// vuelve a la lista al cerrar o guardar. El creador se monta con `enPagina`.
import PropTypes from 'prop-types';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import usePermisosOpcion from '../../hooks/usePermisosOpcion';

const PERMISO_POR_ACCION = { crear: 'Crear', editar: 'Modificar', ver: 'Listar' };

const AppCrudPagina = ({ route, accion, parametro, titulos, children }) => {
  const navigate = useNavigate();
  const params = useParams();
  const { permisos, cargado } = usePermisosOpcion(route.path);

  if (cargado && !permisos.includes(PERMISO_POR_ACCION[accion])) {
    return <Navigate to={route.path} replace />;
  }

  return children({
    id: params[parametro],
    accion,
    titulo: titulos[accion],
    handleOnClose: () => navigate(route.path),
    // La lista se vuelve a consultar al regresar a ella.
    updateColeccion: () => {},
  });
};

AppCrudPagina.propTypes = {
  // `path` es la ruta de la lista: de ella salen los permisos y a ella se vuelve.
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
  accion: PropTypes.oneOf(['crear', 'editar', 'ver']).isRequired,
  // Nombre del parámetro de la ruta con el id del registro.
  parametro: PropTypes.string.isRequired,
  titulos: PropTypes.shape({
    crear: PropTypes.string,
    editar: PropTypes.string,
    ver: PropTypes.string,
  }).isRequired,
  // ({ id, accion, titulo, handleOnClose, updateColeccion }) => <Creador enPagina ... />
  children: PropTypes.func.isRequired,
};

export default AppCrudPagina;
