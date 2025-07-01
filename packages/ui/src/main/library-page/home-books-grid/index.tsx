import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Button,
  Skeleton,
  Card,
} from '@mui/material';
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
  books?: Book[];
  filter?: string;
  onFilterChange?: (filter: string) => void;
  onBookClick?: (book: Book) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

const BookCardSkeleton = () => {
  return (
    <Box>
      {/* Book Cover Card Skeleton */}
      <Card
        sx={{
          width: '100%',
          paddingTop: '133%',
          position: 'relative',
          bgcolor: 'grey.200',
          borderRadius: 1,
          mb: 1,
        }}
      />

      {/* Title and Author - Outside the card */}
      <Box sx={{ px: 0 }}>
        {/* Title Skeleton */}
        <Skeleton
          variant="text"
          width="90%"
          aria-hidden="true"
          data-testid="book-title-skeleton"
          sx={{
            fontSize: '1rem',
            mb: 0.5,
          }}
        />

        {/* Author Skeleton */}
        <Skeleton
          variant="text"
          width="70%"
          aria-hidden="true"
          data-testid="book-author-skeleton"
          sx={{
            fontSize: '0.875rem',
          }}
        />
      </Box>
    </Box>
  );
};

const BooksGridSkeleton = ({ count = 12 }: { count?: number }) => {
  return (
    <Box aria-busy="true" aria-label="Books library loading">
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
          {/* Filter Skeleton */}
          <Skeleton
            variant="rounded"
            width={150}
            height={40}
            aria-hidden="true"
            data-testid="filter-skeleton"
            sx={{ borderRadius: 1 }}
          />

          {/* View Toggle Skeleton */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} aria-hidden="true" data-testid="grid-view-skeleton" />
            <Skeleton variant="circular" width={32} height={32} aria-hidden="true" data-testid="list-view-skeleton" />
          </Box>
        </Box>
      </Box>

      {/* Books Grid Skeleton */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={`skeleton-${index}`}>
            <BookCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const BooksGridEmpty = () => {
  return (
    <Box>
      {/* Header - Same as loaded state */}
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
            <Select value="all" disabled>
              <MenuItem value="all">All Books</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              disabled
              sx={{
                bgcolor: 'grey.100',
                color: 'grey.400',
              }}
            >
              <GridIcon />
            </IconButton>
            <IconButton
              size="small"
              disabled
              sx={{
                color: 'grey.400',
              }}
            >
              <ListIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Empty State */}
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          📚
        </Box>

        <Typography variant="h4" fontSize="1.25rem" fontWeight="medium" sx={{ mb: 1 }}>
          No books in your library
        </Typography>
        <Typography color="text.secondary" fontSize="0.875rem">
          Add your first book to start building your personal library
        </Typography>
      </Box>
    </Box>
  );
};

const BooksGrid: React.FC<BooksGridProps> = props => {
  const { books, filter = 'all', onFilterChange, onBookClick, onLoadMore, hasMore = false, isLoading = false } = props;

  if (isLoading) {
    return <BooksGridSkeleton count={12} />;
  }

  if (books?.length === 0) {
    return <BooksGridEmpty />;
  }

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
        {books?.map(book => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={book.id}>
            <BookCard book={book} onClick={onBookClick} />
          </Grid>
        ))}
        {/* <Grid item xs={6} sm={4} md={3} lg={2}>
          <BookCardSkeleton />
        </Grid> */}
      </Grid>

      {/* Load More */}
      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onLoadMore}
            disabled={isLoading}
            sx={{
              bgcolor: 'grey.100',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'grey.200',
              },
            }}
          >
            {isLoading ? 'Loading...' : 'Load More Books'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export { BooksGrid };
