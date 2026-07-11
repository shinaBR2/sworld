import { createLazyFileRoute } from '@tanstack/react-router';
import { useAuthContext } from 'core/providers/auth';
import { useSaveUserSettings } from 'core/user-settings/mutation-hooks';
import { useLoadUserSettings } from 'core/user-settings/query-hooks';
import { useState } from 'react';
import { AuthRoute } from 'ui/universal/authRoute';
import { SettingsSection } from 'ui/watch/manage/settings-section';
import { Notification } from 'ui/universal';
import { Box, Typography } from '@mui/material';
import { Layout } from '../components/layout';
import { writeStandaloneCache } from '../standalone-mode';

const Content = () => {
  const { getAccessToken } = useAuthContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { settings } = useLoadUserSettings({ getAccessToken });
  const { saveUserSettings } = useSaveUserSettings({ getAccessToken });

  const handleStandaloneModeChange = async (next: boolean) => {
    if (!settings || saving) {
      return;
    }

    setSaving(true);
    try {
      await saveUserSettings(settings, { watch: { standaloneMode: next } });
      writeStandaloneCache(next);
      window.location.reload();
    } catch {
      setSaving(false);
      setError('Failed to save setting. Please try again.');
    }
  };

  return (
    <Layout>
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
            standaloneMode={settings?.watch.standaloneMode ?? false}
            onChange={handleStandaloneModeChange}
            saving={saving}
          />
        </Box>
      </Box>
      {error && (
        <Notification
          notification={{ message: error, severity: 'error' }}
          onClose={() => setError(null)}
        />
      )}
    </Layout>
  );
};

export const Route = createLazyFileRoute('/settings')({
  component: () => {
    return (
      <AuthRoute>
        <Content />
      </AuthRoute>
    );
  },
});
