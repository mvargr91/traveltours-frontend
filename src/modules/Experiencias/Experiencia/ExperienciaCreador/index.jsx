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
import {
  esquemaPrecios,
  precioAParams,
  preciosIniciales,
} from '../../../../shared/components/PreciosExperiencia';

const validationSchema = yup.object({
  proveedor_id: yup.string().required('Requerido'),
  destino_id: yup.string().required('Requerido'),
  nombre: yup.string().required('Requerido').max(180, 'Máximo 180 caracteres'),
  slug: slugRequerido(200),
  precios: esquemaPrecios,
  capacidad_maxima: enteroOpcional().min(1, 'Mínimo 1'),
  duracion_dias: enteroOpcional().min(1, 'Mínimo 1').max(60, 'Máximo 60'),
  modalidad_pago: yup.string().required('Requerido').oneOf(['reserva', 'pago_en_linea']),
  porcentaje_abono: enteroOpcional().min(1, 'Mínimo 1').max(99, 'Máximo 99'),
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
  tipo: registro?.tipo ?? '',
  duracion: registro?.duracion ?? '',
  duracion_dias: registro?.duracion_dias ?? '',
  precios: preciosIniciales(registro?.precios),
  capacidad_maxima: registro?.capacidad_maxima ?? '',
  modalidad_pago: registro?.modalidad_pago ?? 'reserva',
  porcentaje_abono: registro?.porcentaje_abono ?? '',
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

// El "precio desde" lo calcula el backend a partir de los precios.
const transformarAntesDeEnviar = ({ precios, ...valores }) => ({
  ...valores,
  precios: precios.map(precioAParams),
});

const ExperienciaCreador = (props) => {
  const { experiencia, accion, handleOnClose, updateColeccion, titulo, destinos, proveedores, enPagina } = props;

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
      transformarAntesDeEnviar={transformarAntesDeEnviar}
      maxWidth='md'
      enPagina={enPagina}
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
  enPagina: PropTypes.bool,
};

export default ExperienciaCreador;
