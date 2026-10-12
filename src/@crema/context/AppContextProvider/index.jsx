import React from 'react';
import PropTypes from 'prop-types';
import ThemeContextProvider from './ThemeContextProvider';
import LocaleContextProvider from './LocaleContextProvider';
import LayoutContextProvider from './LayoutContextProvider';
import SidebarContextProvider from './SidebarContextProvider';
import AparienciaContextProvider from './AparienciaContextProvider';

const AppContextProvider = ({ children }) => {
  return (
    <AparienciaContextProvider>
      <ThemeContextProvider>
        <LocaleContextProvider>
          <LayoutContextProvider>
            <SidebarContextProvider>{children}</SidebarContextProvider>
          </LayoutContextProvider>
        </LocaleContextProvider>
      </ThemeContextProvider>
    </AparienciaContextProvider>
  );
};

export default AppContextProvider;

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
