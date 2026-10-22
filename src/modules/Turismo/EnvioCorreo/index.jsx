// Marketing > Envíos de correo: correos a los clientes de un proveedor y su avance.
// El administrador ve los de todos los proveedores; el proveedor, solo los suyos (filtro fijo).
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppCrudTable from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import useProveedorSesion, { conProveedorPropio } from '../../../shared/hooks/useProveedorSesion';
import { onGetColeccion } from '../../../@crema/redux/features/enviosCorreo/enviosCorreoSlice';
import { onGetColeccionLigera as onGetProveedores } from '../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';

const cells = [
  { id: 'fecha_creacion', typeHead: 'string', label: 'Fecha', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'asunto', typeHead: 'string', label: 'Asunto', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'proveedor_nombre', typeHead: 'string', label: 'Proveedor', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'audiencia_nombre', typeHead: 'string', label: 'Para', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  {
    id: 'enviados',
    typeHead: 'string',
    label: 'Enviados',
    value: (v, row) => `${v} de ${row.total}${row.errores ? ` · ${row.errores} con error` : ''}`,
    cellColor: (_v, row) => (row?.errores ? 'red' : ''),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  {
    id: 'estado_nombre',
    typeHead: 'string',
    label: 'Estado',
    value: (v) => v,
    cellColor: (_v, row) => (row?.estado === 'completado' ? 'green' : '#F9A825'),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  { id: 'usuario_creacion_nombre', typeHead: 'string', label: 'Enviado por', value: (v) => v, align: 'left', mostrarInicio: false, ordenable: false },
];

const EnvioCorreo = ({ route }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey } = useCrudModulo();
  const proveedoresLigera = useSelector((state) => state.proveedoresTuristicos.coleccionLigera);
  const { proveedor } = useProveedorSesion();

  useEffect(() => {
    dispatch(onGetProveedores());
  }, [dispatch]);

  const proveedores = conProveedorPropio(
    proveedoresLigera.map((p) => ({ id: p.id, nombre: p.nombre_comercial ?? p.nombre })),
    proveedor,
  );

  const filtrosConfig = [
    { name: 'asunto', label: 'Asunto', type: 'text' },
    { name: 'proveedor_id', label: 'Proveedor', type: 'select', options: proveedores, fijo: proveedor?.id },
  ];

  return (
    <AppCrudTable
      stateKey='enviosCorreo'
      onGetColeccion={onGetColeccion}
      cells={cells}
      filtrosConfig={filtrosConfig}
      titulo={titulo}
      subtitulo='Correos a los clientes de un proveedor (todos, los de una experiencia, los que tienen reserva próxima o los que elijas). Cada uno sale personalizado con el nombre del cliente.'
      urlAyuda={urlAyuda}
      permisos={permisos}
      entidadNombre='Envío'
      refreshKey={refreshKey}
      defaultOrderBy=''
      onCrear={() => navigate(`${route.path}/crear`)}
      onVer={(row) => navigate(`${route.path}/${row.id}/ver`)}
    />
  );
};

EnvioCorreo.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default EnvioCorreo;
