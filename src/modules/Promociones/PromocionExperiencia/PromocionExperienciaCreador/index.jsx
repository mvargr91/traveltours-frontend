import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import AppCrudDialog from '../../../../shared/components/AppCrudDialog';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import FormikAutocomplete from '../../../../shared/components/FormikAutocomplete';
import {
  onShow,
  onCreate,
  onUpdate,
  resetActual,
} from '../../../../@crema/redux/features/promocionExperiencias/promocionExperienciasSlice';
import { onGetColeccionLigera as onGetExperiencias } from '../../../../@crema/redux/features/experiencias/experienciasSlice';

const validationSchema = yup.object({
  experiencia_id: yup.string().required('Requerido'),
});

const PromocionExperienciaCreador = (props) => {
  const { promocionId, accion, handleOnClose, updateColeccion, titulo } = props;
  const dispatch = useDispatch();
  const experiencias = useSelector((state) => state.experiencias.coleccionLigera);
  const asociadas = useSelector((state) => state.promocionExperiencias.rows);

  useEffect(() => {
    dispatch(onGetExperiencias());
  }, [dispatch]);

  const idsAsociados = new Set(asociadas.map((row) => row.experiencia_id));
  const disponibles = experiencias.filter((e) => !idsAsociados.has(e.id));

  const initialValues = () => ({
    promocion_id: Number(promocionId),
    experiencia_id: '',
  });

  return (
    <AppCrudDialog
      stateKey='promocionExperiencias'
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
            name='experiencia_id'
            label='Experiencia (solo publicadas) *'
            options={disponibles}
            textFieldProps={{ variant: 'standard' }}
          />
        </AppCrudForm>
      )}
    </AppCrudDialog>
  );
};

PromocionExperienciaCreador.propTypes = {
  promocionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  accion: PropTypes.string.isRequired,
  handleOnClose: PropTypes.func.isRequired,
  updateColeccion: PropTypes.func.isRequired,
  titulo: PropTypes.string,
};

export default PromocionExperienciaCreador;
