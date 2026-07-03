import Logout from '@mui/icons-material/Logout';
import PhoneIphone from '@mui/icons-material/PhoneIphone';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import { UploadButton } from './upload-button';

interface SettingsPanelProps {
  open: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  actions: {
    logout: () => void;
  };
  standaloneMode?: boolean;
  onStandaloneModeChange?: (value: boolean) => void;
  saving?: boolean;
}

const texts = {
  logout: 'Logout',
  standalone: 'Standalone mode',
  standaloneHint: 'Hide the URL and act like an app',
};

const SettingsPanel = (props: SettingsPanelProps) => {
  const {
    open,
    toggle,
    actions,
    standaloneMode,
    onStandaloneModeChange,
    saving,
  } = props;
  const { logout } = actions;

  return (
    <Drawer anchor="right" open={open} onClose={() => toggle(false)}>
      <Box
        sx={{
          width: 250,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List sx={{ flex: 1 }}>
          <UploadButton />
          <ListItem>
            <ListItemIcon>
              <PhoneIphone />
            </ListItemIcon>
            <ListItemText
              primary={texts.standalone}
              secondary={texts.standaloneHint}
            />
            <Switch
              edge="end"
              checked={standaloneMode ?? false}
              disabled={saving}
              onChange={(event) =>
                onStandaloneModeChange?.(event.target.checked)
              }
              inputProps={{ 'aria-label': texts.standalone }}
            />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItemButton onClick={logout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary={texts.logout} />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export { SettingsPanel };
