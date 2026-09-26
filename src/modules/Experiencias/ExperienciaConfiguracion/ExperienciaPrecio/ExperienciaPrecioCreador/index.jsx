import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { Box, Typography } from '@mui/material';
import AppCrudDialog from '../../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../../shared/components/AppCrudForm';
import MyTextField from '../../../../../shared/components/MyTextField';
import MyRadioField from '../../../../../shared/components/MyRadioField';
import MySelectField from '../../../../../shared/components/MySelectField';
import {
  CantidadesPrecio,
  esquemaPrecio,
  precioAParams,
  precioInicial,
} from '../../../../../shared/components/PreciosExperiencia';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../../@crema/redux/features/experienciaPrecios/experienciaPreciosSlice';
import { OPCIONES_ESTADO, TIPOS_PRECIO, aRadio, esActivo } from '../../../../../shared/constants/Turismo';
import { creadorPropTypes } from '../../propTypes';

const validationSchema = yup.object(esquemaPrecio);

// El estado va como radio ('1'/'0') en este formulario; la API espera booleano y cantidades numéricas.
const transformarAntesDeEnviar = ({ estado, ...valores }) => precioAParams({ ...valores, estado: esActivo(estado) });

const ExperienciaPrecioCreador = (props) => {
  const { precio, experienciaId, accion, handleOnClose, updateColeccion, titulo } = props;
  const disabled = accion === 'ver';

  const initialValues = (registro) => ({
    ...precioInicial(registro ?? { cantidades: [{ cantidad: 1, valor: null }] }),
    experiencia_id: registro?.experiencia_id ?? Number(experienciaId),
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
      transformarAntesDeEnviar={transformarAntesDeEnviar}
    >
      {({ saving }) => (
        <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
          <MyTextField className='campo-completo' autoFocus fullWidth label='Descripción' name='descripcion' placeholder='Ej: Tarifa adulto temporada alta' disabled={disabled} required />
          <MySelectField fullWidth variant='standard' label='Tipo' name='tipo' options={TIPOS_PRECIO} disabled={disabled} required />
          <MyRadioField label='Estado' name='estado' disabled={disabled} options={OPCIONES_ESTADO} />
          <Box className='campo-completo'>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>Cantidades</Typography>
            <CantidadesPrecio name='cantidades' disabled={disabled} />
          </Box>
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
