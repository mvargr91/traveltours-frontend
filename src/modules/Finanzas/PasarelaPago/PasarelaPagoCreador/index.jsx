import React from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/pasarelasPago/pasarelasPagoSlice';
import PasarelaPagoForm from './PasarelaPagoForm';

const validationSchema = yup.object({
  proveedor_id: yup.string().required('Requerido'),
  pasarela: yup.string().required('Requerido'),
  ambiente: yup.string().required('Requerido'),
  // Guardar llaves pide la contraseña: una sesión abierta no basta para cambiar a dónde llega el dinero.
  clave_confirmacion: yup.string().required('Escribe tu contraseña para guardar'),
});

// Las llaves secretas llegan vacías (nunca salen del backend): vacías al guardar, se conservan las guardadas.
const initialValues = (registro, catalogo) => {
  const campos = catalogo.pasarelas.flatMap((p) => p.campos.map((c) => c.nombre));
  return {
    id: registro?.id ?? '',
    proveedor_id: registro?.proveedor_id ?? '',
    pasarela: registro?.pasarela ?? 'wompi',
    ambiente: registro?.ambiente ?? 'sandbox',
    credenciales: Object.fromEntries(campos.map((campo) => [campo, registro?.credenciales?.[campo] ?? ''])),
    clave_confirmacion: '',
  };
};

const PasarelaPagoCreador = ({ cuenta, accion, handleOnClose, updateColeccion, titulo, catalogo, proveedores, proveedorPropio }) => {
  // Solo se envían las llaves de la pasarela elegida.
  const transformarAntesDeEnviar = (data) => {
    const campos = catalogo.pasarelas.find((p) => p.id === data.pasarela)?.campos ?? [];
    return {
      ...data,
      credenciales: Object.fromEntries(campos.map((c) => [c.nombre, (data.credenciales[c.nombre] ?? '').trim()])),
    };
  };

  return (
    <AppCrudDialog
      stateKey='pasarelasPago'
      registroId={cuenta}
      accion={accion}
      handleOnClose={handleOnClose}
      updateColeccion={updateColeccion}
      onShow={onShow}
      onCreate={onCreate}
      onUpdate={onUpdate}
      resetActual={resetActual}
      // El proveedor logueado configura la pasarela de su negocio (el backend también lo fuerza).
      initialValues={(registro) => ({
        ...initialValues(registro, catalogo),
        ...(proveedorPropio && !registro ? { proveedor_id: proveedorPropio.id } : {}),
      })}
      validationSchema={validationSchema}
      transformarAntesDeEnviar={transformarAntesDeEnviar}
    >
      {({ values, registro, saving }) => (
        <PasarelaPagoForm
          values={values}
          registro={registro}
          catalogo={catalogo}
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
};

PasarelaPagoCreador.propTypes = {
  cuenta: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
  catalogo: PropTypes.shape({ pasarelas: PropTypes.array, ambientes: PropTypes.array }).isRequired,
  proveedores: PropTypes.array.isRequired,
  proveedorPropio: PropTypes.object,
};

export default PasarelaPagoCreador;
