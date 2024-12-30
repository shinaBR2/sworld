import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

const Logo = () => {
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
