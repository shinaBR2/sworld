import LibraryMusic from '@mui/icons-material/LibraryMusic';
import Logout from '@mui/icons-material/Logout';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

interface SettingsPanelProps {
  open: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  actions: {
    logout: () => void;
    // Opens the management dashboard. Omitted for anonymous visitors, who have
    // nothing to manage — so the entry only appears when signed in.
    manage?: () => void;
  };
}

const texts = {
  logout: 'Logout',
  manage: 'Manage library',
};

const SettingsPanel = (props: SettingsPanelProps) => {
  const { open, toggle, actions } = props;
  const { logout, manage } = actions;

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
          {manage ? (
            <ListItemButton onClick={manage}>
              <ListItemIcon>
                <LibraryMusic />
              </ListItemIcon>
              <ListItemText primary={texts.manage} />
            </ListItemButton>
          ) : null}
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
