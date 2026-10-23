// Finanzas > Liquidaciones: el cobro mensual de la plataforma a cada proveedor.
// El administrador genera los borradores del mes y los emite; el proveedor ve las suyas (no los borradores),
// lo que lleva acumulado del mes y las paga en línea desde el detalle.
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import jwtAxios from '@crema/services/auth/jwt-auth';
import AppCrudTable from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import useProveedorSesion, { conProveedorPropio } from '../../../shared/hooks/useProveedorSesion';
import { onGetColeccion } from '../../../@crema/redux/features/liquidaciones/liquidacionesSlice';
import { onGetColeccionLigera as onGetProveedores } from '../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import { ESTADOS_LIQUIDACION, colorLiquidacion } from '../../../shared/constants/Finanzas';
import { formatoMoneda } from '../../../shared/constants/Turismo';
import ResumenCobro from '../ResumenCobro';
import GenerarLiquidaciones from './GenerarLiquidaciones';

const dinero = (v) => formatoMoneda(v);

const Liquidacion = ({ route }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { refreshKey, updateColeccion } = useCrudModulo();
  const proveedoresLigera = useSelector((state) => state.proveedoresTuristicos.coleccionLigera);
  const { proveedor, esProveedor } = useProveedorSesion();
  const [generando, setGenerando] = useState(false);
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    if (!esProveedor) dispatch(onGetProveedores());
  }, [dispatch, esProveedor]);

  // El proveedor ve arriba su modelo y lo que lleva acumulado para la próxima liquidación.
  useEffect(() => {
    if (!esProveedor) return;
    jwtAxios.get('liquidaciones/resumen').then(({ data }) => setResumen(data)).catch(() => setResumen(null));
  }, [esProveedor, refreshKey]);

  const proveedores = conProveedorPropio(
    proveedoresLigera.map((p) => ({ id: p.id, nombre: p.nombre_comercial ?? p.nombre })),
    proveedor,
  );

  const cells = [
    { id: 'codigo', typeHead: 'string', label: 'Código', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
    { id: 'proveedor_nombre', typeHead: 'string', label: 'Proveedor', value: (v) => v, align: 'left', mostrarInicio: !esProveedor, ordenable: false },
    { id: 'periodo_nombre', typeHead: 'string', label: 'Mes', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
    { id: 'tipo_modelo_nombre', typeHead: 'string', label: 'Modelo', value: (v) => v, align: 'left', mostrarInicio: false, ordenable: false },
    { id: 'total_comisiones', typeHead: 'numeric', label: 'Comisiones', value: dinero, align: 'right', mostrarInicio: false, ordenable: false },
    { id: 'valor_suscripcion', typeHead: 'numeric', label: 'Suscripción', value: dinero, align: 'right', mostrarInicio: false, ordenable: false },
    { id: 'total', typeHead: 'numeric', label: 'Total (con IVA)', value: dinero, align: 'right', mostrarInicio: true, ordenable: false },
    { id: 'valor_pagado', typeHead: 'numeric', label: 'Pagado', value: dinero, align: 'right', mostrarInicio: true, ordenable: false },
    {
      id: 'saldo',
      typeHead: 'numeric',
      label: 'Saldo',
      value: dinero,
      cellColor: (v, row) => (Number(v) > 0 && row?.estado === 'emitida' ? 'red' : ''),
      align: 'right',
      mostrarInicio: true,
      ordenable: false,
    },
    {
      id: 'estado_nombre',
      typeHead: 'string',
      label: 'Estado',
      value: (v) => v,
      cellColor: (_v, row) => colorLiquidacion(row),
      align: 'left',
      mostrarInicio: true,
      ordenable: false,
    },
    { id: 'fecha_vencimiento', typeHead: 'string', label: 'Vence', value: (v) => v ?? '', align: 'left', mostrarInicio: true, ordenable: false },
    { id: 'factura_numero', typeHead: 'string', label: 'Factura', value: (v) => v ?? '', align: 'left', mostrarInicio: false, ordenable: false },
  ];

  const filtrosConfig = [
    { name: 'periodo', label: 'Mes (AAAA-MM)', type: 'text' },
    { name: 'proveedor_id', label: 'Proveedor', type: 'select', options: proveedores, fijo: proveedor?.id },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      options: esProveedor ? ESTADOS_LIQUIDACION.filter((e) => e.id !== 'borrador') : ESTADOS_LIQUIDACION,
    },
  ];

  return (
    <Box>
      {esProveedor && resumen?.modelo !== undefined && (
        <Box sx={{ px: '20px', pt: '20px' }}>
          <ResumenCobro resumen={resumen} />
        </Box>
      )}
      <AppCrudTable
        stateKey='liquidaciones'
        onGetColeccion={onGetColeccion}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        subtitulo={
          esProveedor
            ? 'Lo que la plataforma te cobra cada mes según tu modelo de cobro. Ábrela para ver el detalle por reserva y pagarla en línea.'
            : 'Cobro mensual a cada proveedor. El día 1 se generan los borradores del mes anterior: revísalos y emítelos para enviárselos.'
        }
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Liquidación'
        refreshKey={refreshKey}
        defaultOrderBy=''
        onCrear={() => setGenerando(true)}
        onVer={(row) => navigate(`${route.path}/${row.id}/ver`)}
      />
      {generando && (
        <GenerarLiquidaciones
          proveedores={proveedores}
          handleOnClose={() => setGenerando(false)}
          onGenerado={() => {
            setGenerando(false);
            updateColeccion();
          }}
        />
      )}
    </Box>
  );
};

Liquidacion.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Liquidacion;
