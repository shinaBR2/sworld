import { Link, useNavigate } from '@tanstack/react-router';
import { Auth } from 'core';
import { useLoadAlbums } from 'core/look/query-hooks/albums';
import { type ReactNode, useState } from 'react';
import { LookCollectionSelect } from 'ui/look/collection-select';
import { LookSettingsPanel } from 'ui/look/settings';
import { FullPageContainer } from 'ui/universal/containers/full-page';
import { Header } from 'ui/universal/header';

const ALL_VALUE = 'all';

interface LayoutProps {
  children: ReactNode;
  // The active collection: 'all' for the full timeline, or an album id.
  collectionValue?: string;
}

const Layout = (props: LayoutProps) => {
  const { children, collectionValue = ALL_VALUE } = props;
  const { user, signOut, getAccessToken } = Auth.useAuthContext();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { albums } = useLoadAlbums({ getAccessToken });

  const onSelectCollection = (value: string) => {
    if (value === ALL_VALUE) {
      navigate({ to: '/' });
      return;
    }
    navigate({ to: '/album/$albumId', params: { albumId: value } });
  };

  return (
    <FullPageContainer>
      <Header
        LinkComponent={Link}
        user={user}
        onAvatarClick={() => setSettingsOpen(true)}
      />
      <LookSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSignOut={signOut}
        userName={user?.name}
      />
      <LookCollectionSelect
        value={collectionValue}
        albums={albums}
        onSelect={onSelectCollection}
      />
      {children}
    </FullPageContainer>
  );
};

export { Layout };
