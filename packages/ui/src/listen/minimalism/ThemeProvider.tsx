import { ThemeProviderProps } from "@emotion/react";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";

const MinimalismThemeProvider = (props: Omit<ThemeProviderProps, "theme">) => {
  return <ThemeProvider theme={theme} {...props} />;
};

export default MinimalismThemeProvider;
