import Box from '@mui/material/Box';
import type { Auth, listenQueryHooks } from 'core';
import { useState } from 'react';
import { FullWidthContainer } from '../../../universal';
import {
  CollectionSelect,
  type CollectionSelectPlaylist,
} from '../collection-select';
import { Header } from '../header';
import { AudioList } from '../home/audio-list';
import { FeelingList } from '../home/feeling-list';
import { MainContainer } from '../home/main-container';
import { SettingsPanel } from '../home/settings';
import { CreatePlaylistDialog } from '../playlists/create-dialog';

type AudiosQueryRs = ReturnType<typeof listenQueryHooks.useLoadAudios>;

interface HeaderSites {
  listen: string;
  watch: string;
  play: string;
  til: string;
}

interface CommonProps {
  sites: HeaderSites;
  user: Auth.CustomUser | null;
  onSignIn: () => void;
  onLogout: () => void;
  // The collection select is route-driven: `value` reflects the current route,
  // `onSelectCollection` navigates.
  collectionValue: 'all' | string;
  playlists: CollectionSelectPlaylist[];
  onSelectCollection: (value: 'all' | string) => void;
  onCreate: (title: string) => void;
  // Raw audios for the player (AudioList maps them to player items).
  audios: unknown[];
  // Playlist mode: remove a track from the playlist.
  onRemove?: (id: string) => void;
}

interface AllModeProps extends CommonProps {
  mode: 'all';
  // Full home query result — also feeds the feeling filter.
  queryRs: AudiosQueryRs;
}

interface PlaylistModeProps extends CommonProps {
  mode: 'playlist';
  isLoading: boolean;
}

type ListeningScreenProps = AllModeProps | PlaylistModeProps;

/**
 * The single screen behind every listen page. Home and a playlist render the
 * exact same layout — Header, a collection select (+ feeling filter on "All"),
 * and the player — differing only in which audios feed it.
 */
const ListeningScreen = (props: ListeningScreenProps) => {
  const {
    mode,
    sites,
    user,
    onSignIn,
    onLogout,
    collectionValue,
    playlists,
    onSelectCollection,
    onCreate,
    audios,
    onRemove,
  } = props;

  const [settingOpen, setSettingOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeFeelingId, setActiveFeelingId] = useState('');

  const isLoading = mode === 'all' ? props.queryRs.isLoading : props.isLoading;

  const onProfileClick = () => {
    if (user) {
      setSettingOpen(true);
    } else {
      onSignIn();
    }
  };

  const handleCreate = (title: string) => {
    onCreate(title);
    setCreateOpen(false);
  };

  return (
    <FullWidthContainer>
      <Header sites={sites} onProfileClick={onProfileClick} user={user} />
      <SettingsPanel
        open={settingOpen}
        toggle={setSettingOpen}
        actions={{ logout: onLogout }}
      />
      <MainContainer>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <CollectionSelect
            value={collectionValue}
            playlists={playlists}
            onSelect={onSelectCollection}
            onCreateNew={() => setCreateOpen(true)}
          />
          {mode === 'all' && (
            <FeelingList
              activeId={activeFeelingId}
              onSelect={setActiveFeelingId}
              queryRs={props.queryRs}
            />
          )}
        </Box>
        <AudioList
          queryRs={{ isLoading }}
          list={audios}
          activeFeelingId={mode === 'all' ? activeFeelingId : ''}
          onRemove={onRemove}
        />
      </MainContainer>
      <CreatePlaylistDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </FullWidthContainer>
  );
};

export { ListeningScreen };
export type { ListeningScreenProps };
