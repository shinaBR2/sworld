import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import hooks, { type SAudioPlayerAudioItem } from 'core';
import { type ElementType, useMemo, useState } from 'react';
import MusicWidget from '../music-widget';

const { useSAudioPlayer } = hooks;

interface PlaylistDetailAudio {
  id: string;
  name: string;
  source: string;
  thumbnailUrl: string;
  artistName: string;
}

interface PlaylistDetailProps {
  queryRs: {
    playlist: { title: string } | null;
    audios: PlaylistDetailAudio[];
    isLoading: boolean;
    error?: unknown;
  };
  onRemove?: (audioId: string) => void;
  LinkComponent: ElementType;
}

const toAudioItem = (audio: PlaylistDetailAudio): SAudioPlayerAudioItem => ({
  id: audio.id,
  src: audio.source,
  name: audio.name,
  image: audio.thumbnailUrl,
  artistName: audio.artistName,
});

const BackLink = (props: { LinkComponent: ElementType }) => (
  <IconButton
    component={props.LinkComponent}
    to="/playlists"
    aria-label="back to playlists"
    size="small"
  >
    <ArrowBackIcon />
  </IconButton>
);

const Content = (
  props: Omit<PlaylistDetailProps, 'queryRs'> & {
    title: string;
    audios: PlaylistDetailAudio[];
  },
) => {
  const { title, audios, onRemove, LinkComponent } = props;
  const list = useMemo(() => audios.map(toAudioItem), [audios]);
  const [index, setIndex] = useState(0);

  const hookResult = useSAudioPlayer({ audioList: list, index });
  const { getControlsProps, playerState } = hookResult;
  const { isPlay, audioItem } = playerState;
  const { onPlay } = getControlsProps();

  const onItemSelect = (id: string) => {
    const nextIndex = list.findIndex((a) => a.id === id);
    setIndex(nextIndex < 0 ? 0 : nextIndex);
    if (!isPlay) {
      onPlay();
    }
  };

  return (
    <Stack spacing={2} py={3}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <BackLink LinkComponent={LinkComponent} />
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
      </Stack>

      {audios.length === 0 ? (
        <Typography color="text.secondary">
          This playlist has no audios yet.
        </Typography>
      ) : (
        <Box>
          <MusicWidget
            audioList={list}
            hookResult={hookResult}
            onItemSelect={onItemSelect}
          />
          <List aria-label="playlist audios">
            {audios.map((audio) => (
              <ListItemButton
                key={audio.id}
                selected={audio.id === audioItem?.id}
                onClick={() => onItemSelect(audio.id)}
              >
                <ListItemText
                  primary={audio.name}
                  secondary={audio.artistName}
                />
                {onRemove && (
                  <IconButton
                    edge="end"
                    aria-label={`remove ${audio.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(audio.id);
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}
    </Stack>
  );
};

const PlaylistDetail = (props: PlaylistDetailProps) => {
  const { queryRs, onRemove, LinkComponent } = props;
  const { playlist, audios, isLoading, error } = queryRs;

  if (isLoading) {
    return (
      <Stack spacing={2} py={3} aria-label="loading playlist">
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={320} />
      </Stack>
    );
  }

  if (error || !playlist) {
    return (
      <Stack spacing={2} py={3}>
        <BackLink LinkComponent={LinkComponent} />
        <Typography color="error">
          This playlist could not be loaded.
        </Typography>
      </Stack>
    );
  }

  return (
    <Content
      title={playlist.title}
      audios={audios}
      onRemove={onRemove}
      LinkComponent={LinkComponent}
    />
  );
};

export { PlaylistDetail };
export type { PlaylistDetailAudio };
