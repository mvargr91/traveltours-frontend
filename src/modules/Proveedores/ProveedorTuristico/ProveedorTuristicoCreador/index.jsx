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
} from '../../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import { onGetColeccionLigera as onGetDestinos } from '../../../../@crema/redux/features/destinos/destinosSlice';
import { aRadio } from '../../../../shared/constants/Turismo';
import ProveedorTuristicoForm from './ProveedorTuristicoForm';

const validationSchema = yup.object({
  nombre_comercial: yup.string().required('Requerido').max(150, 'Máximo 150 caracteres'),
  razon_social: yup.string().max(150, 'Máximo 150 caracteres').nullable(),
  nit: yup.string().max(50, 'Máximo 50 caracteres').nullable(),
  telefono: yup.string().max(30, 'Máximo 30 caracteres').matches(/^[+]?[0-9\s-]*$/, 'Teléfono inválido').nullable(),
  correo: yup.string().email('Correo inválido').max(150, 'Máximo 150 caracteres').nullable(),
  sitio_web: yup.string().url('Debe ser una URL válida').nullable(),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  nombre_comercial: registro?.nombre_comercial ?? '',
  razon_social: registro?.razon_social ?? '',
  nit: registro?.nit ?? '',
  rnt: registro?.rnt ?? '',
  telefono: registro?.telefono ?? '',
  correo: registro?.correo ?? '',
  direccion: registro?.direccion ?? '',
  destino_id: registro?.destino_id ?? '',
  sitio_web: registro?.sitio_web ?? '',
  instagram: registro?.instagram ?? '',
  facebook: registro?.facebook ?? '',
  descripcion: registro?.descripcion ?? '',
  estado: aRadio(registro?.estado),
});

const ProveedorTuristicoCreador = ({ proveedor, accion, handleOnClose, updateColeccion, titulo }) => {
  const dispatch = useDispatch();
  const { coleccionLigera: destinos } = useSelector((state) => state.destinos);

  useEffect(() => {
    dispatch(onGetDestinos());
  }, [dispatch]);

  return (
    <AppCrudDialog
      stateKey='proveedoresTuristicos'
      registroId={proveedor}
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
      {({ registro, saving }) => (
        <ProveedorTuristicoForm
          registro={registro}
          accion={accion}
          titulo={titulo}
          handleOnClose={handleOnClose}
          saving={saving}
          destinos={destinos}
        />
      )}
    </AppCrudDialog>
  );
};

ProveedorTuristicoCreador.propTypes = {
  proveedor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default ProveedorTuristicoCreador;
