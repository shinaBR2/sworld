import EditIcon from '@mui/icons-material/Edit';
import Logout from '@mui/icons-material/Logout';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import type { ReactNode } from 'react';

interface SettingsPanelProps {
  open: boolean;
  toggle: React.Dispatch<React.SetStateAction<boolean>>;
  actions: {
    logout: () => void;
  };
  LinkComponent?: ({
    to,
    children,
  }: {
    to: string;
    children: ReactNode;
  }) => ReactNode;
}

const texts = {
  logout: 'Logout',
  write: 'Write',
};

const SettingsPanel = (props: SettingsPanelProps) => {
  const { open, toggle, actions, LinkComponent } = props;
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
          {LinkComponent && (
            <ListItemButton component={LinkComponent} to="/write">
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary={texts.write} />
            </ListItemButton>
          )}
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
