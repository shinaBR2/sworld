import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuthContext } from 'core/providers/auth';
import { useSaveUserSettings } from 'core/user-settings/mutation-hooks';
import { useLoadUserSettings } from 'core/user-settings/query-hooks';
import { useEffect, useState } from 'react';
import { LoadingBackdrop, Notification } from 'ui/universal';
import { ManageScreen } from 'ui/watch/manage';
import { appConfig } from '../config';
import { clearStandaloneCache, writeStandaloneCache } from '../standalone-mode';

const Content = () => {
  const { user, signOut, getAccessToken } = useAuthContext();
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
    <>
      <ManageScreen
        sites={appConfig.sites}
        user={user}
        onLogout={() => {
          clearStandaloneCache();
          signOut();
        }}
        standaloneMode={settings?.watch.standaloneMode ?? false}
        onStandaloneModeChange={handleStandaloneModeChange}
        saving={saving}
      />
      {error && (
        <Notification
          notification={{ message: error, severity: 'error' }}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
};

const Manage = () => {
  const { isLoading, user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/' });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <LoadingBackdrop message="Valuable things deserve waiting" />;
  }

  if (!user) {
    return null;
  }

  return <Content />;
};

export const Route = createLazyFileRoute('/manage')({
  component: Manage,
});
