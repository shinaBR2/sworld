import { ArrowBack as ArrowBackIcon, Settings as SettingsIcon } from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Drawer,
  FormControlLabel,
  Slider,
  Switch,
  TextField,
  IconButton,
} from '@mui/material';

interface ReadingHeaderProps {
  isMenuOpen: boolean;
  isSettingsOpen: boolean;
  toggleSettingsOpen: () => void;
  bookTitle: string;
  author: string;
  fontSize: number;
  setFontSize: (fontSize: number) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

const ReadingHeader: React.FC<ReadingHeaderProps> = props => {
  const {
    isMenuOpen,
    isSettingsOpen,
    toggleSettingsOpen,
    bookTitle,
    author,
    fontSize,
    setFontSize,
    isDarkMode,
    setIsDarkMode,
    currentPage,
    totalPages,
    goToPage,
  } = props;

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          opacity: isMenuOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: isMenuOpen ? 'auto' : 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => window.history.back()}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              flex: 1,
              mx: 2,
              color: 'text.primary',
            }}
          >
            {bookTitle} • {author}
          </Typography>

          <IconButton
            size="small"
            color="primary"
            onClick={toggleSettingsOpen}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={isSettingsOpen}
        onClose={toggleSettingsOpen}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            top: '60px',
            height: 'auto',
            position: 'absolute',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            m: 2,
            boxShadow: 3,
          },
        }}
        variant="persistent"
        hideBackdrop
      >
        <Box sx={{ p: 3 }}>
          {/* Font Size Setting */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Font Size
            </Typography>
            <Slider
              value={fontSize}
              onChange={(_, value) => setFontSize(value as number)}
              min={14}
              max={24}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {fontSize}px
            </Typography>
          </Box>

          {/* Dark Mode Toggle */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={<Switch checked={isDarkMode} onChange={e => setIsDarkMode(e.target.checked)} />}
              label="Dark Mode"
              sx={{ '& .MuiFormControlLabel-label': { fontWeight: 500 } }}
            />
          </Box>

          {/* Go to Page */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Go to Page
            </Typography>
            <TextField
              type="number"
              value={currentPage}
              onChange={e => goToPage(parseInt(e.target.value))}
              inputProps={{ min: 1, max: totalPages }}
              size="small"
              fullWidth
              variant="outlined"
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export { ReadingHeader };
