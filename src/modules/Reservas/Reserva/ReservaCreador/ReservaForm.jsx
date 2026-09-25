import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { Alert, Divider } from '@mui/material';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import MySelectField from '../../../../shared/components/MySelectField';
import MyCurrencyField from '../../../../shared/components/MyCurrencyField';
import MyDatePicker from '../../../../shared/components/MyDatePicker';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import { onShow as onShowExperiencia } from '../../../../@crema/redux/features/experiencias/experienciasSlice';
import { onGetColeccion as onGetDisponibilidad } from '../../../../@crema/redux/features/experienciaDisponibilidad/experienciaDisponibilidadSlice';
import {
  ESTADOS_RESERVA,
  IDIOMAS,
  aHoraCorta,
  formatoMoneda,
  nombreDe,
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
  const [precioBase, setPrecioBase] = useState(null);
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
        setPrecioBase(Number(experiencia.precio_desde) || null);
        if (experiencia.idioma && !values.idioma) {
          setFieldValue('idioma', experiencia.idioma);
        }
      })
      .catch(() => setFieldValue('proveedor_id', ''));
    setFieldValue('disponibilidad_id', '');
    dispatch(
      onGetDisponibilidad({
        filtros: { experiencia_id: values.experiencia_id, fecha_desde: moment().format('YYYY-MM-DD') },
      }),
    );
  }, [values.experiencia_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Valor sugerido = precio desde × personas (el usuario puede ajustarlo).
  useEffect(() => {
    if (esCreacion && precioBase && values.cantidad_personas) {
      setFieldValue('valor_total', precioBase * Number(values.cantidad_personas));
    }
  }, [precioBase, values.cantidad_personas]); // eslint-disable-line react-hooks/exhaustive-deps

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

      <Divider className='campo-completo'>Experiencia</Divider>
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
      <MyDatePicker label='Fecha *' name='fecha' disabled={disabled} />
      <MyTextField fullWidth label='Hora' name='hora_inicio' type='time' InputLabelProps={{ shrink: true }} disabled={disabled} />

      <Divider className='campo-completo'>Cliente</Divider>
      <MyTextField fullWidth label='Nombre' name='nombre' disabled={disabled} required />
      <MyTextField fullWidth label='Correo' name='correo' type='email' disabled={disabled} required />
      <MyTextField fullWidth label='Teléfono' name='telefono' disabled={disabled} required />
      <MySelectField fullWidth variant='standard' label='Residencia' name='residencia' options={RESIDENCIAS} disabled={!esCreacion} ninguno />
      <MyTextField fullWidth label='Cantidad de Personas' name='cantidad_personas' type='number' disabled={disabled} required />
      <MyTextField fullWidth label='De los cuales niños' name='cantidad_chicos' type='number' disabled={disabled} />
      <MySelectField fullWidth variant='standard' label='Idioma' name='idioma' options={IDIOMAS} disabled={!esCreacion} ninguno />
      <MySelectField fullWidth variant='standard' label='Cupón' name='cupon_id' options={cupones} disabled={!esCreacion} ninguno />

      <Divider className='campo-completo'>Valor</Divider>
      <MyCurrencyField fullWidth label='Valor Total' name='valor_total' disabled={disabled} required />
      {esCreacion && precioBase ? (
        <Alert severity='success' sx={{ py: 0 }}>
          Sugerido: {formatoMoneda(precioBase)} × {values.cantidad_personas || 0}
        </Alert>
      ) : (
        <span />
      )}
      <MyTextField className='campo-completo' fullWidth multiline minRows={2} label='Observaciones del Cliente' name='observaciones' disabled={disabled} />
      <MyTextField className='campo-completo' fullWidth multiline minRows={2} label='Notas Internas' name='notas' disabled={disabled} />
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
