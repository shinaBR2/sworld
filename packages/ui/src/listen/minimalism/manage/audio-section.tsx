import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { AudioEditDialog } from './audio-edit-dialog';
import { ConfirmDialog } from './confirm-dialog';
import { FeelingPicker } from './feeling-picker';
import type {
  AudioEdit,
  FeelingRef,
  ManageAudio,
  ManageFeeling,
} from './types';

interface AudioSectionProps {
  isLoading: boolean;
  audios: ManageAudio[];
  feelings: ManageFeeling[];
  onUpdateAudio: (input: AudioEdit) => void;
  onDeleteAudio: (id: string) => void;
  onAssignFeeling: (input: FeelingRef) => void;
  onUnassignFeeling: (input: FeelingRef) => void;
}

const AudioSection = (props: AudioSectionProps) => {
  const {
    isLoading,
    audios,
    feelings,
    onUpdateAudio,
    onDeleteAudio,
    onAssignFeeling,
    onUnassignFeeling,
  } = props;

  const [editing, setEditing] = useState<ManageAudio | null>(null);
  const [deleting, setDeleting] = useState<ManageAudio | null>(null);

  return (
    <Box component="section">
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Audios ({audios.length})
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : audios.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You have no audios yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {audios.map((audio) => (
            <Paper key={audio.id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: { sm: 'center' } }}
              >
                <Avatar
                  src={audio.thumbnailUrl || undefined}
                  variant="rounded"
                  sx={{ width: 56, height: 56 }}
                >
                  {audio.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>
                    {audio.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ mb: 1 }}
                  >
                    {audio.artistName}
                  </Typography>
                  <FeelingPicker
                    assignedTagIds={audio.tagIds}
                    feelings={feelings}
                    onAssign={(tagId) =>
                      onAssignFeeling({ audioId: audio.id, tagId })
                    }
                    onUnassign={(tagId) =>
                      onUnassignFeeling({ audioId: audio.id, tagId })
                    }
                  />
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    aria-label={`Edit ${audio.name}`}
                    onClick={() => setEditing(audio)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${audio.name}`}
                    onClick={() => setDeleting(audio)}
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <AudioEditDialog
        open={Boolean(editing)}
        audio={editing}
        onClose={() => setEditing(null)}
        onSave={onUpdateAudio}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete audio"
        message={`Delete "${deleting?.name}"? This can't be undone.`}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) onDeleteAudio(deleting.id);
        }}
      />
    </Box>
  );
};

export { AudioSection };
