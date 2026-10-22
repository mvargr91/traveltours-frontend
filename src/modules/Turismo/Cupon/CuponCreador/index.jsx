import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/cupones/cuponesSlice';
import { aRadio } from '../../../../shared/constants/Turismo';
import {
  enteroOpcional,
  fechaFinPosterior,
  numeroOpcional,
} from '../../../../shared/functions/ValidacionesYup';
import CuponForm from './CuponForm';

const validationSchema = yup.object({
  codigo: yup
    .string()
    .required('Requerido')
    .min(3, 'Mínimo 3 caracteres')
    .max(40, 'Máximo 40 caracteres')
    .matches(/^[A-Za-z0-9_-]+$/, 'Solo letras, números, - y _ (sin espacios)'),
  tipo: yup.string().required('Requerido'),
  nombre: yup.string().required('Requerido').max(150, 'Máximo 150 caracteres'),
  cantidad: enteroOpcional().min(1, 'Mínimo 1'),
  descuento: numeroOpcional().when('tipo', {
    is: 'porcentaje',
    then: (schema) => schema.required('Requerido').min(0.01, 'Mayor a 0').max(100, 'Máximo 100'),
  }),
  valor: numeroOpcional().when('tipo', {
    is: 'valor_fijo',
    then: (schema) => schema.required('Requerido').min(1, 'Mayor a 0'),
  }),
  fecha_inicio: yup.string().required('Requerido').nullable(),
  fecha_fin: fechaFinPosterior(),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  codigo: registro?.codigo ?? '',
  proveedor_id: registro?.proveedor_id ?? '',
  experiencias: registro?.experiencias ?? [],
  tipo: registro?.tipo ?? 'porcentaje',
  nombre: registro?.nombre ?? '',
  descripcion: registro?.descripcion ?? '',
  cantidad: registro?.cantidad ?? '',
  descuento: registro?.descuento ?? '',
  valor: registro?.valor ?? '',
  fecha_inicio: registro?.fecha_inicio ?? '',
  fecha_fin: registro?.fecha_fin ?? '',
  estado: aRadio(registro?.estado),
});

// Solo se envía el campo que corresponde al tipo de descuento.
const transformarAntesDeEnviar = (data) => ({
  ...data,
  codigo: data.codigo.trim().toUpperCase(),
  proveedor_id: data.proveedor_id || null,
  descuento: data.tipo === 'porcentaje' ? data.descuento : null,
  valor: data.tipo === 'valor_fijo' ? data.valor : null,
});

const CuponCreador = ({ cupon, accion, handleOnClose, updateColeccion, titulo, proveedores, proveedorPropio }) => (
  <AppCrudDialog
    stateKey='cupones'
    registroId={cupon}
    accion={accion}
    handleOnClose={handleOnClose}
    updateColeccion={updateColeccion}
    onShow={onShow}
    onCreate={onCreate}
    onUpdate={onUpdate}
    resetActual={resetActual}
    // El proveedor logueado crea cupones de su negocio (el backend también lo fuerza).
    initialValues={(registro) => ({
      ...initialValues(registro),
      ...(proveedorPropio && !registro ? { proveedor_id: proveedorPropio.id } : {}),
    })}
    validationSchema={validationSchema}
    transformarAntesDeEnviar={transformarAntesDeEnviar}
  >
    {({ values, setFieldValue, registro, saving }) => (
      <CuponForm
        values={values}
        setFieldValue={setFieldValue}
        registro={registro}
        proveedores={proveedores}
        proveedorPropio={proveedorPropio}
        accion={accion}
        titulo={titulo}
        handleOnClose={handleOnClose}
        saving={saving}
      />
    )}
  </AppCrudDialog>
);

CuponCreador.propTypes = {
  cupon: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
  proveedores: PropTypes.array.isRequired,
  proveedorPropio: PropTypes.object,
};

export default CuponCreador;
