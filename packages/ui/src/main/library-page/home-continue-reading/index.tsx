import { Box, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { MenuBook as BookIcon } from '@mui/icons-material';

// TODO infer from GraphQl
interface Book {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: string;
}

interface ContinueReadingProps {
  book?: Book;
  onBookClick?: (book: Book) => void;
}

const ContinueReading: React.FC<ContinueReadingProps> = ({ book, onBookClick }) => {
  if (!book) return null;

  const progress = (book.currentPage / book.totalPages) * 100;

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h3">Continue Reading</Typography>
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
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Book Thumbnail */}
            <Box
              sx={{
                width: 64,
                height: 80,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
              }}
            >
              <BookIcon sx={{ fontSize: 24 }} />
            </Box>

            {/* Book Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {book.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                by {book.author}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  Page {book.currentPage} of {book.totalPages}
                </Typography>
              </Box>
            </Box>

            {/* Last Read */}
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Last read
              </Typography>
              <Typography variant="body2" fontWeight="medium">
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
