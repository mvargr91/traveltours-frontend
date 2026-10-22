import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { Alert, Box, TextField } from '@mui/material';
import AppCrudForm, { SeccionForm } from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MySelectField from '../../../../shared/components/MySelectField';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyDatePicker from '../../../../shared/components/MyDatePicker';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import HistorialReserva from '../../../../shared/components/HistorialReserva';
import PagosReserva from './PagosReserva';
import { onShow as onShowExperiencia } from '../../../../@crema/redux/features/experiencias/experienciasSlice';
import { onGetColeccionLigera as onGetCupones } from '../../../../@crema/redux/features/cupones/cuponesSlice';
import { onGetColeccion as onGetDisponibilidad } from '../../../../@crema/redux/features/experienciaDisponibilidad/experienciaDisponibilidadSlice';
import {
  ESTADOS_RESERVA,
  IDIOMAS,
  aHoraCorta,
  formatoMoneda,
  nombreDe,
  descuentoCupon,
  valorPorPersona,
} from '../../../../shared/constants/Turismo';

const RESIDENCIAS = [
  { id: 'nacional', nombre: 'Nacional' },
  { id: 'extranjero', nombre: 'Extranjero' },
];

const ReservaForm = (props) => {
  const {
    values,
    setFieldValue,
    registro,
    accion,
    titulo,
    handleOnClose,
    saving,
    experiencias,
    cupones,
    usuarios,
  } = props;
  const dispatch = useDispatch();
  const disabled = accion === 'ver';
  const esCreacion = accion === 'crear';
  const [experienciaElegida, setExperienciaElegida] = useState(null);
  const disponibilidades = useSelector((state) => state.experienciaDisponibilidad.rows);

  // La colección ligera solo trae experiencias publicadas; al editar se conserva la de la reserva.
  const opcionesExperiencia = useMemo(() => {
    if (registro && !experiencias.some((e) => e.id === registro.experiencia_id)) {
      return [...experiencias, { id: registro.experiencia_id, nombre: `Experiencia #${registro.experiencia_id}` }];
    }
    return experiencias;
  }, [experiencias, registro]);

  // Al elegir la experiencia se completan proveedor/idioma y se cargan los cupos futuros.
  useEffect(() => {
    if (!esCreacion || !values.experiencia_id) {
      return;
    }
    dispatch(onShowExperiencia(values.experiencia_id))
      .unwrap()
      .then((experiencia) => {
        setFieldValue('proveedor_id', experiencia.proveedor_id);
        setExperienciaElegida(experiencia);
        if (experiencia.idioma && !values.idioma) {
          setFieldValue('idioma', experiencia.idioma);
        }
      })
      .catch(() => setFieldValue('proveedor_id', ''));
    setFieldValue('disponibilidad_id', '');
    // Solo los cupones vigentes que aplican a esta experiencia.
    setFieldValue('cupon_id', '');
    dispatch(onGetCupones({ experiencia_id: values.experiencia_id }));
    dispatch(
      onGetDisponibilidad({
        filtros: { experiencia_id: values.experiencia_id, fecha_desde: moment().format('YYYY-MM-DD') },
      }),
    );
  }, [values.experiencia_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Valor sugerido = valor por persona según el tamaño del grupo × personas, menos el cupón
  // (el usuario puede ajustarlo; el descuento del cupón que queda en la reserva lo calcula el backend).
  const personas = Number(values.cantidad_personas) || 0;
  const valorPersona = experienciaElegida && personas
    ? valorPorPersona(experienciaElegida.precios, personas, experienciaElegida.precio_desde)
    : 0;
  const cuponElegido = cupones.find((c) => String(c.id) === String(values.cupon_id));
  const descuento = descuentoCupon(cuponElegido, valorPersona * personas);
  useEffect(() => {
    if (esCreacion && valorPersona) setFieldValue('valor_total', valorPersona * personas - descuento);
  }, [valorPersona, personas, descuento]); // eslint-disable-line react-hooks/exhaustive-deps

  const opcionesDisponibilidad = disponibilidades
    .filter((d) => d.estado === 'disponible' && d.cupos_disponibles > 0)
    .map((d) => ({
      id: d.id,
      nombre: `${d.fecha} ${aHoraCorta(d.hora_inicio)} · ${d.cupos_disponibles} cupos`,
      fecha: d.fecha,
      hora_inicio: aHoraCorta(d.hora_inicio),
    }));

  useEffect(() => {
    const seleccionada = opcionesDisponibilidad.find((d) => d.id === values.disponibilidad_id);
    if (seleccionada) {
      setFieldValue('fecha', seleccionada.fecha);
      setFieldValue('hora_inicio', seleccionada.hora_inicio);
    }
  }, [values.disponibilidad_id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      {registro && (
        <Alert className='campo-completo' severity='info'>
          Reserva <strong>{registro.codigo_reserva}</strong> — Estado: <strong>{nombreDe(ESTADOS_RESERVA, registro.estado)}</strong>
          {registro.acompanantes?.length > 0 && ` — ${registro.acompanantes.length} acompañante(s)`}
        </Alert>
      )}

      <SeccionForm titulo='Experiencia' />
      <FormikAutocomplete name='experiencia_id' label='Experiencia *' options={opcionesExperiencia} disabled={!esCreacion} textFieldProps={{ variant: 'standard' }} />
      <FormikAutocomplete name='usuario_id' label='Usuario *' options={usuarios} disabled={!esCreacion} textFieldProps={{ variant: 'standard' }} />
      {esCreacion && (
        <MySelectField
          className='campo-completo'
          fullWidth
          variant='standard'
          label={opcionesDisponibilidad.length ? 'Cupo / Disponibilidad' : 'Cupo / Disponibilidad (sin cupos futuros)'}
          name='disponibilidad_id'
          options={opcionesDisponibilidad}
          ninguno
        />
      )}
      <MyDatePicker className='campo-tercio' label='Fecha *' name='fecha' disabled={disabled} />
      <MyTextField className='campo-tercio' fullWidth label='Hora' name='hora_inicio' type='time' InputLabelProps={{ shrink: true }} disabled={disabled} />
      <MySelectField className='campo-tercio' fullWidth variant='standard' label='Idioma' name='idioma' options={IDIOMAS} disabled={!esCreacion} ninguno />

      <SeccionForm titulo='Cliente' />
      <MyTextField fullWidth label='Nombre' name='nombre' disabled={disabled} required />
      <MyTextField fullWidth label='Correo' name='correo' type='email' disabled={disabled} required />
      <MyTextField fullWidth label='Teléfono' name='telefono' disabled={disabled} required />
      <MySelectField fullWidth variant='standard' label='Residencia' name='residencia' options={RESIDENCIAS} disabled={!esCreacion} ninguno />
      <MyTextField fullWidth label='Cantidad de Personas' name='cantidad_personas' type='number' disabled={disabled} required />
      <MyTextField fullWidth label='De los cuales niños' name='cantidad_chicos' type='number' disabled={disabled} />

      <SeccionForm titulo='Valor' />
      {esCreacion ? (
        <MySelectField
          fullWidth
          variant='standard'
          label={values.experiencia_id && !cupones.length ? 'Cupón (ninguno vigente para esta experiencia)' : 'Cupón'}
          name='cupon_id'
          options={cupones}
          disabled={!values.experiencia_id}
          ninguno
        />
      ) : (
        <TextField
          fullWidth
          variant='standard'
          label='Cupón'
          value={registro?.cupon_codigo ? `${registro.cupon_codigo} (−${formatoMoneda(registro.valor_descuento_cupon)})` : 'Sin cupón'}
          disabled
        />
      )}
      <MyCurrencyField fullWidth label='Valor Total' name='valor_total' disabled={disabled} required />
      {esCreacion && valorPersona > 0 && (
        <Alert className='campo-completo' severity='success' sx={{ py: 0 }}>
          Valor sugerido: {formatoMoneda(valorPersona)} × {personas} persona(s)
          {descuento > 0 && ` − cupón ${cuponElegido.codigo} ${formatoMoneda(descuento)}`}
        </Alert>
      )}

      <SeccionForm titulo='Observaciones' />
      <MyTextField fullWidth multiline minRows={3} label='Observaciones del Cliente' name='observaciones' disabled={disabled} />
      <MyTextField fullWidth multiline minRows={3} label='Notas Internas' name='notas' disabled={disabled} />

      {registro && (
        <>
          <SeccionForm titulo='Pagos' />
          <Box className='campo-completo'>
            <PagosReserva reserva={registro} soloLectura={disabled} />
          </Box>
        </>
      )}

      {registro?.historial?.length > 0 && (
        <>
          <SeccionForm titulo='Historial de estados' />
          <Box className='campo-completo'>
            <HistorialReserva historial={registro.historial} />
          </Box>
        </>
      )}
    </AppCrudForm>
  );
};

ReservaForm.propTypes = {
  values: PropTypes.object.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  registro: PropTypes.object,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  experiencias: PropTypes.array.isRequired,
  cupones: PropTypes.array.isRequired,
  usuarios: PropTypes.array.isRequired,
};

export default ReservaForm;
