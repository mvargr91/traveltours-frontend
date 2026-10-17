import React, { useEffect } from 'react';
import { descargarArchivo } from '../../../shared/functions/Archivos';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../@crema/redux/features/documentosProveedorTuristico/documentosProveedorTuristicoSlice';
import { onShow as onShowProveedor } from '../../../@crema/redux/features/proveedoresTuristicos/proveedoresTuristicosSlice';
import { onGetCuenta } from '../../../@crema/redux/features/cuenta/cuentaSlice';
import { Alert } from '@mui/material';
import {
  ESTADOS_DOCUMENTO,
  TIPOS_DOCUMENTO_PROVEEDOR,
  colorDe,
  nombreDe,
} from '../../../shared/constants/Turismo';
import DocumentoProveedorCreador from './DocumentoProveedorCreador';

const cells = [
  { id: 'tipo_documento', typeHead: 'string', label: 'Tipo de Documento', value: (v) => nombreDe(TIPOS_DOCUMENTO_PROVEEDOR, v), align: 'left', mostrarInicio: true },
  { id: 'nombre_archivo', typeHead: 'string', label: 'Archivo', value: (v) => v, align: 'left', mostrarInicio: true, ordenable: false },
  {
    id: 'estado',
    typeHead: 'string',
    label: 'Estado',
    value: (v) => nombreDe(ESTADOS_DOCUMENTO, v),
    cellColor: (v) => colorDe(ESTADOS_DOCUMENTO, v),
    align: 'left',
    mostrarInicio: true,
  },
  { id: 'fecha_vencimiento', typeHead: 'string', label: 'Vencimiento', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'revisado_en', typeHead: 'string', label: 'Revisado En', value: (v) => v, align: 'left', mostrarInicio: false, ordenable: false },
  { id: 'motivo_rechazo', typeHead: 'string', label: 'Motivo Rechazo', value: (v) => v, align: 'left', mostrarInicio: false, ordenable: false },
  ...auditCells,
];

// propio: Mi Cuenta > Mis Documentos. El proveedor gestiona los de su negocio (el backend lo fuerza) y lo
// que sube queda pendiente: el estado y el motivo de rechazo los pone el administrador.
const DocumentoProveedor = ({ route, propio }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { proveedor_id: proveedorRuta } = useParams();
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const proveedorActual = useSelector((state) => state.proveedoresTuristicos.actual);
  const cuenta = useSelector((state) => state.cuenta.datos);
  const proveedorId = propio ? cuenta?.proveedor?.id : proveedorRuta;
  const proveedor = propio ? cuenta?.proveedor : proveedorActual;
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  useEffect(() => {
    if (propio) {
      if (!cuenta) dispatch(onGetCuenta());
    } else {
      dispatch(onShowProveedor(proveedorRuta));
    }
  }, [dispatch, proveedorRuta, propio]); // eslint-disable-line react-hooks/exhaustive-deps

  if (propio && !proveedorId) {
    return cuenta ? <Alert severity='info'>Tu cuenta no tiene un negocio vinculado.</Alert> : null;
  }

  const accionesExtra = [
    {
      titulo: 'Descargar Archivo',
      icono: OpenInNewIcon,
      permiso: 'Listar',
      visible: (row) => Boolean(row.ruta_archivo),
      onClick: (row) => descargarArchivo(`documentos-proveedor/${row.id}/archivo`, row.nombre_archivo),
    },
  ];

  return (
    <>
      <AppCrudTable
        stateKey='documentosProveedorTuristico'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosFijos={{ proveedor_id: proveedorId }}
        titulo={propio ? titulo || 'Mis Documentos' : 'Documentos del Proveedor'}
        subtitulo={
          propio
            ? 'Sube RUT, cámara de comercio, RNT, póliza y cédula del representante. Nuestro equipo los revisa para verificar tu negocio.'
            : proveedor?.nombre_comercial
        }
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Documento'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
        accionesExtra={accionesExtra}
        onVolver={propio ? undefined : () => navigate('/proveedores-turisticos')}
      />
      {formulario && (
        <DocumentoProveedorCreador
          documento={formulario.id}
          proveedorId={proveedorId}
          propio={propio}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Documento del Proveedor'
        />
      )}
    </>
  );
};

DocumentoProveedor.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
  propio: PropTypes.bool,
};

export default DocumentoProveedor;
