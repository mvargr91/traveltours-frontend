// Mi Cuenta > Mis Reseñas: historial de reseñas del viajero (el backend filtra por el usuario del token).
// Se crean desde Mis Reservas (reservas finalizadas); aquí se editan o eliminan.
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Rating from '@mui/material/Rating';
import AppCrudTable from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/resenas/resenasSlice';
import { showMessage } from '../../../@crema/redux/features/cammon/commonSlice';
import { UPDATE_TYPE } from '../../../shared/constants/Constantes';
import { ESTADOS_RESENA, colorDe, nombreDe } from '../../../shared/constants/Turismo';
import ResenaDialog from './ResenaDialog';

const truncar = (texto, max = 80) => (texto && texto.length > max ? `${texto.substring(0, max)}…` : texto ?? '');

const cells = [
  { id: 'experiencia_nombre', typeHead: 'string', label: 'Experiencia', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'fecha_reserva', typeHead: 'string', label: 'Fecha del tour', value: (v) => v ?? '', align: 'left', mostrarInicio: true, ordenable: false },
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
  { id: 'fecha_creacion', typeHead: 'string', label: 'Escrita el', value: (v) => String(v ?? '').substring(0, 10), align: 'left', mostrarInicio: true },
];

const filtrosConfig = [{ name: 'estado', label: 'Estado', type: 'select', options: ESTADOS_RESENA }];

const MisResenas = ({ route }) => {
  const dispatch = useDispatch();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey, updateColeccion } = useCrudModulo();
  const [editando, setEditando] = useState(null);

  return (
    <>
      <AppCrudTable
        stateKey='resenas'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        subtitulo='Califica tus experiencias finalizadas desde Mis Reservas. Las reseñas se publican después de revisarlas.'
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Reseña'
        refreshKey={refreshKey}
        onEditar={setEditando}
      />
      <ResenaDialog
        abierto={Boolean(editando)}
        resena={editando}
        onClose={() => setEditando(null)}
        onGuardado={(mensaje) => {
          setEditando(null);
          dispatch(showMessage([mensaje, UPDATE_TYPE]));
          updateColeccion();
        }}
      />
    </>
  );
};

MisResenas.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default MisResenas;
