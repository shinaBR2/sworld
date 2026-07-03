import { Link } from '@tanstack/react-router';
import { Auth } from 'core';
import { useLoadUserSettings } from 'core/user-settings/query-hooks';
import { useSaveUserSettings } from 'core/user-settings/mutation-hooks';
import type React from 'react';
import { useState } from 'react';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { Notification } from 'ui/universal/notification';
import { Header } from 'ui/watch/header';
import { SettingsPanel } from 'ui/watch/home-page/settings';
import { appConfig } from '../../config';
import { writeStandaloneCache } from '../../standalone-mode';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = (props: LayoutProps) => {
  const { children } = props;
  const authContext = Auth.useAuthContext();
  const { signOut, user, getAccessToken } = authContext;
  const [settingOpen, toggleSetting] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { sites } = appConfig;

  const { settings } = useLoadUserSettings({ getAccessToken });
  const { saveUserSettings } = useSaveUserSettings({ getAccessToken });

  // Settled order: persist to the DB (source of truth) first, then mirror into
  // the boot cache, then hard-reload so the router picks up the new history. On
  // failure, leave the cache untouched and surface the error — never reload into
  // a state the DB didn't accept.
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
    <FullPageContainer>
      <Header
        LinkComponent={Link}
        toggleSetting={toggleSetting}
        sites={sites}
        user={user}
      />
      <SettingsPanel
        open={settingOpen}
        toggle={toggleSetting}
        actions={{
          logout: signOut,
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
      {children}
    </FullPageContainer>
  );
};

export { Layout };
