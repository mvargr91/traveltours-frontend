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
} from '../../../@crema/redux/features/promocionExperiencias/promocionExperienciasSlice';
import { onShow as onShowPromocion } from '../../../@crema/redux/features/promociones/promocionesSlice';
import { formatoMoneda } from '../../../shared/constants/Turismo';
import PromocionExperienciaCreador from './PromocionExperienciaCreador';

const cells = [
  { id: 'experiencia_nombre', typeHead: 'string', label: 'Experiencia', value: (v) => v, align: 'left', mostrarInicio: true },
];

// Tabla pivote: solo se asocia o se quita la experiencia.
const PromocionExperiencia = ({ route }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { promocion_id: promocionId } = useParams();
  const { urlAyuda, permisos } = usePermisosOpcion(route.path);
  const promocion = useSelector((state) => state.promociones.actual);
  const { formulario, abrirCrear, cerrar, refreshKey, updateColeccion } = useCrudModulo();

  useEffect(() => {
    dispatch(onShowPromocion(promocionId));
  }, [dispatch, promocionId]);

  const subtitulo = promocion
    ? `${promocion.nombre} · ${
        promocion.tipo_descuento === 'porcentaje'
          ? `${Number(promocion.valor_descuento)} %`
          : formatoMoneda(promocion.valor_descuento)
      } · ${promocion.fecha_inicio} a ${promocion.fecha_fin}`
    : '';

  return (
    <>
      <AppCrudTable
        stateKey='promocionExperiencias'
        onGetColeccion={onGetColeccion}
        onDelete={onDelete}
        cells={cells}
        filtrosFijos={{ promocion_id: promocionId }}
        paginado={false}
        titulo='Experiencias en Promoción'
        subtitulo={subtitulo}
        urlAyuda={urlAyuda}
        permisos={permisos}
        entidadNombre='Experiencia'
        refreshKey={refreshKey}
        onCrear={abrirCrear}
        onVolver={() => navigate('/promociones')}
      />
      {formulario && (
        <PromocionExperienciaCreador
          promocionId={promocionId}
          accion={formulario.accion}
          handleOnClose={cerrar}
          updateColeccion={updateColeccion}
          titulo='Agregar Experiencia a la Promoción'
        />
      )}
    </>
  );
};

PromocionExperiencia.propTypes = {
  route: PropTypes.shape({ path: PropTypes.string.isRequired }).isRequired,
};

export default PromocionExperiencia;
