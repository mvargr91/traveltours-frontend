// Finanzas > Modelos de cobro (solo administración): cuánto le cobra la plataforma a cada proveedor.
// Cada fila es un proveedor con el modelo de este mes; el detalle permite cambiarlo y ver el historial.
import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AppCrudTable from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import { onGetColeccion } from '../../../@crema/redux/features/modelosCobro/modelosCobroSlice';
import { TIPOS_COBRO, nombrePeriodo, resumenModelo } from '../../../shared/constants/Finanzas';
import { formatoMoneda } from '../../../shared/constants/Turismo';

const cells = [
  { id: 'proveedor_nombre', typeHead: 'string', label: 'Proveedor', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  {
    id: 'tipo_nombre',
    typeHead: 'string',
    label: 'Modelo',
    value: (v) => v,
    cellColor: (_v, row) => (row?.tipo ? '' : '#F9A825'),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  {
    id: 'valor',
    typeHead: 'string',
    label: 'Cobro',
    value: (_v, row) => (row.tipo ? resumenModelo(row, formatoMoneda) : ''),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  {
    id: 'vigente_desde',
    typeHead: 'string',
    label: 'Desde',
    value: (v) => (v ? nombrePeriodo(String(v).slice(0, 7)) : ''),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  {
    id: 'proximo_cambio',
    typeHead: 'string',
    label: 'Cambio programado',
    value: (v) => (v ? `Desde ${nombrePeriodo(v)}` : ''),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  {
    id: 'pasarela_activa',
    typeHead: 'string',
    label: 'Pago en línea',
    value: (v) => (v ? 'Sí' : 'No'),
    cellColor: (v) => (v ? 'green' : ''),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
  {
    id: 'suspendido_por_mora',
    typeHead: 'string',
    label: 'En mora',
    value: (v) => (v ? 'Sí' : 'No'),
    cellColor: (v) => (v ? 'red' : ''),
    align: 'left',
    mostrarInicio: true,
    ordenable: false,
  },
];

const filtrosConfig = [
  { name: 'nombre', label: 'Proveedor', type: 'text' },
  { name: 'tipo', label: 'Modelo', type: 'select', options: [...TIPOS_COBRO, { id: 'sin_modelo', nombre: 'Sin modelo' }] },
];

const ModeloCobro = ({ route }) => {
  const navigate = useNavigate();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);

  return (
    <AppCrudTable
      stateKey='modelosCobro'
      onGetColeccion={onGetColeccion}
      cells={cells}
      filtrosConfig={filtrosConfig}
      titulo={titulo}
      subtitulo='Suscripción (valor fijo al mes), comisión (porcentaje de cada reserva finalizada) o ambas. Los valores van sin IVA. Un proveedor recibe el modelo por defecto (Parámetros: COBRO_*) al aprobarse.'
      urlAyuda={urlAyuda}
      permisos={permisos}
      entidadNombre='Modelo de cobro'
      defaultOrderBy=''
      onVer={(row) => navigate(`${route.path}/${row.id}`)}
    />
  );
};

ModeloCobro.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default ModeloCobro;
