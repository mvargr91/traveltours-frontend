import React from 'react';
import AppCrudTable from '../../../../shared/components/AppCrudTable';
import useCrudModulo from '../../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../../@crema/redux/features/experienciaPrecios/experienciaPreciosSlice';
import {
  TIPOS_PRECIO,
  colorActivo,
  formatoMoneda,
  nombreDe,
  valorActivo,
} from '../../../../shared/constants/Turismo';
import { pestanaPropTypes } from '../propTypes';
import ExperienciaPrecioCreador from './ExperienciaPrecioCreador';

const cells = [
  { id: 'descripcion', typeHead: 'string', label: 'Descripción', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'tipo', typeHead: 'string', label: 'Tipo', value: (v) => nombreDe(TIPOS_PRECIO, v), align: 'left', mostrarInicio: true },
  { id: 'cantidad', typeHead: 'numeric', label: 'Cantidad Personas', value: (v) => v, align: 'right', mostrarInicio: true },
  { id: 'precio', typeHead: 'numeric', label: 'Precio', value: formatoMoneda, align: 'right', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
];

const ExperienciaPrecio = ({ experienciaId, permisos, urlAyuda }) => {
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='experienciaPrecios'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosFijos={{ experiencia_id: experienciaId }}
        paginado={false}
        titulo='Precios'
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Precio'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
      />
      {formulario && (
        <ExperienciaPrecioCreador
          precio={formulario.id}
          experienciaId={experienciaId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Precio'
        />
      )}
    </>
  );
};

ExperienciaPrecio.propTypes = pestanaPropTypes;

export default ExperienciaPrecio;
