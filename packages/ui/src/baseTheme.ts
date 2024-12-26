import { createTheme } from '@mui/material';

const baseTheme = createTheme({
  palette: {
    primary: {
      main: '#cd9bd6',
      light: '#ffccff',
      dark: '#9b6ca4',
    },
    secondary: {
      main: '#a4d69b',
      light: '#d6ffcc',
      dark: '#74a46c',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

export default baseTheme;
