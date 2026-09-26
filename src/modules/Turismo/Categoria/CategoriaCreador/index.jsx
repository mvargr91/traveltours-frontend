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
  onGetColeccionLigera,
} from '../../../../@crema/redux/features/categorias/categoriasSlice';
import { aRadio } from '../../../../shared/constants/Turismo';
import { enteroOpcional, slugRequerido } from '../../../../shared/functions/ValidacionesYup';
import CategoriaForm from './CategoriaForm';
import { validarArchivo } from '../../../../shared/components/MyFileField';

const validationSchema = yup.object({
  nombre: yup.string().required('Requerido').max(128, 'Máximo 128 caracteres'),
  slug: slugRequerido(150),
  orden: enteroOpcional(),
  imagen: yup.string().nullable(),
  archivo: validarArchivo('imagen'),
});

const initialValues = (registro) => ({
  id: registro?.id ?? '',
  categoria_padre_id: registro?.categoria_padre_id ?? '',
  nombre: registro?.nombre ?? '',
  slug: registro?.slug ?? '',
  descripcion: registro?.descripcion ?? '',
  imagen: registro?.imagen ?? '',
  archivo: null,
  orden: registro?.orden ?? 0,
  estado: aRadio(registro?.estado),
});

const CategoriaCreador = ({ categoria, accion, handleOnClose, updateColeccion, titulo }) => {
  const dispatch = useDispatch();
  const { coleccionLigera } = useSelector((state) => state.categorias);

  useEffect(() => {
    dispatch(onGetColeccionLigera());
  }, [dispatch]);

  // Una categoría no puede ser su propio padre.
  const categoriasPadre = coleccionLigera.filter((item) => item.id !== categoria);

  return (
    <AppCrudDialog
      stateKey='categorias'
      registroId={categoria}
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
      {({ values, setFieldValue, saving }) => (
        <CategoriaForm
          values={values}
          setFieldValue={setFieldValue}
          accion={accion}
          titulo={titulo}
          handleOnClose={handleOnClose}
          saving={saving}
          categoriasPadre={categoriasPadre}
        />
      )}
    </AppCrudDialog>
  );
};

CategoriaCreador.propTypes = {
  categoria: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default CategoriaCreador;
