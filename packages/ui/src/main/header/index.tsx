import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Logo from '../../universal/logo';
import { ResponsiveAvatar } from '../../universal/images/image';
import { CustomUser } from 'core/providers/auth';

interface HeaderProps {
  onProfileClick: () => void;
  user: CustomUser | null;
}

const Header = (props: HeaderProps) => {
  const { onProfileClick, user } = props;
  const avatarUrl = user?.picture;

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 'fit-content',
          }}
        >
          <Logo />
        </Box>

        <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
          <IconButton onClick={onProfileClick} aria-label="account options">
            {avatarUrl ? (
              <ResponsiveAvatar src={avatarUrl} alt={user.name} data-testid="user-avatar" />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export { Header };
