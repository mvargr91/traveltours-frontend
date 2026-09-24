import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../../shared/components/MyTextField';
import MyRadioField from '../../../../../shared/components/MyRadioField';
import MySelectField from '../../../../../shared/components/MySelectField';
import MyCurrencyField from '../../../../../shared/components/MyCurrencyField';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../../@crema/redux/features/experienciaPrecios/experienciaPreciosSlice';
import { OPCIONES_ESTADO, TIPOS_PRECIO, aRadio } from '../../../../../shared/constants/Turismo';
import { enteroOpcional, numeroRequerido } from '../../../../../shared/functions/ValidacionesYup';
import { creadorPropTypes } from '../../propTypes';

const validationSchema = yup.object({
  descripcion: yup.string().required('Requerido').max(150, 'Máximo 150 caracteres'),
  tipo: yup.string().required('Requerido').max(50, 'Máximo 50 caracteres'),
  cantidad: enteroOpcional().min(1, 'Mínimo 1'),
  precio: numeroRequerido().min(0, 'No puede ser negativo'),
});

const ExperienciaPrecioCreador = (props) => {
  const { precio, experienciaId, accion, handleOnClose, updateColeccion, titulo } = props;
  const disabled = accion === 'ver';

  const initialValues = (registro) => ({
    id: registro?.id ?? '',
    experiencia_id: registro?.experiencia_id ?? Number(experienciaId),
    descripcion: registro?.descripcion ?? '',
    tipo: registro?.tipo ?? 'adulto',
    cantidad: registro?.cantidad ?? 1,
    precio: registro?.precio ?? '',
    estado: aRadio(registro?.estado),
  });

  return (
    <AppCrudDialog
      stateKey='experienciaPrecios'
      registroId={precio}
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
          <MyTextField className='campo-completo' autoFocus fullWidth label='Descripción' name='descripcion' placeholder='Ej: Tarifa adulto temporada alta' disabled={disabled} required />
          <MySelectField fullWidth variant='standard' label='Tipo' name='tipo' options={TIPOS_PRECIO} disabled={disabled} required />
          <MyTextField fullWidth label='Cantidad de Personas' name='cantidad' type='number' disabled={disabled} />
          <MyCurrencyField fullWidth label='Precio' name='precio' disabled={disabled} required />
          <MyRadioField label='Estado' name='estado' disabled={disabled} options={OPCIONES_ESTADO} />
        </AppCrudForm>
      )}
    </AppCrudDialog>
  );
};

ExperienciaPrecioCreador.propTypes = {
  ...creadorPropTypes,
  precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ExperienciaPrecioCreador;
