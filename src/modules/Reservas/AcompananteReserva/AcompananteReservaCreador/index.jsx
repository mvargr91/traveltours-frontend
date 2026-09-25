import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../shared/components/MyTextField';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/acompanantesReserva/acompanantesReservaSlice';
import { enteroOpcional } from '../../../../shared/functions/ValidacionesYup';

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido').max(150, 'Máximo 150 caracteres'),
  correo: yup.string().email('Correo inválido').max(150, 'Máximo 150 caracteres').nullable(),
  telefono: yup.string().max(30, 'Máximo 30 caracteres').matches(/^[+]?[0-9\s-]*$/, 'Teléfono inválido').nullable(),
  documento: yup.string().max(50, 'Máximo 50 caracteres').nullable(),
  edad: enteroOpcional().min(0, 'No puede ser negativa').max(120, 'Edad inválida'),
});

const AcompananteReservaCreador = (props) => {
  const { acompanante, reservaId, accion, handleOnClose, updateColeccion, titulo } = props;
  const disabled = accion === 'ver';

  const initialValues = (registro) => ({
    id: registro?.id ?? '',
    reserva_id: registro?.reserva_id ?? Number(reservaId),
    nombre: registro?.nombre ?? '',
    documento: registro?.documento ?? '',
    edad: registro?.edad ?? '',
    correo: registro?.correo ?? '',
    telefono: registro?.telefono ?? '',
  });

  return (
    <AppCrudDialog
      stateKey='acompanantesReserva'
      registroId={acompanante}
      accion={accion}
      handleOnClose={handleOnClose}
      updateColeccion={updateColeccion}
      onShow={onShow}
      onCreate={onCreate}
      onUpdate={onUpdate}
      resetActual={resetActual}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({ saving }) => (
        <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
          <MyTextField className='campo-completo' autoFocus fullWidth label='Nombre' name='nombre' disabled={disabled} required />
          <MyTextField fullWidth label='Documento' name='documento' disabled={disabled} />
          <MyTextField fullWidth label='Edad' name='edad' type='number' disabled={disabled} />
          <MyTextField fullWidth label='Correo' name='correo' type='email' disabled={disabled} />
          <MyTextField fullWidth label='Teléfono' name='telefono' disabled={disabled} />
        </AppCrudForm>
      )}
    </AppCrudDialog>
  );
};

AcompananteReservaCreador.propTypes = {
  acompanante: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  reservaId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default AcompananteReservaCreador;
