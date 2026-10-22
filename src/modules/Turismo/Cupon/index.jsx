import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/cupones/cuponesSlice';
import { onGetColeccionLigera as onGetProveedores } from '../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import useProveedorSesion, { conProveedorPropio } from '../../../shared/hooks/useProveedorSesion';
import {
  TIPOS_DESCUENTO,
  colorActivo,
  formatoMoneda,
  nombreDe,
  valorActivo,
} from '../../../shared/constants/Turismo';
import CuponCreador from './CuponCreador';

const cells = [
  { id: 'codigo', typeHead: 'string', label: 'Código', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'proveedor_nombre', typeHead: 'string', label: 'Proveedor', value: (v) => v ?? 'Plataforma', align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'tipo', typeHead: 'string', label: 'Tipo', value: (v) => nombreDe(TIPOS_DESCUENTO, v), align: 'left', mostrarInicio: true },
  {
    id: 'descuento',
    typeHead: 'numeric',
    label: 'Descuento',
    value: (v, row) => (row.tipo === 'porcentaje' ? `${Number(v ?? 0)} %` : formatoMoneda(row.valor)),
    align: 'right',
    mostrarInicio: true,
    ordenable: false,
  },
  {
    id: 'usos',
    typeHead: 'numeric',
    label: 'Usos',
    value: (v, row) => `${v ?? 0} / ${row.cantidad ?? '∞'}`,
    align: 'right',
    mostrarInicio: true,
    ordenable: false,
  },
  { id: 'fecha_inicio', typeHead: 'string', label: 'Fecha Inicio', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'fecha_fin', typeHead: 'string', label: 'Fecha Fin', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const Cupon = ({ route }) => {
  const dispatch = useDispatch();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
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
    { name: 'codigo', label: 'Código', type: 'text' },
    { name: 'nombre', label: 'Nombre', type: 'text' },
    { name: 'proveedor_id', label: 'Proveedor', type: 'select', options: proveedores, fijo: proveedor?.id },
  ];
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='cupones'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Cupón'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
      />
      {formulario && (
        <CuponCreador
          cupon={formulario.id}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo={titulo}
          proveedores={proveedores}
          proveedorPropio={proveedor}
        />
      )}
    </>
  );
};

Cupon.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Cupon;
