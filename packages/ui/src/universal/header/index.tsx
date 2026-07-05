import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import type { CustomUser } from 'core/providers/auth';
import type { ComponentProps, ReactNode } from 'react';
import type { WithLinkComponent } from '../../watch/videos/types';
import { ResponsiveAvatar } from '../images/image';
import Logo from '../logo';
import { ThemeToggleButton } from '../minimalism';
import SiteChoices from '../site-choices';

// Derive the switcher config from SiteChoices so the two never drift apart.
type SiteChoicesConfig = ComponentProps<typeof SiteChoices>;

// The shared header owns only the true commons — logo, optional site switcher,
// theme toggle and avatar. App-specific extras arrive exclusively through the
// `actions` slot, rendered between the toggle and the avatar. No app-specific
// branching ever lives inside this component.
interface HeaderProps extends WithLinkComponent {
  user: CustomUser | null;
  onAvatarClick: () => void;
  siteChoices?: SiteChoicesConfig;
  actions?: ReactNode;
}

const Header = (props: HeaderProps) => {
  const { user, onAvatarClick, siteChoices, actions, LinkComponent } = props;
  const avatarUrl = user?.picture;

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar
        sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 'fit-content',
          }}
        >
          <Logo LinkComponent={LinkComponent} />
          {siteChoices ? (
            <SiteChoices
              activeSite={siteChoices.activeSite}
              sites={siteChoices.sites}
            />
          ) : null}
        </Box>

        <Box
          sx={{
            display: 'flex',
            minWidth: 'fit-content',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <ThemeToggleButton />
          {actions}
          <IconButton onClick={onAvatarClick} aria-label="account options">
            {avatarUrl ? (
              <ResponsiveAvatar
                src={avatarUrl}
                alt={user?.name}
                data-testid="user-avatar"
              />
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
export type { HeaderProps, SiteChoicesConfig };
