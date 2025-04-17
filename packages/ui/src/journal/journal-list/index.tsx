// packages/ui/src/journal/journal-list.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
// MUI Icons imports
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { MoodIcon } from '../mood-icons';
import { formatDate, getMonthName } from 'core/universal/common';
import { Journal, JournalStats, MoodType } from 'core/src/journal/types';

interface JournalListProps {
  journals: Journal[];
  stats: JournalStats;
  isLoading: boolean;
  month: number;
  year: number;
  onJournalClick: (journal: Journal) => void;
  onMonthChange: (month: number, year: number) => void;
}

export const JournalList: React.FC<JournalListProps> = ({
  journals,
  stats,
  isLoading,
  month,
  year,
  onJournalClick,
  onMonthChange,
}) => {
  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    onMonthChange(newMonth, newYear);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    onMonthChange(newMonth, newYear);
  };

  const renderStatCard = (mood: MoodType | 'total', count: number) => {
    let icon;
    let color;
    let label;

    switch (mood) {
      case 'happy':
        icon = <SentimentSatisfiedAltIcon fontSize="small" />;
        color = '#4caf50';
        label = 'Happy';
        break;
      case 'neutral':
        icon = <SentimentNeutralIcon fontSize="small" />;
        color = '#2196f3';
        label = 'Neutral';
        break;
      case 'sad':
        icon = <SentimentVeryDissatisfiedIcon fontSize="small" />;
        color = '#f44336';
        label = 'Sad';
        break;
      case 'total':
        icon = <CalendarTodayIcon fontSize="small" />;
        color = '#9c27b0';
        label = 'Total';
        break;
      default:
        icon = null;
        color = '#cccccc';
        label = 'Unknown';
    }

    return (
      <Card
        sx={{
          borderLeft: `4px solid ${color}`,
          boxShadow: 1,
          height: '100%',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1,
                color,
              }}
            >
              {icon}
            </Box>
            <Typography variant="body2" fontWeight="medium">
              {label}
            </Typography>
          </Box>

          <Typography variant="h5" component="div" fontWeight="bold">
            {count}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            entries this month
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const renderJournalCard = (journal: Journal) => (
    <Card
      key={journal.id}
      sx={{
        mb: 2,
        cursor: 'pointer',
        boxShadow: 1,
      }}
      onClick={() => onJournalClick(journal)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body1" fontWeight="medium">
              {formatDate(journal.date)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {journal.tags.map((tag: string) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: 'action.hover',
                  }}
                />
              ))}
            </Box>
          </Box>
          <MoodIcon mood={journal.mood as MoodType} size={20} />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {journal.content}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderSkeletonCard = (index: number) => (
    <Card key={`skeleton-${index}`} sx={{ mb: 2, boxShadow: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Skeleton width={120} height={24} />
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
              <Skeleton width={40} height={20} />
              <Skeleton width={60} height={20} />
            </Box>
          </Box>
          <Skeleton variant="circular" width={20} height={20} />
        </Box>
        <Skeleton sx={{ mt: 1 }} height={20} />
        <Skeleton height={20} />
        <Skeleton width="60%" height={20} />
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Journals
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" onClick={handlePrevMonth}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Typography variant="body1" sx={{ mx: 1 }}>
            {getMonthName(month)} {year}
          </Typography>

          <IconButton size="small" onClick={handleNextMonth}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 2,
          mb: 3,
        }}
      >
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={`stat-skeleton-${index}`} sx={{ boxShadow: 1 }}>
                  <CardContent>
                    <Skeleton height={24} width={80} />
                    <Skeleton height={40} width={40} />
                    <Skeleton height={16} width={120} />
                  </CardContent>
                </Card>
              ))
          : stats.categories.map(category => renderStatCard(category.mood, category.count))}
      </Box>

      <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
        Recent Entries
      </Typography>

      {isLoading ? (
        Array(3)
          .fill(0)
          .map((_, index) => renderSkeletonCard(index))
      ) : journals.length > 0 ? (
        journals.map(journal => renderJournalCard(journal))
      ) : (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No journal entries for this month.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the + button to create your first entry.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
