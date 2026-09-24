import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AppCrudTable from '../../../shared/components/AppCrudTable';
import usePermisosOpcion from '../../../shared/hooks/usePermisosOpcion';
import useCrudModulo from '../../../shared/hooks/useCrudModulo';
import {
  onGetColeccion,
  onDelete,
} from '../../../@crema/redux/features/acompanantesReserva/acompanantesReservaSlice';
import { onShow as onShowReserva } from '../../../@crema/redux/features/reservas/reservasSlice';
import AcompananteReservaCreador from './AcompananteReservaCreador';

const cells = [
  { id: 'nombre', typeHead: 'string', label: 'Nombre', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'documento', typeHead: 'string', label: 'Documento', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'edad', typeHead: 'numeric', label: 'Edad', value: (v) => v, align: 'right', mostrarInicio: true },
  { id: 'correo', typeHead: 'string', label: 'Correo', value: (v) => v, align: 'left', mostrarInicio: true },
  { id: 'telefono', typeHead: 'string', label: 'Teléfono', value: (v) => v, align: 'left', mostrarInicio: true },
];

const AcompananteReserva = ({ route }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reserva_id: reservaId } = useParams();
  const { urlAyuda, permisos } = usePermisosOpcion(route.path);
  const reserva = useSelector((state) => state.reservas.actual);
  const { formulario, abrirCrear, abrirEditar, abrirVer, cerrar, refreshKey, updateColeccion } =
    useCrudModulo();

  useEffect(() => {
    dispatch(onShowReserva(reservaId));
  }, [dispatch, reservaId]);

  const subtitulo = reserva
    ? `${reserva.codigo_reserva} · ${reserva.nombre} · ${reserva.fecha} · ${reserva.cantidad_personas} persona(s)`
    : '';

  return (
    <>
      <AppCrudTable
        stateKey='acompanantesReserva'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosFijos={{ reserva_id: reservaId }}
        paginado={false}
        titulo='Acompañantes de la Reserva'
        subtitulo={subtitulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Acompañante'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onEditar={abrirEditar}
        onVer={abrirVer}
        onVolver={() => navigate('/reservas')}
      />
      {formulario && (
        <AcompananteReservaCreador
          acompanante={formulario.id}
          reservaId={reservaId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Acompañante'
        />
      )}
    </>
  );
};

AcompananteReserva.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default AcompananteReserva;
