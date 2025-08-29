import type { ThemeProviderProps } from '@emotion/react';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

const MinimalismThemeProvider = (props: Omit<ThemeProviderProps, 'theme'>) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  );
};

export default MinimalismThemeProvider;
