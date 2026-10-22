import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onGetCuenta } from '../../@crema/redux/features/cuenta/cuentaSlice';

/**
 * ¿El usuario logueado es un proveedor? Devuelve su negocio como opción de select ({ id, nombre }).
 * Las pantallas lo usan para fijar (y deshabilitar) los campos y filtros de proveedor: el backend
 * igual fuerza el proveedor del token, esto solo evita ofrecer opciones que no aplican.
 */
const useProveedorSesion = () => {
  const dispatch = useDispatch();
  const cuenta = useSelector((state) => state.cuenta.datos);

  useEffect(() => {
    if (!cuenta) dispatch(onGetCuenta());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const esProveedor = cuenta?.rol === 'Proveedor';
  const proveedor = esProveedor && cuenta?.proveedor
    ? { id: cuenta.proveedor.id, nombre: cuenta.proveedor.nombre_comercial ?? cuenta.proveedor.nombre }
    : null;

  return { cargando: !cuenta, esProveedor, proveedor };
};

// Agrega el proveedor de la sesión a las opciones si no viene en la lista.
export const conProveedorPropio = (opciones, proveedor) =>
  proveedor && !opciones.some((p) => String(p.id) === String(proveedor.id)) ? [...opciones, proveedor] : opciones;

export default useProveedorSesion;
