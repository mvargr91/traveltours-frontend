import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import TourIcon from '@mui/icons-material/Tour';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/promociones/promocionesSlice';
import {
  TIPOS_DESCUENTO,
  colorActivo,
  formatoMoneda,
  nombreDe,
  valorActivo,
} from '../../../shared/constants/Turismo';
import PromocionCreador from './PromocionCreador';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'tipo_descuento', typeHead: 'string', label: 'Tipo', value: (v) => nombreDe(TIPOS_DESCUENTO, v), align: 'left', mostrarInicio: true, ordenable: false },
  {
    id: 'valor_descuento',
    typeHead: 'numeric',
    label: 'Descuento',
    value: (v, row) => (row.tipo_descuento === 'porcentaje' ? `${Number(v)} %` : formatoMoneda(v)),
    align: 'right',
    mostrarInicio: true,
    ordenable: false,
  },
  { id: 'fecha_inicio', typeHead: 'string', label: 'Fecha Inicio', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'fecha_fin', typeHead: 'string', label: 'Fecha Fin', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const filtrosConfig = [{ name: 'nombre', label: 'Nombre', type: 'text' }];

const Promocion = ({ route }) => {
  const navigate = useNavigate();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  const accionesExtra = [
    {
      titulo: 'Experiencias en Promoción',
      icono: TourIcon,
      permiso: 'Listar',
      onClick: (row) => navigate(`/promociones/${row.id}/experiencias`),
    },
  ];

  return (
    <>
      <AppCrudTable
        stateKey='promociones'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Promoción'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
        accionesExtra={accionesExtra}
      />
      {formulario && (
        <PromocionCreador
          promocion={formulario.id}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo={titulo}
        />
      )}
    </>
  );
};

Promocion.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Promocion;
