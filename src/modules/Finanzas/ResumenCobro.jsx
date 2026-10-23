// Resumen del cobro a un proveedor: su modelo de este mes, el próximo si hay un cambio programado, lo que lleva
// acumulado para la próxima liquidación y lo que debe. Lo usan el detalle del modelo (administración) y la lista
// de liquidaciones del proveedor.
import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
import { formatoMoneda } from '../../shared/constants/Turismo';
import { nombreTipoCobro, resumenModelo } from '../../shared/constants/Finanzas';

const sombra = { boxShadow: '0px 0px 5px 2px rgb(0 0 0 / 8%)' };

const Dato = ({ titulo, valor, detalle, color }) => (
  <Box sx={{ minWidth: 180, flex: '1 1 180px' }}>
    <Typography variant='body2' color='text.secondary'>
      {titulo}
    </Typography>
    <Typography variant='h4' sx={{ fontWeight: 'bold', color }}>
      {valor}
    </Typography>
    {detalle && (
      <Typography variant='body2' color='text.secondary'>
        {detalle}
      </Typography>
    )}
  </Box>
);

Dato.propTypes = {
  titulo: PropTypes.string.isRequired,
  valor: PropTypes.node,
  detalle: PropTypes.node,
  color: PropTypes.string,
};

const ResumenCobro = ({ resumen }) => {
  if (!resumen) return null;
  const { modelo, proximo_modelo: proximo } = resumen;
  const iva = Number(resumen.porcentaje_iva) || 0;

  return (
    <Card sx={{ mb: 3, ...sombra }}>
      <CardContent>
        {resumen.suspendido_por_mora && (
          <Alert severity='error' sx={{ mb: 2 }}>
            Hay una liquidación vencida sin pagar: las experiencias no se muestran en el portal hasta que se registre el pago.
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Dato
            titulo='Modelo de cobro de este mes'
            valor={nombreTipoCobro(modelo?.tipo)}
            detalle={modelo ? `${resumenModelo(modelo, formatoMoneda)}${iva ? ` (+ IVA ${iva} %)` : ''}` : 'Aún no se le cobra nada.'}
          />
          {proximo && (
            <Dato
              titulo={`Desde ${proximo.desde_nombre}`}
              valor={nombreTipoCobro(proximo.tipo)}
              detalle={resumenModelo(proximo, formatoMoneda)}
            />
          )}
          <Dato
            titulo='Comisiones por liquidar'
            valor={formatoMoneda(resumen.comisiones_pendientes)}
            detalle={`${resumen.reservas_pendientes} reserva(s) finalizada(s) · ventas ${formatoMoneda(resumen.ventas_pendientes)}`}
          />
          <Dato
            titulo='Saldo por pagar'
            valor={formatoMoneda(resumen.saldo_por_pagar)}
            color={Number(resumen.saldo_por_pagar) > 0 ? 'error.main' : 'success.main'}
            detalle='Liquidaciones emitidas pendientes de pago'
          />
        </Box>
      </CardContent>
    </Card>
  );
};

ResumenCobro.propTypes = {
  resumen: PropTypes.object,
};

export default ResumenCobro;
