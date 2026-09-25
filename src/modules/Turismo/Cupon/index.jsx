import React from 'react';
import PropTypes from 'prop-types';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/cupones/cuponesSlice';
import {
  TIPOS_DESCUENTO,
  colorActivo,
  formatoMoneda,
  nombreDe,
  valorActivo,
} from '../../../shared/constants/Turismo';
import CuponCreador from './CuponCreador';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
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
  { id: 'cantidad', typeHead: 'numeric', label: 'Cantidad', value: (v) => v ?? 'Ilimitado', align: 'right', mostrarInicio: true, ordenable: false },
  { id: 'fecha_inicio', typeHead: 'string', label: 'Fecha Inicio', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'fecha_fin', typeHead: 'string', label: 'Fecha Fin', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const filtrosConfig = [{ name: 'nombre', label: 'Nombre', type: 'text' }];

const Cupon = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
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
        />
      )}
    </>
  );
};

Cupon.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Cupon;
