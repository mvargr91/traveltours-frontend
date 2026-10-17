// Reservas del cliente autenticado. El backend filtra por el usuario del token (AlcancePorRol).
// Pestañas: próximas (vigentes desde hoy, la más cercana primero), pasadas y todas.
// Las finalizadas sin reseña se pueden calificar desde aquí.
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import StarRateIcon from '@mui/icons-material/StarRate';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Swal from 'sweetalert2';
import AppCrudTable from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onCambiarEstado } from '../../../@crema/redux/features/reservas/reservasSlice';
import { showMessage } from '../../../@crema/redux/features/cammon/commonSlice';
import { CREATE_TYPE } from '../../../shared/constants/Constantes';
import {
  ESTADOS_RESERVA,
  PERIODOS_RESERVA,
  aHoraCorta,
  colorDe,
  formatoMoneda,
  nombreDe,
} from '../../../shared/constants/Turismo';
import ResenaDialog from '../MisResenas/ResenaDialog';

const cells = [
  { id: 'codigo_reserva', typeHead: 'string', label: 'Código', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'experiencia_nombre', typeHead: 'string', label: 'Experiencia', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'fecha', typeHead: 'string', label: 'Fecha', value: (v, row) => `${v ?? ''} ${aHoraCorta(row.hora_inicio)}`.trim(), align: 'left', mostrarInicio: true },
  { id: 'cantidad_personas', typeHead: 'numeric', label: 'Personas', value: (v) => v, align: 'right', mostrarInicio: true, ordenable: false },
  { id: 'valor_total', typeHead: 'numeric', label: 'Valor', value: formatoMoneda, align: 'right', mostrarInicio: true },
  { id: 'valor_pagado', typeHead: 'numeric', label: 'Pagado', value: formatoMoneda, align: 'right', mostrarInicio: false, ordenable: false },
  {
    id: 'estado',
    typeHead: 'string',
    label: 'Estado',
    value: (v) => nombreDe(ESTADOS_RESERVA, v),
    cellColor: (v) => colorDe(ESTADOS_RESERVA, v),
    align: 'left',
    mostrarInicio: true,
  },
];

const filtrosConfig = [{ name: 'estado', label: 'Estado', type: 'select', options: ESTADOS_RESERVA }];

const MisReservas = ({ route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const { permisos: permisosResenas } = usePermisosOpcion('/mis-resenas');
  const { refreshKey, updateColeccion } = useCrudModulo();
  const [periodo, setPeriodo] = useState('proximas');
  const [porCalificar, setPorCalificar] = useState(null);

  const cancelar = (row) => {
    Swal.fire({
      title: 'Cancelar reserva',
      text: `¿Seguro que desea cancelar la reserva ${row.codigo_reserva}?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
    }).then((resultado) => {
      if (resultado.isConfirmed) {
        dispatch(onCambiarEstado({ params: { id: row.id, estado: 'cancelada' }, updateColeccion }));
      }
    });
  };

  const accionesExtra = [
    {
      titulo: 'Calificar experiencia',
      icono: StarRateIcon,
      permiso: 'Listar',
      color: '#FFB400',
      visible: (row) => row.estado === 'finalizada' && !row.resena_id && permisosResenas.includes('Crear'),
      onClick: setPorCalificar,
    },
    {
      titulo: 'Ver mi reseña',
      icono: RateReviewIcon,
      permiso: 'Listar',
      visible: (row) => Boolean(row.resena_id) && permisosResenas.includes('Listar'),
      onClick: () => navigate('/mis-resenas'),
    },
    {
      titulo: 'Cancelar Reserva',
      icono: EventBusyIcon,
      permiso: 'Modificar',
      color: theme.palette.redBottoms,
      visible: (row) => ['pendiente', 'aceptada'].includes(row.estado),
      onClick: cancelar,
    },
  ];

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <Box sx={{ px: 2 }}>
          <Tabs value={periodo} onChange={(_, valor) => setPeriodo(valor)}>
            {PERIODOS_RESERVA.map((p) => (
              <Tab key={p.id} value={p.id} label={p.nombre} sx={{ textTransform: 'none', fontWeight: 600 }} />
            ))}
          </Tabs>
        </Box>
      </Card>
      <AppCrudTable
        stateKey='reservas'
        onGetColeccion={onGetColeccion}
        cells={cells}
        filtrosConfig={filtrosConfig}
        filtrosFijos={{ periodo }}
        defaultOrderBy=''
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Reserva'
        refreshKey={refreshKey}
        accionesExtra={accionesExtra}
      />
      <ResenaDialog
        abierto={Boolean(porCalificar)}
        reserva={porCalificar}
        onClose={() => setPorCalificar(null)}
        onGuardado={(mensaje) => {
          setPorCalificar(null);
          dispatch(showMessage([mensaje, CREATE_TYPE]));
          updateColeccion();
        }}
      />
    </>
  );
};

MisReservas.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default MisReservas;
