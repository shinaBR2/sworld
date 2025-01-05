import Box from '@mui/material/Box';
import { WithLinkComponent } from '../../watch/videos/interface';
import Link from '@mui/material/Link';

interface LogoProps extends WithLinkComponent {}

const Logo = (props: LogoProps) => {
  const { LinkComponent } = props;
  if (LinkComponent) {
    return (
      <LinkComponent to="/">
        <Box
          component="img"
          src="https://res.cloudinary.com/shinabr2/image/upload/v1670251329/Public/Images/sworld-logo-72x72.png"
          sx={{ height: 40, width: 40 }}
          alt="Flow Logo"
        />
      </LinkComponent>
    );
  }

  return (
    <Link href="/">
      <Box
        component="img"
        src="https://res.cloudinary.com/shinabr2/image/upload/v1670251329/Public/Images/sworld-logo-72x72.png"
        sx={{ height: 40, width: 40 }}
        alt="Flow Logo"
      />
    </Link>
  );
};

export default Logo;
