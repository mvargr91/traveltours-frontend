import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/experiencias/experienciasSlice';
import { aRadio } from '../../../../shared/constants/Turismo';
import {
  enteroOpcional,
  numeroOpcional,
  slugRequerido,
} from '../../../../shared/functions/ValidacionesYup';
import ExperienciaForm from './ExperienciaForm';

const validationSchema = yup.object({
  proveedor_id: yup.string().required('Requerido'),
  destino_id: yup.string().required('Requerido'),
  nombre: yup.string().required('Requerido').max(180, 'Máximo 180 caracteres'),
  slug: slugRequerido(200),
  precio_desde: numeroOpcional().min(0, 'No puede ser negativo'),
  capacidad_maxima: enteroOpcional().min(1, 'Mínimo 1'),
  latitud: numeroOpcional().min(-90, 'Mínimo -90').max(90, 'Máximo 90'),
  longitud: numeroOpcional().min(-180, 'Mínimo -180').max(180, 'Máximo 180'),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  proveedor_id: registro?.proveedor_id ?? '',
  destino_id: registro?.destino_id ?? '',
  nombre: registro?.nombre ?? '',
  slug: registro?.slug ?? '',
  idioma: registro?.idioma ?? 'Español',
  duracion: registro?.duracion ?? '',
  precio_desde: registro?.precio_desde ?? '',
  capacidad_maxima: registro?.capacidad_maxima ?? '',
  punto_encuentro: registro?.punto_encuentro ?? '',
  direccion: registro?.direccion ?? '',
  latitud: registro?.latitud ?? '',
  longitud: registro?.longitud ?? '',
  descripcion: registro?.descripcion ?? '',
  incluye: registro?.incluye ?? '',
  no_incluye: registro?.no_incluye ?? '',
  destacada: aRadio(registro?.destacada, '0'),
  verificada: aRadio(registro?.verificada, '0'),
  // El estado solo cambia por el flujo "Cambiar Estado"; toda experiencia nace en borrador.
  estado: registro?.estado ?? 'borrador',
});

const ExperienciaCreador = (props) => {
  const { experiencia, accion, handleOnClose, updateColeccion, titulo, destinos, proveedores } = props;

  return (
    <AppCrudDialog
      stateKey='experiencias'
      registroId={experiencia}
      accion={accion}
      handleOnClose={handleOnClose}
      updateColeccion={updateColeccion}
      onShow={onShow}
      onCreate={onCreate}
      onUpdate={onUpdate}
      resetActual={resetActual}
      initialValues={initialValues}
      validationSchema={validationSchema}
      maxWidth='md'
    >
      {({ values, setFieldValue, registro, saving }) => (
        <ExperienciaForm
          values={values}
          setFieldValue={setFieldValue}
          registro={registro}
          accion={accion}
          titulo={titulo}
          handleOnClose={handleOnClose}
          saving={saving}
          destinos={destinos}
          proveedores={proveedores}
        />
      )}
    </AppCrudDialog>
  );
};

ExperienciaCreador.propTypes = {
  experiencia: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
  destinos: PropTypes.array.isRequired,
  proveedores: PropTypes.array.isRequired,
};

export default ExperienciaCreador;
