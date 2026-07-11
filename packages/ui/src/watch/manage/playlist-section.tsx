import ExpandMore from '@mui/icons-material/ExpandMore';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import type {
  ManagePlaylist,
  PlaylistCreate,
  PlaylistEdit,
  ReorderPlaylistVariables,
} from './types';

interface PlaylistSectionProps {
  isLoading: boolean;
  playlists: ManagePlaylist[];
  onCreatePlaylist: (input: PlaylistCreate) => void;
  onUpdatePlaylist: (input: PlaylistEdit) => void;
  onReorderPlaylist: (input: ReorderPlaylistVariables) => void;
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const computeNewOrder = (
  videos: ManagePlaylist['playlist_videos'],
  index: number,
  direction: 'up' | 'down',
): Array<{ videoId: string; position: number }> => {
  const items = videos.map((v) => ({
    videoId: v.video_id as string,
    position: v.position,
  }));
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const temp = items[index]!.position;
  items[index]!.position = items[targetIndex]!.position;
  items[targetIndex]!.position = temp;
  return items;
};

const PlaylistSection = (props: PlaylistSectionProps) => {
  const {
    isLoading,
    playlists,
    onReorderPlaylist,
  } = props;

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | false>(false);

  const fuse = useMemo(
    () =>
      new Fuse(playlists, {
        keys: ['title'],
        threshold: 0.4,
      }),
    [playlists],
  );

  const filtered = search.trim()
    ? fuse.search(search.trim()).map((r) => r.item)
    : playlists;

  const handleAccordion = (panel: string) => () => {
    setExpanded(expanded === panel ? false : panel);
  };

  const handleMove = (
    playlistId: string,
    videos: ManagePlaylist['playlist_videos'],
    index: number,
    direction: 'up' | 'down',
  ) => {
    const items = computeNewOrder(videos, index, direction);
    onReorderPlaylist({ playlistId, items });
  };

  return (
    <Box component="section">
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6" component="h2">
          Playlists ({playlists.length})
        </Typography>
      </Stack>

      <TextField
        placeholder="Search playlists…"
        fullWidth
        size="small"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 2 }}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {search.trim()
            ? 'No playlists match your search.'
            : 'You have no playlists yet.'}
        </Typography>
      ) : (
        <Box>
          {filtered.map((playlist) => (
            <Accordion
              key={playlist.id}
              expanded={expanded === playlist.id}
              onChange={handleAccordion(playlist.id)}
              disableGutters
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>
                    {playlist.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {playlist.playlist_videos.length} video
                    {playlist.playlist_videos.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {playlist.playlist_videos.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No videos in this playlist yet.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {playlist.playlist_videos.map((pv, index) => {
                      const isFirst = index === 0;
                      const isLast =
                        index === playlist.playlist_videos.length - 1;

                      return (
                        <Stack
                          key={pv.video_id}
                          direction="row"
                          sx={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 0.5,
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {pv.video.title}
                            </Typography>
                            {pv.video.duration ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDuration(pv.video.duration)}
                              </Typography>
                            ) : null}
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Move up">
                              <span>
                                <IconButton
                                  aria-label={`Move ${pv.video.title} up`}
                                  size="small"
                                  disabled={isFirst}
                                  onClick={() =>
                                    handleMove(
                                      playlist.id,
                                      playlist.playlist_videos,
                                      index,
                                      'up',
                                    )
                                  }
                                >
                                  <KeyboardArrowUp fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Move down">
                              <span>
                                <IconButton
                                  aria-label={`Move ${pv.video.title} down`}
                                  size="small"
                                  disabled={isLast}
                                  onClick={() =>
                                    handleMove(
                                      playlist.id,
                                      playlist.playlist_videos,
                                      index,
                                      'down',
                                    )
                                  }
                                >
                                  <KeyboardArrowDown fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export { PlaylistSection };
