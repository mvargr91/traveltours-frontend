import React, { useEffect } from 'react';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppCrudDialog from '../../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../../shared/components/AppCrudForm';
import FormikAutocomplete from '../../../../../shared/components/FormikAutocomplete';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../../@crema/redux/features/experienciaCategorias/experienciaCategoriasSlice';
import { onGetColeccionLigera as onGetCategorias } from '../../../../../@crema/redux/features/categorias/categoriasSlice';
import { creadorPropTypes } from '../../propTypes';

const validationSchema = yup.object({
  categoria_id: yup.string().required('Requerido'),
});

const ExperienciaCategoriaCreador = (props) => {
  const { experienciaId, accion, handleOnClose, updateColeccion, titulo } = props;
  const dispatch = useDispatch();
  const categorias = useSelector((state) => state.categorias.coleccionLigera);
  const asignadas = useSelector((state) => state.experienciaCategorias.rows);

  useEffect(() => {
    dispatch(onGetCategorias());
  }, [dispatch]);

  const idsAsignados = new Set(asignadas.map((row) => row.categoria_id));
  const disponibles = categorias.filter((categoria) => !idsAsignados.has(categoria.id));

  const initialValues = () => ({
    experiencia_id: Number(experienciaId),
    categoria_id: '',
  });

  return (
    <AppCrudDialog
      stateKey='experienciaCategorias'
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
          <FormikAutocomplete
            className='campo-completo'
            name='categoria_id'
            label='Categoría *'
            options={disponibles}
            textFieldProps={{ variant: 'standard' }}
          />
        </AppCrudForm>
      )}
    </AppCrudDialog>
  );
};

ExperienciaCategoriaCreador.propTypes = creadorPropTypes;

export default ExperienciaCategoriaCreador;
