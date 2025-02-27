import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledRelatedContainer = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  height: 'calc(100vh - 128px)',
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 56.25vw - 180px)',
  },
})) as typeof Box;

export { StyledRelatedContainer };
