import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import baseTheme from '../../baseTheme';

const theme = createTheme({
  ...baseTheme,
});

export default responsiveFontSizes(theme);
