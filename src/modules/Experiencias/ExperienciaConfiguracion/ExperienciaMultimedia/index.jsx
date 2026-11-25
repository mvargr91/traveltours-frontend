import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AppCrudTable from '../../../../shared/components/AppCrudTable';
import useCrudModulo from '../../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../../@crema/redux/features/experienciaMultimedia/experienciaMultimediaSlice';
import {
  TIPOS_MULTIMEDIA,
  colorActivo,
  nombreDe,
  valorActivo,
} from '../../../../shared/constants/Turismo';
import { pestanaPropTypes } from '../propTypes';
import ExperienciaMultimediaCreador from './ExperienciaMultimediaCreador';
import { urlArchivo } from '../../../../shared/functions/Archivos';

const vistaPrevia = (ruta, row) => {
  if (row.tipo === 'foto') {
    return (
      <img
        src={urlArchivo(ruta)}
        alt={row.texto_alternativo || row.titulo || ''}
        style={{ height: 40, width: 64, objectFit: 'cover', borderRadius: 4, verticalAlign: 'middle' }}
      />
    );
  }
  return row.tipo === 'documento' ? (
    <PictureAsPdfIcon color='error' sx={{ verticalAlign: 'middle' }} />
  ) : (
    <PlayCircleIcon sx={{ verticalAlign: 'middle' }} />
  );
};

const cells = [
  { id: 'ruta_archivo', typeHead: 'string', label: 'Vista Previa', value: vistaPrevia, align: 'left', mostrarInicio: true },
  { id: 'tipo', typeHead: 'string', label: 'Tipo', value: (v) => nombreDe(TIPOS_MULTIMEDIA, v), align: 'left', mostrarInicio: true },
  // En un documento PDF el título es el texto del botón del portal.
  { id: 'titulo', typeHead: 'string', label: 'Título / Texto del Botón', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'orden', typeHead: 'numeric', label: 'Orden', value: (v) => v, align: 'right', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
];

const accionesExtra = [
  {
    titulo: 'Abrir Archivo',
    icono: OpenInNewIcon,
    permiso: 'Listar',
    onClick: (row) => window.open(urlArchivo(row.ruta_archivo), '_blank', 'noopener,noreferrer'),
  },
];

const ExperienciaMultimedia = ({ experienciaId, permisos, urlAyuda }) => {
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='experienciaMultimedia'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosFijos={{ experiencia_id: experienciaId }}
        paginado={false}
        titulo='Fotos, Videos y Documentos'
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Archivo Multimedia'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
        accionesExtra={accionesExtra}
      />
      {formulario && (
        <ExperienciaMultimediaCreador
          multimedia={formulario.id}
          experienciaId={experienciaId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Archivo Multimedia'
        />
      )}
    </>
  );
};

ExperienciaMultimedia.propTypes = pestanaPropTypes;

export default ExperienciaMultimedia;
