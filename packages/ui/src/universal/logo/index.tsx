import { WithLinkComponent } from '../../watch/videos/interface';
import Link from '@mui/material/Link';
import { ResponsiveImage } from '../images/image';

interface LogoProps extends WithLinkComponent {}

const Content = () => {
  return (
    <ResponsiveImage
      sizes="40px"
      widths={[40]}
      src="https://res.cloudinary.com/shinabr2/image/upload/v1670251329/Public/Images/sworld-logo-72x72.png"
      alt="Flow Logo"
    />
  );
};

const Logo = (props: LogoProps) => {
  const { LinkComponent } = props;
  if (LinkComponent) {
    return (
      <LinkComponent to="/">
        <Content />
      </LinkComponent>
    );
  }

  return (
    <Link href="/">
      <Content />
    </Link>
  );
};

export default Logo;
