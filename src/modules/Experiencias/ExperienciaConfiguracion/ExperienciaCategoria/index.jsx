import React from 'react';
import AppCrudTable from '../../../../shared/components/AppCrudTable';
import useCrudModulo from '../../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../../@crema/redux/features/experienciaCategorias/experienciaCategoriasSlice';
import { pestanaPropTypes } from '../propTypes';
import ExperienciaCategoriaCreador from './ExperienciaCategoriaCreador';

const cells = [
  { id: 'categoria_nombre', typeHead: 'string', label: 'Categoría', value: (v) => v, align: 'left', mostrarInicio: true },
];

// Tabla pivote: solo se asigna o se quita (el backend no expone ver/editar).
const ExperienciaCategoria = ({ experienciaId, permisos, urlAyuda }) => {
  const { formulario, abrirCrear, cerrar, refreshKey, updateColeccion } = useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='experienciaCategorias'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosFijos={{ experiencia_id: experienciaId }}
        paginado={false}
        titulo='Categorías Asignadas'
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Categoría'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
      />
      {formulario && (
        <ExperienciaCategoriaCreador
          experienciaId={experienciaId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Asignar Categoría'
        />
      )}
    </>
  );
};

ExperienciaCategoria.propTypes = pestanaPropTypes;

export default ExperienciaCategoria;
