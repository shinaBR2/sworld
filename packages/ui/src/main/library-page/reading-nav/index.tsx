import { Paper, Box, Button, LinearProgress, Typography, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface ReadingNavProps {
  isMenuOpen: boolean;
  currentPage: number;
  totalPages: number;
  readingProgress: number;
  prevPage: () => void;
  nextPage: () => void;
}

const ReadingNav = (props: ReadingNavProps) => {
  const { isMenuOpen, currentPage, totalPages, readingProgress, prevPage, nextPage } = props;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        p: 2,
        opacity: isMenuOpen ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: isMenuOpen ? 'auto' : 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <IconButton
          color="primary"
          onClick={prevPage}
          disabled={currentPage <= 1}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ flex: 1, mx: 3 }}>
          <LinearProgress
            variant="determinate"
            value={readingProgress}
            sx={{
              height: 4,
              borderRadius: 1,
              mb: 1,
              bgcolor: 'divider',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            Page {currentPage} of {totalPages} • {readingProgress}% complete
          </Typography>
        </Box>

        <IconButton
          color="primary"
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            ml: 1,
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export { ReadingNav };
