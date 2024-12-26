import { AppBar, AppBarProps } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';

const StyledHeader = styled(AppBar)<AppBarProps>(({ theme }) => {
  return {
    backgroundColor: alpha(theme.palette.common.white, 0.8),
  };
}) as typeof AppBar;

export { StyledHeader };
