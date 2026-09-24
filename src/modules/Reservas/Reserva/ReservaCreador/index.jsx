import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/reservas/reservasSlice';
import { onGetColeccionLigera as onGetExperiencias } from '../../../../@crema/redux/features/experiencias/experienciasSlice';
import { onGetColeccionLigera as onGetCupones } from '../../../../@crema/redux/features/cupones/cuponesSlice';
import { onGetColeccionLigera as onGetUsuarios } from '../../../../@crema/redux/features/usuarios/usuariosSlice';
import { aHoraCorta } from '../../../../shared/constants/Turismo';
import {
  enteroOpcional,
  enteroRequerido,
  numeroRequerido,
} from '../../../../shared/functions/ValidacionesYup';
import ReservaForm from './ReservaForm';

const validationSchema = yup.object({
  usuario_id: yup.string().required('Requerido'),
  experiencia_id: yup.string().required('Requerido'),
  proveedor_id: yup.string().required('Seleccione una experiencia válida'),
  fecha: yup.string().required('Requerido').nullable(),
  nombre: yup.string().required('Requerido').max(150, 'Máximo 150 caracteres'),
  correo: yup.string().required('Requerido').email('Correo inválido').max(150, 'Máximo 150 caracteres'),
  telefono: yup.string().required('Requerido').max(30, 'Máximo 30 caracteres').matches(/^[+]?[0-9\s-]*$/, 'Teléfono inválido'),
  cantidad_personas: enteroRequerido().min(1, 'Mínimo 1'),
  cantidad_chicos: enteroOpcional()
    .min(0, 'No puede ser negativo')
    .test('chicos', 'No puede superar la cantidad de personas', function (valor) {
      const { cantidad_personas: personas } = this.parent;
      return valor === null || valor === undefined || !personas || valor <= personas;
    }),
  valor_total: numeroRequerido().min(0, 'No puede ser negativo'),
});

// PUT /reservas/{id} solo acepta estos campos; experiencia, proveedor y usuario no se modifican.
const CAMPOS_EDITABLES = [
  'id',
  'fecha',
  'hora_inicio',
  'nombre',
  'correo',
  'telefono',
  'cantidad_personas',
  'cantidad_chicos',
  'valor_total',
  'observaciones',
  'notas',
];

const ReservaCreador = ({ reserva, accion, handleOnClose, updateColeccion, titulo }) => {
  const dispatch = useDispatch();
  const usuarioActual = useSelector(({ auth }) => auth.user?.usuario);
  const experiencias = useSelector((state) => state.experiencias.coleccionLigera);
  const cupones = useSelector((state) => state.cupones.coleccionLigera);
  const usuarios = useSelector((state) => state.usuarios.coleccionLigera);

  useEffect(() => {
    dispatch(onGetExperiencias());
    dispatch(onGetCupones());
    dispatch(onGetUsuarios());
  }, [dispatch]);

  const initialValues = (registro) => ({
    id: registro?.id ?? '',
    usuario_id: registro?.usuario_id ?? usuarioActual?.id ?? '',
    experiencia_id: registro?.experiencia_id ?? '',
    proveedor_id: registro?.proveedor_id ?? '',
    disponibilidad_id: registro?.disponibilidad_id ?? '',
    fecha: registro?.fecha ?? '',
    hora_inicio: aHoraCorta(registro?.hora_inicio),
    residencia: registro?.residencia ?? '',
    nombre: registro?.nombre ?? '',
    correo: registro?.correo ?? '',
    telefono: registro?.telefono ?? '',
    cantidad_personas: registro?.cantidad_personas ?? 1,
    cantidad_chicos: registro?.cantidad_chicos ?? 0,
    idioma: registro?.idioma ?? '',
    cupon_id: registro?.cupon_id ?? '',
    valor_total: registro?.valor_total ?? '',
    observaciones: registro?.observaciones ?? '',
    notas: registro?.notas ?? '',
  });

  const transformarAntesDeEnviar = (data) =>
    accion === 'editar'
      ? Object.fromEntries(CAMPOS_EDITABLES.map((campo) => [campo, data[campo]]))
      : data;

  return (
    <AppCrudDialog
      stateKey='reservas'
      registroId={reserva}
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
    >
      {({ values, setFieldValue, registro, saving }) => (
        <ReservaForm
          values={values}
          setFieldValue={setFieldValue}
          registro={registro}
          accion={accion}
          titulo={titulo}
          handleOnClose={handleOnClose}
          saving={saving}
          experiencias={experiencias}
          cupones={cupones}
          usuarios={usuarios}
        />
      )}
    </AppCrudDialog>
  );
};

ReservaCreador.propTypes = {
  reserva: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default ReservaCreador;
