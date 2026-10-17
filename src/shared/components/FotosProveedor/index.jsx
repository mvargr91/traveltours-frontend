// Logo y fotos del negocio del proveedor (se muestran en su perfil público). Sube cada archivo al elegirlo.
//   base = 'cuenta/proveedor' (el proveedor, Mi negocio) o `proveedores-turisticos/${id}` (el administrador).
//   POST {base}/logo · DELETE {base}/logo · POST {base}/fotos · DELETE {base}/fotos/{id} -> { datos: { logo, fotos } }
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Avatar, Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import StorefrontIcon from '@mui/icons-material/Storefront';
import jwtAxios from '@crema/services/auth/jwt-auth';
import { extraerMensajeError } from '@crema/redux/helpers/createCrudSlice';
import { aFormData, urlArchivo } from '../../functions/Archivos';
import { TIPOS_ARCHIVO } from '../MyFileField';

export const MAX_FOTOS_PROVEEDOR = 12; // = ProveedorTuristico::MAX_FOTOS
const { accept, extensiones, maxMB } = TIPOS_ARCHIVO.imagen;
const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

const FotosProveedor = ({ base, logo: logoInicial, fotos: fotosIniciales, soloLectura }) => {
  const [logo, setLogo] = useState(logoInicial ?? null);
  const [fotos, setFotos] = useState(fotosIniciales ?? []);
  const [ocupado, setOcupado] = useState(null); // 'logo' | 'foto' | id de la foto
  const [mensaje, setMensaje] = useState(null);
  const inputLogo = useRef(null);
  const inputFotos = useRef(null);

  const ejecutar = async (clave, peticion) => {
    setOcupado(clave);
    setMensaje(null);
    try {
      const { data } = await peticion();
      setLogo(data.datos.logo);
      setFotos(data.datos.fotos);
      setMensaje({ tipo: 'success', texto: data.mensajes?.[0] });
    } catch (e) {
      setMensaje({ tipo: 'error', texto: extraerMensajeError(e) });
    } finally {
      setOcupado(null);
    }
  };

  const archivoValido = (archivo) => {
    const extension = archivo.name.split('.').pop().toLowerCase();
    if (!extensiones.includes(extension)) return `Formatos permitidos: ${extensiones.join(', ')}`;
    if (archivo.size > maxMB * 1048576) return `Cada imagen puede pesar máximo ${maxMB} MB`;
    return null;
  };

  const subir = async (evento, tipo) => {
    const archivos = Array.from(evento.target.files ?? []);
    evento.target.value = '';
    for (const archivo of tipo === 'logo' ? archivos.slice(0, 1) : archivos) {
      const error = archivoValido(archivo);
      if (error) {
        setMensaje({ tipo: 'error', texto: `${archivo.name}: ${error}` });
        return;
      }
      // Las fotos se suben una a una: el backend controla el máximo.
      // eslint-disable-next-line no-await-in-loop
      await ejecutar(tipo, () => jwtAxios.post(`${base}/${tipo === 'logo' ? 'logo' : 'fotos'}`, aFormData({ archivo }), MULTIPART));
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ sm: 'center' }} sx={{ mb: 4 }}>
        <Avatar src={logo ? urlArchivo(logo) : undefined} variant='rounded' sx={{ width: 96, height: 96, bgcolor: 'action.hover', color: 'text.secondary' }}>
          <StorefrontIcon fontSize='large' />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 600 }}>Logo</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Cuadrado, al menos 400 × 400 px. {extensiones.join(', ')} hasta {maxMB} MB.
          </Typography>
          {!soloLectura && (
            <Stack direction='row' spacing={1}>
              <Button size='small' variant='outlined' onClick={() => inputLogo.current?.click()} disabled={Boolean(ocupado)}
                startIcon={ocupado === 'logo' ? <CircularProgress size={14} /> : null}>
                {logo ? 'Cambiar logo' : 'Subir logo'}
              </Button>
              {logo && (
                <Button size='small' color='error' disabled={Boolean(ocupado)} onClick={() => ejecutar('logo', () => jwtAxios.delete(`${base}/logo`))}>
                  Quitar
                </Button>
              )}
              <input ref={inputLogo} type='file' accept={accept} hidden onChange={(e) => subir(e, 'logo')} />
            </Stack>
          )}
        </Box>
      </Stack>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontWeight: 600, flex: 1 }}>
          Fotos del negocio ({fotos.length}/{MAX_FOTOS_PROVEEDOR})
        </Typography>
        {!soloLectura && fotos.length < MAX_FOTOS_PROVEEDOR && (
          <>
            <Button size='small' variant='contained' startIcon={ocupado === 'foto' ? <CircularProgress size={14} color='inherit' /> : <AddPhotoAlternateIcon />}
              disabled={Boolean(ocupado)} onClick={() => inputFotos.current?.click()}>
              Agregar fotos
            </Button>
            <input ref={inputFotos} type='file' accept={accept} multiple hidden onChange={(e) => subir(e, 'foto')} />
          </>
        )}
      </Box>
      {fotos.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          Aún no hay fotos. Muestra tus instalaciones, vehículos, equipo o momentos de tus experiencias.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 2 }}>
          {fotos.map((foto) => (
            <Box key={foto.id} sx={{ position: 'relative', pt: '75%', borderRadius: 1, overflow: 'hidden', bgcolor: 'action.hover' }}>
              <Box component='img' src={urlArchivo(foto.ruta_archivo)} alt='' loading='lazy'
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              {!soloLectura && (
                <Tooltip title='Eliminar foto'>
                  <IconButton size='small' disabled={Boolean(ocupado)}
                    onClick={() => ejecutar(foto.id, () => jwtAxios.delete(`${base}/fotos/${foto.id}`))}
                    sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}>
                    {ocupado === foto.id ? <CircularProgress size={16} color='inherit' /> : <DeleteOutlineIcon fontSize='small' />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}
        </Box>
      )}
      {mensaje && <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)} sx={{ mt: 2 }}>{mensaje.texto}</Alert>}
    </Box>
  );
};

FotosProveedor.propTypes = {
  base: PropTypes.string.isRequired,
  logo: PropTypes.string,
  fotos: PropTypes.array,
  soloLectura: PropTypes.bool,
};

export default FotosProveedor;
