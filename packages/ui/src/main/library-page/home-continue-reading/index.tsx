import { Box, Card, CardContent, Typography, LinearProgress, Skeleton } from '@mui/material';
import { MenuBook as BookIcon } from '@mui/icons-material';

// TODO infer from GraphQL
interface Book {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: string;
}

interface ContinueReadingProps {
  isLoading: boolean;
  book?: Book;
  onBookClick?: (book: Book) => void;
}

const ContinueReadingSkeleton = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Continue Reading
      </Typography>
      <Card
        sx={{
          transition: 'box-shadow 0.2s',
        }}
        aria-busy="true"
        aria-label="Continue reading section loading"
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 3 },
            }}
          >
            {/* Mobile: Book info and thumbnail row */}
            <Box
              sx={{
                display: { xs: 'flex', sm: 'contents' },
                alignItems: 'center',
                gap: 2,
                width: '100%',
              }}
            >
              {/* Book Thumbnail Skeleton */}
              <Box
                sx={{
                  width: { xs: 56, sm: 64 },
                  height: { xs: 70, sm: 80 },
                  background: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'grey.400',
                  flexShrink: 0,
                }}
              >
                <BookIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>

              {/* Book Info Skeleton */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ height: { xs: 28, sm: 32 }, width: '80%' }}>
                  <Skeleton
                    variant="text"
                    width="100%"
                    height="100%"
                    aria-hidden="true"
                    data-testid="book-title-skeleton"
                    sx={{ mb: 0.5 }}
                  />
                </Box>
                <Box sx={{ height: { xs: 28, sm: 32 }, width: '60%' }}>
                  <Skeleton
                    variant="text"
                    width="100%"
                    height="100%"
                    aria-hidden="true"
                    data-testid="book-author-skeleton"
                    sx={{ mb: 0.5 }}
                  />
                </Box>

                {/* Mobile: Last read skeleton */}
                <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 1 }}>
                  <Skeleton
                    variant="text"
                    width="50%"
                    height={18}
                    aria-hidden="true"
                    data-testid="last-read-mobile-skeleton"
                  />
                </Box>
              </Box>
            </Box>

            {/* Progress Skeleton */}
            <Box
              sx={{
                width: '100%',
                order: { xs: 2, sm: 0 },
                flex: { sm: 1 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ height: { xs: 6, sm: 8 }, width: '100%' }}>
                  <Skeleton
                    variant="rounded"
                    height="100%"
                    aria-hidden="true"
                    data-testid="book-progress-skeleton"
                    sx={{
                      flex: 1,
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Box sx={{ height: { xs: 18, sm: 20 }, width: 80 }}>
                  <Skeleton
                    variant="text"
                    width="100%"
                    height="100%"
                    aria-hidden="true"
                    data-testid="book-pages-skeleton"
                    sx={{ whiteSpace: 'nowrap' }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Last Read Skeleton - Desktop only */}
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right', flexShrink: 0 }}>
              <Skeleton
                variant="text"
                width={60}
                height={20}
                aria-hidden="true"
                data-testid="last-read-label-skeleton"
                sx={{ mb: 0.5, ml: 'auto' }}
              />
              <Skeleton
                variant="text"
                width={80}
                height={20}
                aria-hidden="true"
                data-testid="last-read-time-skeleton"
                sx={{ ml: 'auto' }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const ContinueReadingEmpty = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Continue Reading
      </Typography>
      <Card
        sx={{
          transition: 'box-shadow 0.2s',
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
            <Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <BookIcon sx={{ fontSize: 24, color: 'grey.500' }} />
              </Box>

              <Typography variant="h4" fontSize="1.125rem" fontWeight="medium" sx={{ mb: 0.5 }}>
                No books in progress
              </Typography>
              <Typography color="text.secondary" fontSize="0.875rem">
                Start reading a book to see your progress here
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const ContinueReading: React.FC<ContinueReadingProps> = ({ isLoading, book, onBookClick }) => {
  if (isLoading) {
    return <ContinueReadingSkeleton />;
  }

  if (!book) {
    return <ContinueReadingEmpty />;
  }

  const progress = (book.currentPage / book.totalPages) * 100;

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Continue Reading
      </Typography>
      <Card
        sx={{
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        }}
        onClick={() => onBookClick?.(book)}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 2, sm: 3 },
            }}
          >
            {/* Mobile: Book info and thumbnail row */}
            <Box
              sx={{
                display: { xs: 'flex', sm: 'contents' },
                alignItems: 'center',
                gap: 2,
                width: '100%',
              }}
            >
              {/* Book Thumbnail */}
              <Box
                sx={{
                  width: { xs: 56, sm: 64 },
                  height: { xs: 70, sm: 80 },
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <BookIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>

              {/* Book Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h4"
                  fontSize={{ xs: '1rem', sm: '1.125rem' }}
                  fontWeight="medium"
                  sx={{
                    mb: 0.5,
                    lineHeight: 1.3,
                  }}
                >
                  {book.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  fontSize={{ xs: '0.8125rem', sm: '0.875rem' }}
                  sx={{ mb: { xs: 1, sm: 1.5 } }}
                >
                  by {book.author}
                </Typography>

                {/* Mobile: Last read info - shown here for better mobile layout */}
                <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8125rem">
                    Last read {book.lastReadAt}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Progress bar - full width on mobile */}
            <Box
              sx={{
                width: '100%',
                order: { xs: 2, sm: 0 },
                flex: { sm: 1 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    flex: 1,
                    height: { xs: 6, sm: 8 },
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontSize={{ xs: '0.8125rem', sm: '0.875rem' }}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Page {book.currentPage} of {book.totalPages}
                </Typography>
              </Box>
            </Box>

            {/* Last Read - Desktop only */}
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="body2" color="text.secondary" fontSize="0.875rem" sx={{ mb: 0.5 }}>
                Last read
              </Typography>
              <Typography variant="body2" fontWeight="medium" fontSize="0.875rem">
                {book.lastReadAt}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export { ContinueReading };
