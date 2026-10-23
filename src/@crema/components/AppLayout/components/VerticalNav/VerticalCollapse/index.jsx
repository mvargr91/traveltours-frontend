import React, { useEffect, useMemo, useState } from 'react';
import { Collapse, Icon, IconButton, ListItemText } from '@mui/material';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import VerticalItem from '../VerticalItem';
import Box from '@mui/material/Box';
import { checkPermission } from '@crema/helpers/RouteHelper';
import { useAuthUser } from '@crema/hooks/AuthHooks';
import { useThemeContext } from '@crema/context/AppContextProvider/ThemeContextProvider';
import { useSidebarContext } from '@crema/context/AppContextProvider/SidebarContextProvider';
import VerticalCollapseItem from '../VerticalCollapse/VerticalCollapseItem'

const needsToBeOpened = (pathname, item) => {
  return pathname && isUrlInChildren(item, pathname);
};

// ¿La página actual es una opción del módulo (o una ruta hija, ej. /liquidaciones/5/ver)? Los permisos del
// usuario traen las opciones en `opciones`; `children` queda por compatibilidad con la plantilla.
const isUrlInChildren = (parent, url) => {
  const hijos = parent?.opciones ?? parent?.children;
  if (!hijos) {
    return false;
  }
  return hijos.some(
    (hijo) =>
      isUrlInChildren(hijo, url) ||
      (hijo.url && (url === hijo.url || url.startsWith(`${hijo.url}/`))),
  );
};


const VerticalCollapse = ({ item, level }) => {
  const { theme } = useThemeContext();
  const { sidebarTextColor } = useSidebarContext();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(() => needsToBeOpened(pathname, item));
  useEffect(() => {
    if (needsToBeOpened(pathname, item)) {
      setOpen(true);
    }
  }, [pathname, item]);
  const handleClick = () => {
    setOpen(!open);
  };
  // const { user } = useAuthUser();
  
  // const hasPermission = useMemo(
  //   () => checkPermission(item.auth, user.role),
  //   [item.auth, user.role],
  // );


  // if (!hasPermission) {
  //   return null;
  // }

  return (
    <>
      <VerticalCollapseItem
        level={item}
        sidebarTextColor={sidebarTextColor}
        button
        component='div'
        className={clsx('menu-vertical-collapse', open && 'open')}
        onClick={handleClick}
      >
        {item.icono_menu && (
          <Box component='span'>
            <Icon
              sx={{ mr: 4 }}
              color='action'
              className={clsx('nav-item-icon')}
            >
              {item.icono_menu}
            </Icon>
          </Box>
        )}
        <ListItemText
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 14,
          }}
          className='nav-item-content'
          classes={{ primary: clsx('nav-item-text') }}
          primary={item.nombre}
        />
        <IconButton
          className='nav-item-icon-arrow-btn'
          sx={{ p: 0, mr: 0.75 }}
          disableRipple
          size='large'
        >
          <Icon className='nav-item-icon-arrow' color='inherit'>
            {open
              ? 'expand_more'
              : theme.direction === 'ltr'
              ? 'chevron_right'
              : 'chevron_left'}
          </Icon>
        </IconButton>
      </VerticalCollapseItem>

      {item.opciones && (
        <Collapse in={open} className='collapse-children'>
          {item.opciones.map((item) => (
            <React.Fragment key={item.nombre}>
              {item.type === 'collapse' && (
                <VerticalCollapse item={item} level={item.posicion} />
              )}
              {item.type === 'item' && (
                <VerticalItem item={item} level={item.posicion} />
              )}
            </React.Fragment>
          ))}
        </Collapse>
      )}
    </>
  );
};

VerticalCollapse.propTypes = {
  item: PropTypes.shape({
    icono_menu: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    opciones: PropTypes.array,
  }),
  level: PropTypes.number,
};
VerticalCollapse.defaultProps = {};
export default React.memo(VerticalCollapse);
