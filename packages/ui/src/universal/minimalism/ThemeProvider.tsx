import { ThemeProviderProps } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material';
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
