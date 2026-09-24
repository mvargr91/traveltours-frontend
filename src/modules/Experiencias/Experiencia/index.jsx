import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import SettingsIcon from '@mui/icons-material/Settings';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import AppEstadoDialog from '../../../shared/components/AppEstadoDialog';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
  onCambiarEstado,
} from '../../../@crema/redux/features/experiencias/experienciasSlice';
import { onGetColeccionLigera as onGetDestinos } from '../../../@crema/redux/features/destinos/destinosSlice';
import { onGetColeccionLigera as onGetProveedores } from '../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import {
  ESTADOS_EXPERIENCIA,
  colorDe,
  formatoMoneda,
  nombreDe,
  valorSiNo,
} from '../../../shared/constants/Turismo';
import ExperienciaCreador from './ExperienciaCreador';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'destino_nombre', typeHead: 'string', label: 'Destino', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'proveedor_nombre', typeHead: 'string', label: 'Proveedor', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'precio_desde', typeHead: 'numeric', label: 'Precio Desde', value: formatoMoneda, align: 'right', mostrarInicio: true },
  { id: 'duracion', typeHead: 'string', label: 'Duración', value: (v) => v, align: 'left', mostrarInicio: false, ordenable: false },
  { id: 'capacidad_maxima', typeHead: 'numeric', label: 'Capacidad', value: (v) => v, align: 'right', mostrarInicio: false, ordenable: false },
  {
    id: 'estado',
    typeHead: 'string',
    label: 'Estado',
    value: (v) => nombreDe(ESTADOS_EXPERIENCIA, v),
    cellColor: (v) => colorDe(ESTADOS_EXPERIENCIA, v),
    align: 'left',
    mostrarInicio: true,
  },
  { id: 'destacada', typeHead: 'string', label: 'Destacada', value: valorSiNo, align: 'left', mostrarInicio: true },
  { id: 'verificada', typeHead: 'string', label: 'Verificada', value: valorSiNo, align: 'left', mostrarInicio: false, ordenable: false },
  ...auditCells,
];

const Experiencia = ({ route }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();
  const [experienciaEstado, setExperienciaEstado] = useState(null);
  const destinos = useSelector((state) => state.destinos.coleccionLigera);
  const proveedores = useSelector((state) => state.proveedoresTuristicos.coleccionLigera);

  useEffect(() => {
    dispatch(onGetDestinos());
    dispatch(onGetProveedores());
  }, [dispatch]);

  const proveedoresOpciones = proveedores.map((p) => ({ id: p.id, nombre: p.nombre_comercial ?? p.nombre }));

  const filtrosConfig = [
    { name: 'nombre', label: 'Nombre', type: 'text' },
    { name: 'destino_id', label: 'Destino', type: 'select', options: destinos },
    { name: 'proveedor_id', label: 'Proveedor', type: 'select', options: proveedoresOpciones },
    { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS_EXPERIENCIA },
  ];

  const accionesExtra = [
    {
      titulo: 'Cambiar Estado',
      icono: PublishedWithChangesIcon,
      permiso: 'Modificar',
      onClick: setExperienciaEstado,
    },
    {
      titulo: 'Configurar (precios, horarios, multimedia...)',
      icono: SettingsIcon,
      permiso: 'Listar',
      onClick: (row) => navigate(`/experiencias/${row.id}/configuracion`),
    },
  ];

  return (
    <>
      <AppCrudTable
        stateKey='experiencias'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Experiencia'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
        accionesExtra={accionesExtra}
      />
      {formulario && (
        <ExperienciaCreador
          experiencia={formulario.id}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo={titulo}
          destinos={destinos}
          proveedores={proveedoresOpciones}
        />
      )}
      {experienciaEstado && (
        <AppEstadoDialog
          stateKey='experiencias'
          titulo={`Cambiar Estado: ${experienciaEstado.nombre}`}
          registro={experienciaEstado}
          opciones={ESTADOS_EXPERIENCIA}
          thunk={onCambiarEstado}
          handleOnClose={() => setExperienciaEstado(null)}
          updateColeccion={updateColeccion}
        />
      )}
    </>
  );
};

Experiencia.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Experiencia;
