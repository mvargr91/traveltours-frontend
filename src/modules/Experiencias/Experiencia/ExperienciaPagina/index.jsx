// Formulario de experiencia en su propia ruta (crear, editar o ver),
// en lugar del modal: el formulario es largo y así se trabaja a pantalla completa.
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import AppCrudPagina from '../../../../shared/components/AppCrudPagina';
import { onGetColeccionLigera as onGetDestinos } from '../../../../@crema/redux/features/destinos/destinosSlice';
import { onGetColeccionLigera as onGetProveedores } from '../../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import ExperienciaCreador from '../ExperienciaCreador';

const TITULOS = {
  crear: 'Nueva experiencia',
  editar: 'Editar experiencia',
  ver: 'Detalle de la experiencia',
};

const ExperienciaPagina = ({ route, accion }) => {
  const dispatch = useDispatch();
  const destinos = useSelector((state) => state.destinos.coleccionLigera);
  const proveedores = useSelector((state) => state.proveedoresTuristicos.coleccionLigera);

  useEffect(() => {
    dispatch(onGetDestinos());
    dispatch(onGetProveedores());
  }, [dispatch]);

  const proveedoresOpciones = proveedores.map((p) => ({ id: p.id, nombre: p.nombre_comercial ?? p.nombre }));

  return (
    <AppCrudPagina route={route} accion={accion} parametro='experiencia_id' titulos={TITULOS}>
      {({ id, ...props }) => (
        <ExperienciaCreador
          experiencia={id}
          {...props}
          destinos={destinos}
          proveedores={proveedoresOpciones}
          enPagina
        />
      )}
    </AppCrudPagina>
  );
};

ExperienciaPagina.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
  accion: PropTypes.oneOf(['crear', 'editar', 'ver']).isRequired,
};

export default ExperienciaPagina;
