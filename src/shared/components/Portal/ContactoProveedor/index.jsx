// Contacto y redes sociales de un proveedor (ficha de la experiencia y perfil del proveedor).
// Lo que el proveedor no haya llenado no se muestra.
import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Link, Stack } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LanguageIcon from '@mui/icons-material/Language';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useTextos } from '@crema/context/AppContextProvider/AparienciaContextProvider';

// El proveedor escribe sus redes como enlace o como usuario (@mi_negocio): siempre sale un enlace http(s).
const aEnlace = (valor, base = '') => {
  const texto = String(valor ?? '').trim();
  if (!texto) return null;
  if (/^https?:\/\//i.test(texto)) return texto;
  const limpio = texto.replace(/^@/, '').replace(/^\/+/, '');
  return /^[\w.\-/]+$/.test(limpio) ? `https://${base}${limpio}` : null;
};

const ContactoProveedor = ({ telefono, correo, sitioWeb, instagram, facebook, sx }) => {
  const t = useTextos('proveedor');
  const tel = String(telefono ?? '').trim();
  const mail = String(correo ?? '').trim();
  const redes = [
    [LanguageIcon, t('sitioWeb'), aEnlace(sitioWeb)],
    [InstagramIcon, 'Instagram', aEnlace(instagram, 'instagram.com/')],
    [FacebookIcon, 'Facebook', aEnlace(facebook, 'facebook.com/')],
  ].filter(([, , url]) => url);

  if (!tel && !mail && redes.length === 0) return null;

  return (
    <Stack direction='row' alignItems='center' sx={{ flexWrap: 'wrap', columnGap: 2.5, rowGap: 0.5, ...sx }}>
      {tel && (
        <Stack direction='row' spacing={0.75} alignItems='center'>
          <PhoneIcon fontSize='small' color='action' />
          <Link href={`tel:${tel.replace(/[^+\d]/g, '')}`} underline='hover' variant='body2'>{tel}</Link>
        </Stack>
      )}
      {mail && (
        <Stack direction='row' spacing={0.75} alignItems='center'>
          <MailOutlineIcon fontSize='small' color='action' />
          <Link href={`mailto:${mail}`} underline='hover' variant='body2' sx={{ wordBreak: 'break-all' }}>{mail}</Link>
        </Stack>
      )}
      {redes.length > 0 && (
        <Stack direction='row' spacing={0.5} sx={{ ml: -1 }}>
          {redes.map(([Icono, nombre, url]) => (
            <IconButton key={nombre} href={url} target='_blank' rel='noopener noreferrer' aria-label={nombre} title={nombre} color='primary'>
              <Icono />
            </IconButton>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

ContactoProveedor.propTypes = {
  telefono: PropTypes.string,
  correo: PropTypes.string,
  sitioWeb: PropTypes.string,
  instagram: PropTypes.string,
  facebook: PropTypes.string,
  sx: PropTypes.object,
};

export default ContactoProveedor;
