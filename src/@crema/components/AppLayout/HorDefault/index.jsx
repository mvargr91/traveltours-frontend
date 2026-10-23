import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppContentView from '../../AppContentView';
import AppFixedFooter from './AppFixedFooter';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import MenuLateral from './MenuLateral';
import { useLayoutContext } from '@crema/context/AppContextProvider/LayoutContextProvider';
import AppThemeSetting from '../../AppThemeSetting';
import HorDefaultWrapper from './HorDefaultWrapper';
import MainContent from './MainContent';
import { LayoutType } from '@crema/constants/AppEnums';
import HorDefaultContainer from './HorDefaultContainer';
import { useLocation } from 'react-router-dom';
import PropsTypes from 'prop-types';

// El usuario puede ocultar el menú lateral en escritorio; se recuerda en este navegador.
const CLAVE_MENU = 'panel.menuLateralOculto';
const leerOculto = () => {
  try {
    return window.localStorage.getItem(CLAVE_MENU) === '1';
  } catch {
    return false;
  }
};
const guardarOculto = (oculto) => {
  try {
    window.localStorage.setItem(CLAVE_MENU, oculto ? '1' : '0');
  } catch {
    // Sin almacenamiento (modo privado): solo dura la sesión de la página.
  }
};

const HorDefault = ({ routes, routesConfig }) => {
  const { pathname } = useLocation();
  const theme = useTheme();
  const escritorio = useMediaQuery(theme.breakpoints.up('lg'));
  const { footer, layoutType, footerType } = useLayoutContext();
  const [isNavCollapsed, setNavCollapsed] = useState(false);
  const [menuOculto, setMenuOculto] = useState(leerOculto);

  // En escritorio el botón de la cabecera muestra u oculta el menú lateral; en móvil abre el cajón.
  const toggleNavCollapsed = () => {
    if (escritorio) {
      guardarOculto(!menuOculto);
      setMenuOculto(!menuOculto);
    } else {
      setNavCollapsed(!isNavCollapsed);
    }
  };
  useEffect(() => {
    if (isNavCollapsed) setNavCollapsed(!isNavCollapsed);
  }, [pathname]);

  return (
    <HorDefaultContainer
      className={clsx({
        boxedLayout: layoutType === LayoutType.BOXED,
        framedLayout: layoutType === LayoutType.FRAMED,
      })}
    >
      <HorDefaultWrapper
        className={clsx('horDefaultWrapper', {
          appMainFooter: footer && footerType === 'fluid',
          appMainFixedFooter: footer && footerType === 'fixed',
        })}
      >
        {!menuOculto && <MenuLateral routesConfig={routesConfig} />}
        <AppSidebar
          routesConfig={routesConfig}
          isNavCollapsed={isNavCollapsed && !escritorio}
          toggleNavCollapsed={toggleNavCollapsed}
        />

        <MainContent>
          <AppHeader
            toggleNavCollapsed={toggleNavCollapsed}
            routesConfig={routesConfig}
            menuLateralVisible={escritorio && !menuOculto}
          />
          <AppContentView routes={routes} />
          <AppFixedFooter />
        </MainContent>
        {/* TODO:: ajuste de la aplicación */}
        {/* <AppThemeSetting /> */}
      </HorDefaultWrapper>
    </HorDefaultContainer>
  );
};

export default HorDefault;
HorDefault.propTypes = {
  routes: PropsTypes.object.isRequired,
  routesConfig: PropsTypes.array.isRequired,
};
