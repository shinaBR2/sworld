import type { ThemeProviderProps } from '@emotion/react';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import {
  GlassmorphismThemeContextProvider,
  useGlassmorphismTheme,
} from './themeContext';
import { theme as darkTheme } from './themeGlassmorphism';
import { theme as lightTheme } from './themeGlassmorphismLight';

interface InnerProviderProps extends Omit<ThemeProviderProps, 'theme'> {
  children: React.ReactNode;
}

const InnerProvider = (props: InnerProviderProps) => {
  const { children } = props;
  const { mode } = useGlassmorphismTheme();

  const theme = useMemo(() => {
    return mode === 'light' ? lightTheme : darkTheme;
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

interface GlassmorphismProviderProps {
  children: React.ReactNode;
  defaultMode?: 'light' | 'dark';
}

const GlassmorphismProvider = (props: GlassmorphismProviderProps) => {
  const { children, defaultMode = 'light' } = props;

  return (
    <GlassmorphismThemeContextProvider defaultMode={defaultMode}>
      <InnerProvider>{children}</InnerProvider>
    </GlassmorphismThemeContextProvider>
  );
};

export { GlassmorphismProvider, useGlassmorphismTheme };
