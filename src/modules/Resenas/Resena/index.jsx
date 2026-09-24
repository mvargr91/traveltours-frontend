import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Rating from '@mui/material/Rating';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/resenas/resenasSlice';
import { onGetColeccionLigera as onGetExperiencias } from '../../../@crema/redux/features/experiencias/experienciasSlice';
import { ESTADOS_RESENA, colorDe, nombreDe } from '../../../shared/constants/Turismo';
import ResenaCreador from './ResenaCreador';

const truncar = (texto, max = 60) =>
  texto && texto.length > max ? `${texto.substring(0, max)}…` : texto ?? '';

const cells = [
  { id: 'experiencia_nombre', typeHead: 'string', label: 'Experiencia', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  {
    id: 'calificacion',
    typeHead: 'string',
    label: 'Calificación',
    value: (v) => <Rating value={Number(v) || 0} readOnly size='small' />,
    align: 'left',
    mostrarInicio: true,
  },
  { id: 'comentario', typeHead: 'string', label: 'Comentario', value: (v) => truncar(v), align: 'left', mostrarInicio: true, ordenable: false },
  {
    id: 'estado',
    typeHead: 'string',
    label: 'Estado',
    value: (v) => nombreDe(ESTADOS_RESENA, v),
    cellColor: (v) => colorDe(ESTADOS_RESENA, v),
    align: 'left',
    mostrarInicio: true,
  },
  ...auditCells,
];

// Las reseñas las crean los clientes desde el portal; aquí solo se moderan.
const Resena = ({ route }) => {
  const dispatch = useDispatch();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { formulario, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } = useCrudModulo();
  const experiencias = useSelector((state) => state.experiencias.coleccionLigera);

  useEffect(() => {
    dispatch(onGetExperiencias());
  }, [dispatch]);

  const filtrosConfig = [
    { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS_RESENA },
    { name: 'experiencia_id', label: 'Experiencia', type: 'select', options: experiencias },
  ];

  return (
    <>
      <AppCrudTable
        stateKey='resenas'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Reseña'
        refreshKey={refreshKey}
        onEditar={abrirEditar}
        onVer={abrirVer}
      />
      {formulario && (
        <ResenaCreador
          resena={formulario.id}
          experienciaNombre={formulario.row?.experiencia_nombre}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo={titulo}
        />
      )}
    </>
  );
};

Resena.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Resena;
