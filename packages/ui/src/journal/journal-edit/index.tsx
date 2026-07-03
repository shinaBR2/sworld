import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type { Journal, MoodType } from 'core/src/journal/types';
import type React from 'react';
import { useEffect, useState } from 'react';

interface JournalEditProps {
  journal?: Journal | null;
  isLoading: boolean;
  isSaving: boolean;
  onBackClick: () => void;
  onSave: (input: any) => void;
}

export const JournalEdit: React.FC<JournalEditProps> = ({
  journal,
  isLoading,
  isSaving,
  onBackClick,
  onSave,
}) => {
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [mood, setMood] = useState<MoodType>('neutral');
  // Tags are no longer editable in the form, but we keep any existing tags in
  // state so editing an already-tagged entry preserves them on save.
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (journal) {
      setContent(journal.content);
      setDate(journal.date);
      setMood(journal.mood as MoodType);
      setTags(journal.tags || []);
    } else {
      // Set today's date for new journal entries
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setContent('');
      setMood('neutral');
      setTags([]);
    }
  }, [journal]);

  const handleMoodChange = (
    _: React.MouseEvent<HTMLElement>,
    newMood: MoodType | null,
  ) => {
    if (newMood !== null) {
      setMood(newMood);
    }
  };

  const handleSave = () => {
    const input = {
      date,
      content,
      mood,
      tags,
    };
    onSave(input);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {journal ? 'Edit Entry' : 'New Entry'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          pb: 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6">
          {journal ? 'Edit Entry' : 'New Entry'}
        </Typography>
      </Box>
      {/* Non-scrollable date + mood controls */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextField
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          size="small"
          sx={{ width: '50%' }}
          slotProps={{
            input: {
              sx: { bgcolor: 'action.hover', borderRadius: 1 },
            },
          }}
        />

        <ToggleButtonGroup
          value={mood}
          exclusive
          onChange={handleMoodChange}
          aria-label="mood"
          size="small"
        >
          <ToggleButton
            value="sad"
            aria-label="sad"
            sx={{
              color: 'error.main',
              '&.Mui-selected': {
                backgroundColor: 'error.light',
                color: 'error.main',
              },
            }}
          >
            <SentimentVeryDissatisfiedIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="neutral"
            aria-label="neutral"
            sx={{
              color: 'info.main',
              '&.Mui-selected': {
                backgroundColor: 'info.light',
                color: 'info.main',
              },
            }}
          >
            <SentimentNeutralIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="happy"
            aria-label="happy"
            sx={{
              color: 'success.main',
              '&.Mui-selected': {
                backgroundColor: 'success.light',
                color: 'success.main',
              },
            }}
          >
            <SentimentSatisfiedAltIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {/* Scrollable content area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          pb: 1,
          display: 'flex',
          flexDirection: 'column',
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.action.hover,
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: (theme) => theme.palette.action.disabled,
          },
        }}
      >
        <TextField
          multiline
          fullWidth
          placeholder="What's on your mind today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{
            flex: 1, // Allow TextField to grow and fill space
            '& .MuiOutlinedInput-root': {
              // flex (not height:100%) fills the flex-column form control.
              flex: 1,
              alignItems: 'flex-start',
              bgcolor: 'action.hover',
              fontSize: '1rem',
              lineHeight: 1.7,
            },
            // Multiline textareas autosize to content, leaving dead space in a
            // full-height field — force the textarea to fill and scroll itself.
            '& .MuiInputBase-inputMultiline': {
              height: '100% !important',
              overflow: 'auto !important',
            },
          }}
        />
      </Box>
      {/* Bottom action bar — blends into the dialog surface (the textarea
          scrolls internally, so no opaque background is needed here). */}
      <Box
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          pt: 1,
          pb: 'max(8px, env(safe-area-inset-bottom))',
          display: 'flex',
          gap: 1,
        }}
      >
        <Button
          onClick={onBackClick}
          variant="outlined"
          color="inherit"
          fullWidth
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!content.trim() || isSaving}
          fullWidth
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
};
