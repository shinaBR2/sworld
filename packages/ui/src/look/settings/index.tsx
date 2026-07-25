import LogoutIcon from '@mui/icons-material/Logout';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface LookSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
  userName?: string | null;
}

const PANEL_SX = { width: { xs: '80vw', sm: '20rem' }, p: 3 };

// The account drawer for Look — a view app, so the avatar opens this panel
// (sign-out, and settings later) instead of signing out on a single click.
const LookSettingsPanel = (props: LookSettingsPanelProps) => {
  const { open, onClose, onSignOut, userName } = props;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Stack sx={PANEL_SX} spacing={3}>
        {userName ? (
          <Typography variant="subtitle1" color="text.primary">
            {userName}
          </Typography>
        ) : null}
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={onSignOut}
          fullWidth
        >
          Sign out
        </Button>
      </Stack>
    </Drawer>
  );
};

export { LookSettingsPanel };
