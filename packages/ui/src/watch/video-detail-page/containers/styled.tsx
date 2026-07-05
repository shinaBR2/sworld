import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

// Reserves include the container's `pt: 3` (24px) top padding so the scroll
// region ends within the viewport (FullPageContainer clips at 100vh).
const StyledRelatedContainer = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  height: 'calc(100vh - 152px)',
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 56.25vw - 204px)',
  },
})) as typeof Box;

export { StyledRelatedContainer };
