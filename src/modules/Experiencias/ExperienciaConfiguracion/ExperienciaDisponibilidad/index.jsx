import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Box, Button } from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AppCrudTable from '../../../../shared/components/AppCrudTable';
import useCrudModulo from '../../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../../@crema/redux/features/experienciaDisponibilidad/experienciaDisponibilidadSlice';
import {
  ESTADOS_DISPONIBILIDAD,
  aHoraCorta,
  colorDe,
  nombreDe,
} from '../../../../shared/constants/Turismo';
import { pestanaPropTypes } from '../propTypes';
import ExperienciaDisponibilidadCreador from './ExperienciaDisponibilidadCreador';
import SalidasMultiples from './SalidasMultiples';

const cells = [
  { id: 'fecha', typeHead: 'string', label: 'Salida', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'fecha_fin', typeHead: 'string', label: 'Regreso', value: (v) => v ?? '', align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'hora_inicio', typeHead: 'string', label: 'Hora Inicio', value: aHoraCorta, align: 'left', mostrarInicio: true },
  { id: 'hora_fin', typeHead: 'string', label: 'Hora Fin', value: aHoraCorta, align: 'left', mostrarInicio: true },
  { id: 'horario_id', typeHead: 'string', label: 'Origen', value: (v) => (v ? 'Horario semanal' : 'Manual'), align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'capacidad', typeHead: 'numeric', label: 'Capacidad', value: (v) => v, align: 'right', mostrarInicio: true },
  { id: 'cupos_disponibles', typeHead: 'numeric', label: 'Cupos Disponibles', value: (v) => v, align: 'right', mostrarInicio: true },
  {
    id: 'estado',
    typeHead: 'string',
    label: 'Estado',
    value: (v) => nombreDe(ESTADOS_DISPONIBILIDAD, v),
    cellColor: (v) => colorDe(ESTADOS_DISPONIBILIDAD, v),
    align: 'left',
    mostrarInicio: true,
  },
];

const filtrosConfig = [
  { name: 'fecha_desde', label: 'Desde', type: 'date' },
  { name: 'fecha_hasta', label: 'Hasta', type: 'date' },
];

const ExperienciaDisponibilidad = ({ experienciaId, permisos, urlAyuda }) => {
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();
  // La experiencia ya la cargó la pantalla de configuración: de ella salen la duración y la capacidad por defecto.
  const experiencia = useSelector((state) => state.experiencias.actual);
  const [variasSalidas, setVariasSalidas] = useState(false);
  const [aviso, setAviso] = useState('');
  const puedeCrear = permisos.includes('Crear') || permisos.includes('Modificar');

  return (
    <>
      {puedeCrear && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, px: '20px', pt: '20px', mb: -2 }}>
          {aviso && <Alert severity='success' onClose={() => setAviso('')} sx={{ flex: 1, py: 0 }}>{aviso}</Alert>}
          <Button variant='contained' startIcon={<DateRangeIcon />} onClick={() => setVariasSalidas(true)}>
            Agregar varias salidas
          </Button>
        </Box>
      )}
      <AppCrudTable
        stateKey='experienciaDisponibilidad'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        filtrosFijos={{ experiencia_id: experienciaId }}
        paginado={false}
        titulo='Disponibilidad por Fecha'
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Disponibilidad'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
      />
      {variasSalidas && (
        <SalidasMultiples
          experienciaId={experienciaId}
          duracionDias={Number(experiencia?.duracion_dias) || 1}
          capacidad={experiencia?.capacidad_maxima ?? ''}
          onClose={() => setVariasSalidas(false)}
          onCreadas={(mensaje) => {
            setAviso(mensaje);
            updateColeccion();
          }}
        />
      )}
      {formulario && (
        <ExperienciaDisponibilidadCreador
          disponibilidad={formulario.id}
          experienciaId={experienciaId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Disponibilidad'
        />
      )}
    </>
  );
};

ExperienciaDisponibilidad.propTypes = pestanaPropTypes;

export default ExperienciaDisponibilidad;
