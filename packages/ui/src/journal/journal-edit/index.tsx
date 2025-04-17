import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import InputBase from '@mui/material/InputBase';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import { Journal, MoodType } from 'core/src/journal/types';

interface JournalEditProps {
  journal?: Journal | null;
  isLoading: boolean;
  isSaving: boolean;
  onBackClick: () => void;
  onSave: (input: any) => void;
}

export const JournalEdit: React.FC<JournalEditProps> = ({ journal, isLoading, isSaving, onBackClick, onSave }) => {
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [mood, setMood] = useState<MoodType>('neutral');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

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

  const handleMoodChange = (_: React.MouseEvent<HTMLElement>, newMood: MoodType | null) => {
    if (newMood !== null) {
      setMood(newMood);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() !== '' && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
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
          <IconButton onClick={onBackClick} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
          <Typography variant="h6">{journal ? 'Edit Entry' : 'New Entry'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={onBackClick} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
          <Typography variant="h6">{journal ? 'Edit Entry' : 'New Entry'}</Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!content.trim() || isSaving}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          size="small"
          sx={{ width: '50%' }}
          InputProps={{
            sx: { bgcolor: 'action.hover', borderRadius: 1 },
          }}
        />

        <ToggleButtonGroup value={mood} exclusive onChange={handleMoodChange} aria-label="mood" size="small">
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

      <TextField
        multiline
        fullWidth
        minRows={10}
        maxRows={20}
        placeholder="What's on your mind today?"
        value={content}
        onChange={e => setContent(e.target.value)}
        sx={{
          mb: 2,
          flex: 1,
          '& .MuiOutlinedInput-root': {
            height: '100%',
            alignItems: 'flex-start',
          },
          '& .MuiOutlinedInput-input': {
            height: '100%',
            overflow: 'auto',
          },
        }}
      />

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocalOfferIcon sx={{ fontSize: 16, color: '#666' }} />
          <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
            Add tags
          </Typography>
        </Box>

        <Paper
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.5,
            mb: 1,
          }}
          variant="outlined"
        >
          {tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onDelete={() => handleRemoveTag(tag)}
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.main',
                '& .MuiChip-deleteIcon': {
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                  },
                },
              }}
            />
          ))}

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 100 }}>
            <InputBase
              placeholder="New tag..."
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
            />
            <IconButton size="small" onClick={handleAddTag} disabled={!newTag.trim()} sx={{ p: 0.5 }}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>

        <Typography variant="caption" color="text.secondary">
          Press Enter to add a tag
        </Typography>
      </Box>
    </Box>
  );
};
