import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    progress?: number;
    isCompleted?: boolean;
    isNew?: boolean;
    coverGradient?: string;
  };
  onClick?: (book: BookCardProps['book']) => void;
}

const defaultGradients = [
  'linear-gradient(135deg, #ef4444, #ec4899)',
  'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ea580c)',
  'linear-gradient(135deg, #8b5cf6, #6366f1)',
  'linear-gradient(135deg, #6b7280, #374151)',
];

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  const gradient = book.coverGradient || defaultGradients[Math.floor(Math.random() * defaultGradients.length)];

  return (
    <Box
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
      onClick={() => onClick?.(book)}
    >
      {/* Book Cover */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '3/4',
          borderRadius: 1,
          mb: 1.5,
          overflow: 'hidden',
          background: gradient,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover .cover-overlay': {
            opacity: 1,
          },
        }}
      >
        {/* Hover Overlay */}
        <Box
          className="cover-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s',
          }}
        >
          <PlayIcon sx={{ color: 'white', fontSize: 32 }} />
        </Box>

        {/* Status Badge */}
        {(book.isCompleted || book.isNew) && (
          <Box sx={{ position: 'absolute', top: 1, right: 1 }}>
            <Chip
              label={book.isCompleted ? '100%' : 'New'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'white',
                bgcolor: book.isCompleted ? '#16a34a' : '#6b7280',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          </Box>
        )}

        {/* Progress Bar */}
        {book.progress && book.progress > 0 && !book.isCompleted && (
          <Box
            data-testid="book-progress-bar"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              right: 8,
              height: 4,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 0.5,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                height: '100%',
                bgcolor: 'primary.main',
                borderRadius: 0.5,
                width: `${book.progress}%`,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Book Info */}
      <Box>
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{
            mb: 0.5,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {book.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {book.author}
        </Typography>
      </Box>
    </Box>
  );
};

export { BookCard };
