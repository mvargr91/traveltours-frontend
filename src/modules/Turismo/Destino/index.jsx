import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import AppCrudTable, { auditCells } from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import { onGetColeccion, onDelete } from '../../../@crema/redux/features/destinos/destinosSlice';
import { colorActivo, valorActivo, valorSiNo } from '../../../shared/constants/Turismo';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'ciudad', typeHead: 'string', label: 'Ciudad', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'departamento', typeHead: 'string', label: 'Departamento', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'destacado', typeHead: 'string', label: 'Destacado', value: valorSiNo, align: 'left', mostrarInicio: true },
  { id: 'estado', typeHead: 'string', label: 'Estado', value: valorActivo, cellColor: colorActivo, align: 'left', mostrarInicio: true },
  ...auditCells,
];

const filtrosConfig = [{ name: 'nombre', label: 'Nombre', type: 'text' }];

const Destino = ({ route }) => {
  const { titulo, urlAyuda, permisos } = usePermisosOpcion(route.path);
  const navigate = useNavigate();
  // Crear/editar/ver abren el formulario en su propia ruta (ver DestinoPagina).
  const { refreshKey } = useCrudModulo();

  return (
    <>
      <AppCrudTable
        stateKey='destinos'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosConfig={filtrosConfig}
        titulo={titulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Destino'
        refreshKey={refreshKey}
        onCrear={() => navigate('/destinos/crear')}
        onEditar={(row) => navigate(`/destinos/${row.id}/editar`)}
        onVer={(row) => navigate(`/destinos/${row.id}/ver`)}
      />
    </>
  );
};

Destino.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default Destino;
