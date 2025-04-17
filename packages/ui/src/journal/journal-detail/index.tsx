// packages/ui/src/journal/journal-detail.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
// MUI Icons imports
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { MoodIcon } from '../mood-icons';
import { formatDate, formatDateTime } from 'core/universal/common';
import { Journal, MoodType } from 'core/src/journal';

interface JournalDetailProps {
  journal: Journal | null;
  isLoading: boolean;
  onBackClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export const JournalDetail: React.FC<JournalDetailProps> = ({
  journal,
  isLoading,
  onBackClick,
  onEditClick,
  onDeleteClick,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onBackClick} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
          <Skeleton width={200} height={32} />
        </Box>

        <Paper sx={{ p: 3, boxShadow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Skeleton width={60} height={24} />
              <Skeleton width={80} height={24} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
          </Box>

          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} width="60%" />

          <Box sx={{ mt: 4 }}>
            <Skeleton width={200} height={16} />
            <Skeleton width={200} height={16} sx={{ mt: 0.5 }} />
          </Box>
        </Paper>
      </Box>
    );
  }

  if (!journal) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onBackClick} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
          <Typography variant="h6">Journal Entry</Typography>
        </Box>

        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Journal entry not found.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={onBackClick} sx={{ mr: 1 }}>
          <ArrowBackIcon fontSize="medium" />
        </IconButton>
        <Typography variant="h6">{formatDate(journal.date)}</Typography>
      </Box>

      <Paper sx={{ p: 3, boxShadow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {journal.tags.map((tag: string) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  bgcolor: 'action.hover',
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <MoodIcon mood={journal.mood as MoodType} size={20} />

            <IconButton size="small" color="primary" onClick={onEditClick} sx={{ p: 0.5 }}>
              <EditIcon fontSize="small" />
            </IconButton>

            <IconButton size="small" color="error" onClick={onDeleteClick} sx={{ p: 0.5 }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Typography
          variant="body1"
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            lineHeight: 1.6,
          }}
        >
          {journal.content}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Created: {formatDateTime(journal.createdAt)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Updated: {formatDateTime(journal.updatedAt)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
