import PhoneIphone from '@mui/icons-material/PhoneIphone';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

interface SettingsSectionProps {
  standaloneMode: boolean;
  onChange: (value: boolean) => void;
  saving?: boolean;
}

const texts = {
  title: 'App experience',
  standalone: 'Standalone mode',
  standaloneHint: 'Hide the URL and act like an app',
};

const SettingsSection = (props: SettingsSectionProps) => {
  const { standaloneMode, onChange, saving } = props;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {texts.title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PhoneIphone color="action" />
          <Box>
            <Typography variant="body1">{texts.standalone}</Typography>
            <Typography variant="body2" color="text.secondary">
              {texts.standaloneHint}
            </Typography>
          </Box>
        </Box>
        <Switch
          checked={standaloneMode}
          disabled={saving}
          onChange={(event) => onChange(event.target.checked)}
          slotProps={{ input: { 'aria-label': texts.standalone } }}
        />
      </Box>
    </Paper>
  );
};

export { SettingsSection };
export type { SettingsSectionProps };
