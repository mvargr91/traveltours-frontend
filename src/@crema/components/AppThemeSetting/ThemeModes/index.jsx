import { CustomizerItemWrapper, StyledToggleButton } from "../index.style";
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { ThemeMode } from "@crema/constants/AppEnums";
import clsx from "clsx";
import {
  useThemeActionsContext,
  useThemeContext,
} from "@crema/context/AppContextProvider/ThemeContextProvider";
import IntlMessages from "@crema/helpers/IntlMessages";

const ThemeModes = () => {
  const { updateThemeMode } = useThemeActionsContext();
  const { themeMode } = useThemeContext();

  const onModeChange = (event, newMode) => {
    if (!newMode) return;
    updateThemeMode(newMode);
  };

  return (
    <CustomizerItemWrapper>
      <Box component="h4" sx={{ mb: 2 }}>
        <IntlMessages id="customizer.themeMode" />
      </Box>
      <ToggleButtonGroup
        value={themeMode}
        exclusive
        onChange={onModeChange}
        aria-label="theme mode toggle"
      >
        <StyledToggleButton
          value={ThemeMode.LIGHT}
          className={clsx({
            active: themeMode === ThemeMode.LIGHT,
          })}
          aria-label="Light mode"
        >
          <IntlMessages id="customizer.light" />
        </StyledToggleButton>

        <StyledToggleButton
          value={ThemeMode.DARK}
          className={clsx({
            active: themeMode === ThemeMode.DARK,
          })}
          aria-label="Dark mode"
        >
          <IntlMessages id="customizer.dark" />
        </StyledToggleButton>
      </ToggleButtonGroup>
    </CustomizerItemWrapper>
  );
};

export default ThemeModes;
