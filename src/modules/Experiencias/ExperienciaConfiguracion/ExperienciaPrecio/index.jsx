import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Box, MenuItem, Paper, TextField, Typography } from '@mui/material';
import AppCrudTable from '../../../../shared/components/AppCrudTable';
import useCrudModulo from '../../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../../@crema/redux/features/experienciaPrecios/experienciaPreciosSlice';
import { onCambiarMoneda } from '../../../../@crema/redux/features/experiencias/experienciasSlice';
import {
  MONEDAS,
  TIPOS_PRECIO,
  colorActivo,
  nombreDe,
  resumenCantidades,
  valorActivo,
} from '../../../../shared/constants/Turismo';
import { pestanaPropTypes } from '../propTypes';
import ExperienciaPrecioCreador from './ExperienciaPrecioCreador';

const columnas = (moneda) => [
  { id: 'descripcion', typeHead: 'string', label: 'Descripción', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'tipo', typeHead: 'string', label: 'Tipo', value: (v) => nombreDe(TIPOS_PRECIO, v), align: 'left', mostrarInicio: true },
  { id: 'cantidades', typeHead: 'string', label: 'Valor por persona', value: (v) => resumenCantidades(v, moneda), align: 'left', mostrarInicio: true, ordenable: false },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
];

// Moneda de todos los precios de la experiencia: se guarda al elegirla.
const SelectorMoneda = ({ experienciaId, puedeModificar }) => {
  const dispatch = useDispatch();
  const experiencia = useSelector((state) => state.experiencias.actual);
  const guardando = useSelector((state) => state.experiencias.saving);
  const moneda = experiencia?.moneda ?? 'COP';

  const cambiar = (evento) => {
    const nueva = evento.target.value;
    if (nueva !== moneda) dispatch(onCambiarMoneda({ params: { id: experienciaId, moneda: nueva } }));
  };

  return (
    <Paper sx={{ mx: '20px', mt: '20px', p: '15px', boxShadow: '0px 0px 5px 5px rgb(0 0 0 / 10%)', borderRadius: '4px' }}>
      <Box display='flex' alignItems='center' gap={3} flexWrap='wrap'>
        <TextField
          select
          variant='standard'
          label='Moneda de los precios'
          value={moneda}
          onChange={cambiar}
          disabled={!puedeModificar || guardando || !experiencia}
          sx={{ minWidth: 260 }}
        >
          {MONEDAS.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              {m.nombre}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant='body2' color='text.secondary' sx={{ flex: '1 1 320px' }}>
          Todos los precios de esta experiencia se publican en esta moneda. Las reservas ya creadas conservan la moneda con la que se hicieron.
        </Typography>
      </Box>
      {moneda === 'USD' && (
        <Alert severity='info' sx={{ mt: 2 }}>
          En dólares la experiencia se ofrece como <strong>reserva</strong> (las pasarelas cobran solo en pesos). Para las comisiones se convierte
          a pesos con la TRM del parámetro <strong>TRM_USD</strong>.
        </Alert>
      )}
    </Paper>
  );
};

SelectorMoneda.propTypes = {
  experienciaId: pestanaPropTypes.experienciaId,
  puedeModificar: PropTypes.bool,
};

const ExperienciaPrecio = ({ experienciaId, permisos, urlAyuda }) => {
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();
  const moneda = useSelector((state) => state.experiencias.actual?.moneda) ?? 'COP';
  const puedeModificar = permisos.includes('Modificar');

  return (
    <>
      <SelectorMoneda experienciaId={experienciaId} puedeModificar={puedeModificar} />
      <AppCrudTable
        stateKey='experienciaPrecios'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={columnas(moneda)}
        filtrosFijos={{ experiencia_id: experienciaId }}
        paginado={false}
        titulo='Precios'
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Precio'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
      />
      {formulario && (
        <ExperienciaPrecioCreador
          precio={formulario.id}
          experienciaId={experienciaId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Precio'
        />
      )}
    </>
  );
};

ExperienciaPrecio.propTypes = pestanaPropTypes;

export default ExperienciaPrecio;
