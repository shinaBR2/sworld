import React from 'react';
import { Box, Grid, Typography, Select, MenuItem, FormControl, IconButton, Button } from '@mui/material';
import { GridView as GridIcon, List as ListIcon } from '@mui/icons-material';
import { BookCard } from '../book-card';

interface Book {
  id: string;
  title: string;
  author: string;
  progress?: number;
  isCompleted?: boolean;
  isNew?: boolean;
  coverGradient?: string;
}

interface BooksGridProps {
  books: Book[];
  filter?: string;
  onFilterChange?: (filter: string) => void;
  onBookClick?: (book: Book) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const BooksGrid: React.FC<BooksGridProps> = props => {
  const { books, filter = 'all', onFilterChange, onBookClick, onLoadMore, hasMore = false, loading = false } = props;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Typography variant="h3">Your Library</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={filter} onChange={e => onFilterChange?.(e.target.value)}>
              <MenuItem value="all">All Books</MenuItem>
              <MenuItem value="recent">Recently Added</MenuItem>
              <MenuItem value="reading">Currently Reading</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              sx={{
                bgcolor: 'primary.50',
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.100' },
              }}
            >
              <GridIcon />
            </IconButton>
            <IconButton
              size="small"
              sx={{
                color: 'text.disabled',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Books Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {books.map(book => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={book.id}>
            <BookCard book={book} onClick={onBookClick} />
          </Grid>
        ))}
      </Grid>

      {/* Load More */}
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onLoadMore}
            disabled={loading}
            sx={{
              bgcolor: 'grey.100',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'grey.200',
              },
            }}
          >
            {loading ? 'Loading...' : 'Load More Books'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export { BooksGrid };
