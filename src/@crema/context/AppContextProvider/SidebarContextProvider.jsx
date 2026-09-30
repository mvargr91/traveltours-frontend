import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import defaultConfig, { DarkSidebar, LightSidebar } from '@crema/constants/defaultConfig';
import { useThemeContext } from './ThemeContextProvider';
import { ThemeMode } from '@crema/constants/AppEnums';

const SidebarContext = createContext();
const SidebarActionsContext = createContext();

export const useSidebarContext = () => useContext(SidebarContext);

export const useSidebarActionsContext = () => useContext(SidebarActionsContext);

const SidebarContextProvider = ({ children }) => {
  const { themeMode } = useThemeContext();
  const [menuStyle, updateMenuStyle] = useState(
    defaultConfig.sidebar.menuStyle,
  );
  const [sidebarColorSet, updateSidebarColorSet] = useState(
    themeMode === ThemeMode.DARK ? DarkSidebar : defaultConfig.sidebar.colorSet,
  );
  const [allowSidebarBgImage, updateImage] = useState(
    defaultConfig.sidebar.allowSidebarBgImage,
  );
  const [sidebarBgImageId, setSidebarImage] = useState(
    defaultConfig.sidebar.sidebarBgImageId,
  );

  useEffect(() => {
    updateSidebarColorSet(
      themeMode === ThemeMode.DARK ? DarkSidebar : LightSidebar,
    );
  }, [themeMode]);

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
