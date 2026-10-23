// Vuelta del checkout al pagar una liquidación: /liquidaciones/pago?id={transacción}&pasarela=...&cuenta=...
// Consulta la transacción (eso también aplica el pago si el webhook aún no llegó) y lleva al detalle.
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';

const REINTENTOS = 5;
const ESPERA_MS = 4000;

const ESTADOS = {
  aprobado: { icono: CheckCircleIcon, color: 'success.main', titulo: 'Pago recibido', texto: 'Gracias: la liquidación quedó pagada.' },
  pendiente: { icono: HourglassTopIcon, color: 'warning.main', titulo: 'Pago en proceso', texto: 'La pasarela aún no confirma el pago. Te avisaremos por correo cuando se apruebe.' },
  rechazado: { icono: CancelIcon, color: 'error.main', titulo: 'Pago rechazado', texto: 'La pasarela rechazó el pago. Puedes intentarlo de nuevo desde la liquidación.' },
};

const ResultadoPagoLiquidacion = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const transaccionId = searchParams.get('id');
  const pasarela = searchParams.get('pasarela');
  const cuenta = searchParams.get('cuenta');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(transaccionId ? '' : 'No recibimos información del pago.');
  const intentos = useRef(0);

  useEffect(() => {
    if (!transaccionId) return undefined;
    let temporizador;
    const consultar = () => {
      intentos.current += 1;
      jwtAxios
        .get(`publico/pagos/transaccion/${encodeURIComponent(transaccionId)}`, {
          params: { ...(pasarela ? { pasarela } : {}), ...(cuenta ? { cuenta } : {}) },
        })
        .then(({ data }) => {
          setResultado(data);
          if (data.estado_pago === 'pendiente' && intentos.current < REINTENTOS) {
            temporizador = setTimeout(consultar, ESPERA_MS);
          }
        })
        .catch((e) => setError(extraerMensajeError(e)));
    };
    consultar();
    return () => clearTimeout(temporizador);
  }, [transaccionId, pasarela, cuenta]);

  const estado = ESTADOS[resultado?.estado_pago] ?? (resultado ? ESTADOS.rechazado : null);
  const Icono = estado?.icono;
  const liquidacion = resultado?.liquidacion;

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', mt: 6 }}>
      <Card sx={{ boxShadow: '0px 0px 5px 2px rgb(0 0 0 / 8%)' }}>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          {error && <Alert severity='error'>{error}</Alert>}
          {!error && !resultado && <LinearProgress />}
          {estado && (
            <>
              <Icono sx={{ fontSize: 64, color: estado.color }} />
              <Typography variant='h2' sx={{ fontWeight: 'bold', mt: 2 }}>
                {estado.titulo}
              </Typography>
              {liquidacion && (
                <Typography color='text.secondary' sx={{ mt: 1 }}>
                  Liquidación {liquidacion.codigo}
                </Typography>
              )}
              <Typography sx={{ mt: 2 }}>{estado.texto}</Typography>
            </>
          )}
          <Button
            variant='contained'
            sx={{ mt: 4 }}
            onClick={() => navigate(liquidacion ? `/liquidaciones/${liquidacion.id}/ver` : '/liquidaciones')}
          >
            {liquidacion ? 'Ver liquidación' : 'Ir a liquidaciones'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResultadoPagoLiquidacion;
