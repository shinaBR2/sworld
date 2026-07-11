import { createLazyFileRoute } from '@tanstack/react-router';
import { useAuthContext } from 'core/providers/auth';
import { useSaveUserSettings } from 'core/user-settings/mutation-hooks';
import { useLoadUserSettings } from 'core/user-settings/query-hooks';
import { useState } from 'react';
import { AuthRoute } from 'ui/universal/authRoute';
import { SettingsScreen } from 'ui/watch/settings';
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
      <SettingsScreen
        standaloneMode={settings?.watch.standaloneMode ?? false}
        onChange={handleStandaloneModeChange}
        saving={saving}
        error={error}
        onCloseError={() => setError(null)}
      />
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
