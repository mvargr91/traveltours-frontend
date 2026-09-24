import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import AppEstadoDialog from '../../../shared/components/AppEstadoDialog';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
  onCambiarEstado,
} from '../../../@crema/redux/features/reservas/reservasSlice';
import { onGetColeccionLigera as onGetProveedores } from '../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import {
  ESTADOS_RESERVA,
  aHoraCorta,
  colorDe,
  formatoMoneda,
  nombreDe,
} from '../../../shared/constants/Turismo';
import ReservaCreador from './ReservaCreador';

const cells = [
  { id: 'codigo_reserva', typeHead: 'string', label: 'Código', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'experiencia_nombre', typeHead: 'string', label: 'Experiencia', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'proveedor_nombre', typeHead: 'string', label: 'Proveedor', value: (v) => v, align: 'left', mostrarInicio: false },
  { id: 'fecha', typeHead: 'string', label: 'Fecha', value: (v, row) => `${v ?? ''} ${aHoraCorta(row.hora_inicio)}`.trim(), align: 'left', mostrarInicio: true },
  { id: 'nombre', typeHead: 'string', label: 'Cliente', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'telefono', typeHead: 'string', label: 'Teléfono', value: (v) => v, align: 'left', mostrarInicio: false, ordenable: false },
  {
    id: 'cantidad_personas',
    typeHead: 'numeric',
    label: 'Personas',
    value: (v, row) => (row.cantidad_chicos ? `${v} (${row.cantidad_chicos} niños)` : v),
    align: 'right',
    mostrarInicio: true,
    ordenable: false,
  },
  { id: 'valor_total', typeHead: 'numeric', label: 'Valor Total', value: formatoMoneda, align: 'right', mostrarInicio: true },
  {
    id: 'estado',
    typeHead: 'string',
    label: 'Estado',
    value: (v) => nombreDe(ESTADOS_RESERVA, v),
    cellColor: (v) => colorDe(ESTADOS_RESERVA, v),
    align: 'left',
    mostrarInicio: true,
  },
  ...auditCells,
];

const Reserva = ({ route }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();
  const [reservaEstado, setReservaEstado] = useState(null);
  const proveedores = useSelector((state) => state.proveedoresTuristicos.coleccionLigera);

  useEffect(() => {
    dispatch(onGetProveedores());
  }, [dispatch]);

  const filtrosConfig = [
    { name: 'codigo_reserva', label: 'Código', type: 'text' },
    { name: 'nombre', label: 'Cliente', type: 'text' },
    { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS_RESERVA },
    {
      name: 'proveedor_id',
      label: 'Proveedor',
      type: 'select',
      options: proveedores.map((p) => ({ id: p.id, nombre: p.nombre_comercial })),
    },
  ];

  const accionesExtra = [
    {
      titulo: 'Cambiar Estado',
      icono: PublishedWithChangesIcon,
      permiso: 'Modificar',
      onClick: setReservaEstado,
    },
    {
      titulo: 'Acompañantes',
      icono: GroupIcon,
      permiso: 'Listar',
      onClick: (row) => navigate(`/reservas/${row.id}/acompanantes`),
    },
  ];

  return (
    <>
      <AppCrudTable
        stateKey='reservas'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Reserva'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
        accionesExtra={accionesExtra}
      />
      {formulario && (
        <ReservaCreador
          reserva={formulario.id}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo={titulo}
        />
      )}
      {reservaEstado && (
        <AppEstadoDialog
          stateKey='reservas'
          titulo={`Cambiar Estado: ${reservaEstado.codigo_reserva}`}
          registro={reservaEstado}
          opciones={ESTADOS_RESERVA}
          thunk={onCambiarEstado}
          handleOnClose={() => setReservaEstado(null)}
          updateColeccion={updateColeccion}
        />
      )}
    </>
  );
};

Reserva.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Reserva;
