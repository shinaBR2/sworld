import Box from '@mui/material/Box';
import type { Auth } from 'core';
import { useState } from 'react';
import { FullWidthContainer } from '../../../universal';
import { Header } from '../../../universal/header';
import {
  CollectionSelect,
  type CollectionSelectPlaylist,
} from '../collection-select';
import { AudioList } from '../home/audio-list';
import { type Feeling, FeelingList } from '../home/feeling-list';
import { MainContainer } from '../home/main-container';
import { SettingsPanel } from '../home/settings';
import { CreatePlaylistDialog } from '../playlists/create-dialog';

interface HeaderSites {
  main: string;
  listen: string;
  watch: string;
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
  isLoading: boolean;
  // The playing track, mirrored to the URL. `activeAudioId` is the audio id
  // from the route (empty when nothing is selected yet); `onAudioChange` pushes
  // the current track's id back to the route as playback moves.
  activeAudioId: string;
  onAudioChange: (id: string) => void;
}

interface AllModeProps extends CommonProps {
  mode: 'all';
  // Feeling chips for the filter (empty until the home query resolves).
  feelings: Feeling[];
}

interface PlaylistModeProps extends CommonProps {
  mode: 'playlist';
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
    isLoading,
    activeAudioId,
    onAudioChange,
  } = props;

  const [settingOpen, setSettingOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeFeelingId, setActiveFeelingId] = useState('');

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
      <Header
        user={user}
        onAvatarClick={onProfileClick}
        siteChoices={{ sites, activeSite: 'listen' }}
      />
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
            // Single row on every viewport — the chips never wrap below the
            // select. Owns the row's vertical spacing so it's identical
            // whether the feeling chips are shown (All) or not (a playlist).
            my: 2,
          }}
        >
          {/* Select stays fixed — it's not part of the scrollable chips. */}
          <Box sx={{ flexShrink: 0 }}>
            <CollectionSelect
              value={collectionValue}
              playlists={playlists}
              onSelect={onSelectCollection}
              onCreateNew={() => setCreateOpen(true)}
              canCreate={Boolean(user)}
            />
          </Box>
          {mode === 'all' && (
            // Only the chips scroll horizontally; minWidth:0 lets this flex
            // item shrink so FeelingList's own overflow activates.
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FeelingList
                activeId={activeFeelingId}
                onSelect={setActiveFeelingId}
                feelings={props.feelings}
                isLoading={isLoading}
              />
            </Box>
          )}
        </Box>
        <AudioList
          queryRs={{ isLoading }}
          list={audios}
          activeFeelingId={mode === 'all' ? activeFeelingId : ''}
          activeAudioId={activeAudioId}
          onAudioChange={onAudioChange}
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
