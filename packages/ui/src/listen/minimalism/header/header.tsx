import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import { StyledHeader } from './Styled';
import { Logo } from '../../../universal';

// Source: https://mui.com/material-ui/react-app-bar/#app-bar-with-responsive-menu
const Header = () => {
  return (
    <StyledHeader
      position="sticky"
      elevation={0}
      role="banner"
      aria-label="Site header"
    >
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <Logo />
        </Toolbar>
      </Container>
    </StyledHeader>
  );
};
export { Header };
