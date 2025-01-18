import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import baseTheme from '../../baseTheme';

const theme = createTheme({
  ...baseTheme,
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 6,
      },
    },
  },
});

export default responsiveFontSizes(theme);
