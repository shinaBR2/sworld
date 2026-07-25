import LogoutIcon from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface LookSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
  userName?: string | null;
}

const PANEL_SX = {
  width: { xs: '80vw', sm: '20rem' },
  height: '100%',
};

// The account drawer for Look — a view app, so the avatar opens this panel
// (sign-out, and settings later) instead of signing out on a single click.
// Sign-out is pinned to the bottom as a menu row, matching the Watch drawer.
const LookSettingsPanel = (props: LookSettingsPanelProps) => {
  const { open, onClose, onSignOut, userName } = props;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Stack sx={PANEL_SX}>
        {userName ? (
          <Typography variant="subtitle1" color="text.primary" sx={{ p: 3 }}>
            {userName}
          </Typography>
        ) : null}
        <Divider sx={{ mt: 'auto' }} />
        <List>
          <ListItemButton onClick={onSignOut}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </ListItemButton>
        </List>
      </Stack>
    </Drawer>
  );
};

export { LookSettingsPanel };
