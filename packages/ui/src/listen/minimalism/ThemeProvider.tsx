import { ThemeProviderProps } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";

const MinimalismThemeProvider = (props: Omit<ThemeProviderProps, "theme">) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  );
};

export default MinimalismThemeProvider;
