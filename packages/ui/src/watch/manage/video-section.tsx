import Build from '@mui/icons-material/Build';
import Edit from '@mui/icons-material/Edit';
import MoreVert from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from './confirm-dialog';
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

const statusLabel = (status?: string | null): string => {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'failed':
      return 'Failed';
    case 'processing':
      return 'Processing';
    default:
      return status ?? 'Unknown';
  }
};

const VideoSection = (props: VideoSectionProps) => {
  const { isLoading, videos, onUpdateVideo, onRepairVideo, isRepairDisabled } =
    props;

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ManageVideo | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuVideo, setMenuVideo] = useState<ManageVideo | null>(null);
  const [repairTarget, setRepairTarget] = useState<string | null>(null);

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

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    video: ManageVideo,
  ) => {
    setMenuAnchor(event.currentTarget);
    setMenuVideo(video);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuVideo(null);
  };

  const handleEdit = () => {
    if (menuVideo) setEditing(menuVideo);
    handleMenuClose();
  };

  const handleRepair = () => {
    if (menuVideo) setRepairTarget(menuVideo.id);
    handleMenuClose();
  };

  const handleConfirmRepair = () => {
    if (repairTarget) {
      onRepairVideo(repairTarget);
      setRepairTarget(null);
    }
  };

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
                <Box sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                  <Tooltip title="Actions">
                    <IconButton
                      aria-label={`Actions for ${video.title}`}
                      onClick={(event) => handleMenuOpen(event, video)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleRepair} disabled={isRepairDisabled}>
          <ListItemIcon>
            <Build fontSize="small" />
          </ListItemIcon>
          Repair fMP4
        </MenuItem>
      </Menu>

      <VideoEditDialog
        open={Boolean(editing)}
        video={editing}
        onClose={() => setEditing(null)}
        onSave={onUpdateVideo}
      />

      <ConfirmDialog
        open={Boolean(repairTarget)}
        title="Repair video"
        message="This will remux the video from TS to fMP4 format to fix playback issues. The repair runs in the background — you will get a notification when ready."
        confirmLabel="Start repair"
        onClose={() => setRepairTarget(null)}
        onConfirm={handleConfirmRepair}
      />
    </Box>
  );
};

export { VideoSection };
