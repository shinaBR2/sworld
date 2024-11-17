import { createTheme, responsiveFontSizes } from '@mui/material';
import baseTheme from '../../baseTheme';

const theme = createTheme({
  ...baseTheme,
});

export default responsiveFontSizes(theme);
