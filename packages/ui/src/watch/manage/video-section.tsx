import Build from '@mui/icons-material/Build';
import Edit from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import type { ManageVideo, VideoEdit } from './types';
import { VideoEditDialog } from './video-edit-dialog';

interface VideoSectionProps {
  isLoading: boolean;
  videos: ManageVideo[];
  onUpdateVideo: (input: VideoEdit) => void;
  onRepairVideo: (videoId: string) => void;
  isRepairDisabled?: boolean;
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const statusLabel = (status: string): string => {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'failed':
      return 'Failed';
    case 'processing':
      return 'Processing';
    default:
      return status;
  }
};

const VideoSection = (props: VideoSectionProps) => {
  const { isLoading, videos, onUpdateVideo, onRepairVideo, isRepairDisabled } =
    props;

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ManageVideo | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(videos, {
        keys: ['title'],
        threshold: 0.4,
      }),
    [videos],
  );

  const filtered = search.trim()
    ? fuse.search(search.trim()).map((r) => r.item)
    : videos;

  return (
    <Box component="section">
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6" component="h2">
          Videos ({videos.length})
        </Typography>
      </Stack>

      <TextField
        placeholder="Search videos…"
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
            ? 'No videos match your search.'
            : 'You have no videos yet.'}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {filtered.map((video) => (
            <Paper key={video.id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: { sm: 'center' } }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>
                    {video.title}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {video.duration ? (
                      <Typography variant="body2" color="text.secondary">
                        {formatDuration(video.duration)}
                      </Typography>
                    ) : null}
                    <Typography variant="body2" color="text.secondary">
                      {statusLabel(video.status)}
                    </Typography>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    aria-label={`Edit ${video.title}`}
                    onClick={() => setEditing(video)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    aria-label={`Repair ${video.title}`}
                    onClick={() => onRepairVideo(video.id)}
                    disabled={isRepairDisabled}
                  >
                    <Build />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <VideoEditDialog
        open={Boolean(editing)}
        video={editing}
        onClose={() => setEditing(null)}
        onSave={onUpdateVideo}
        onRepair={onRepairVideo}
        isRepairDisabled={isRepairDisabled}
      />
    </Box>
  );
};

export { VideoSection };
