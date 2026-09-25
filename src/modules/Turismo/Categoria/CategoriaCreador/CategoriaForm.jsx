import React from 'react';
import PropTypes from 'prop-types';
import AppCrudForm from '../../../../shared/components/AppCrudForm';
import MyFileField from '../../../../shared/components/MyFileField';
import MyTextField from '../../../../shared/components/MyTextField';
import MyRadioField from '../../../../shared/components/MyRadioField';
import MySelectField from '../../../../shared/components/MySelectField';
import { OPCIONES_ESTADO } from '../../../../shared/constants/Turismo';
import { useSlugAutomatico } from '../../../../shared/functions/ValidacionesYup';

const CategoriaForm = (props) => {
  const { values, setFieldValue, accion, titulo, handleOnClose, saving, categoriasPadre } = props;
  const disabled = accion === 'ver';
  useSlugAutomatico({ accion, nombre: values.nombre, setFieldValue });

  return (
    <AppCrudForm titulo={titulo} accion={accion} handleOnClose={handleOnClose} saving={saving}>
      <MyTextField autoFocus fullWidth label='Nombre' name='nombre' disabled={disabled} required />
      <MyTextField fullWidth label='Slug' name='slug' disabled={disabled} required />
      <MySelectField fullWidth variant='standard' label='Categoría Padre' name='categoria_padre_id' options={categoriasPadre} disabled={disabled} ninguno />
      <MyTextField fullWidth label='Orden' name='orden' type='number' disabled={disabled} />
      <MyFileField className='campo-completo' label='Imagen' tipo='imagen' rutaActual={values.imagen} disabled={disabled} />
      <MyTextField className='campo-completo' fullWidth multiline minRows={3} label='Descripción' name='descripcion' disabled={disabled} />
      <MyRadioField label='Estado' name='estado' disabled={disabled} required options={OPCIONES_ESTADO} />
    </AppCrudForm>
  );
};

CategoriaForm.propTypes = {
  values: PropTypes.object.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  accion: PropTypes.string.isRequired,
  titulo: PropTypes.string,
  handleOnClose: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  categoriasPadre: PropTypes.array.isRequired,
};

export default CategoriaForm;
