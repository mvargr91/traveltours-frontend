import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import defaultConfig from '@crema/constants/defaultConfig';
import { useThemeContext } from './ThemeContextProvider';
import { useApariencia } from './AparienciaContextProvider';
import { ThemeMode } from '@crema/constants/AppEnums';

// Colores del menú del panel según Parametrización > Apariencia.
const coloresMenu = (menu, themeMode) => {
  const isDark = themeMode === ThemeMode.DARK;
  const fondo = isDark ? menu.fondoOscuro : menu.fondo;
  return {
    sidebarBgColor: fondo,
    sidebarTextColor: menu.texto,
    sidebarHeaderColor: fondo,
    sidebarMenuSelectedBgColor: menu.seleccionFondo,
    sidebarMenuSelectedTextColor: menu.seleccionTexto,
    mode: isDark ? ThemeMode.DARK : ThemeMode.LIGHT,
  };
};

const SidebarContext = createContext();
const SidebarActionsContext = createContext();

export const useSidebarContext = () => useContext(SidebarContext);

export const useSidebarActionsContext = () => useContext(SidebarActionsContext);

const SidebarContextProvider = ({ children }) => {
  const { themeMode } = useThemeContext();
  const { menu } = useApariencia().apariencia.panel;
  const [menuStyle, updateMenuStyle] = useState(
    defaultConfig.sidebar.menuStyle,
  );
  const [sidebarColorSet, updateSidebarColorSet] = useState(() => coloresMenu(menu, themeMode));
  const [allowSidebarBgImage, updateImage] = useState(
    defaultConfig.sidebar.allowSidebarBgImage,
  );
  const [sidebarBgImageId, setSidebarImage] = useState(
    defaultConfig.sidebar.sidebarBgImageId,
  );

  useEffect(() => {
    updateSidebarColorSet(coloresMenu(menu, themeMode));
  }, [themeMode, menu]);

  const setSidebarBgImage = useCallback((allowSidebarBgImage) => {
    updateImage(allowSidebarBgImage);
  }, []);

  const updateSidebarBgImage = useCallback((sidebarBgImageId) => {
    setSidebarImage(sidebarBgImageId);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        ...sidebarColorSet,
        menuStyle,
        allowSidebarBgImage,
        sidebarBgImageId,
        borderColor: defaultConfig.sidebar.borderColor,
      }}
    >
      <SidebarActionsContext.Provider
        value={{
          updateMenuStyle,
          updateSidebarColorSet,
          setSidebarBgImage,
          updateSidebarBgImage,
        }}
      >
        {children}
      </SidebarActionsContext.Provider>
    </SidebarContext.Provider>
  );
};

export default SidebarContextProvider;

SidebarContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
