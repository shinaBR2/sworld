import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Notification } from '../../universal';
import { SettingsSection } from '../manage/settings-section';

interface SettingsScreenProps {
  standaloneMode: boolean;
  onChange: (next: boolean) => void;
  saving: boolean;
  error: string | null;
  onCloseError: () => void;
}

const SettingsScreen = (props: SettingsScreenProps) => {
  const { standaloneMode, onChange, saving, error, onCloseError } = props;

  return (
    <Box sx={{ maxWidth: 'xl', mx: 'auto', width: '100%', px: 3 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your app experience.
        </Typography>
      </Box>
      <Box sx={{ pb: 8 }}>
        <SettingsSection
          standaloneMode={standaloneMode}
          onChange={onChange}
          saving={saving}
        />
      </Box>
      {error && (
        <Notification
          notification={{ message: error, severity: 'error' }}
          onClose={onCloseError}
        />
      )}
    </Box>
  );
};

export { SettingsScreen };
export type { SettingsScreenProps };
