// packages/ui/src/journal/journal-detail/index.tsx

// MUI Icons imports
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import type { Journal, MoodType } from 'core/src/journal';
import { formatDate, formatDateTime } from 'core/universal/common';
import type React from 'react';
import { useState } from 'react';
import { MOOD_CONFIG, MoodIcon } from '../mood-icons';

interface JournalDetailProps {
  journal: Journal | null;
  isLoading: boolean;
  onBackClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

// The page owns its own width: the date header spans the full viewport as a
// sibling of the content, and only the content is constrained to `sm`. The
// route therefore renders this WITHOUT a wrapping Container.
const CONTENT_MAX_WIDTH = 'sm';

const JournalDetail: React.FC<JournalDetailProps> = ({
  journal,
  isLoading,
  onBackClick,
  onEditClick,
  onDeleteClick,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchor);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEditClick();
  };

  const handleDelete = () => {
    handleMenuClose();
    onDeleteClick();
  };

  if (isLoading) {
    return (
      <Container maxWidth={CONTENT_MAX_WIDTH} sx={{ pt: 2, pb: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onBackClick} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
          <Skeleton width={200} height={32} />
        </Box>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Skeleton variant="rounded" width={96} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>

          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} />
          <Skeleton height={24} width="60%" />

          <Box sx={{ mt: 4 }}>
            <Skeleton width={180} height={16} />
          </Box>
        </Paper>
      </Container>
    );
  }

  if (!journal) {
    return (
      <Container maxWidth={CONTENT_MAX_WIDTH} sx={{ pt: 2, pb: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={onBackClick} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
          <Typography variant="h6">Journal Entry</Typography>
        </Box>
        <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            Journal entry not found.
          </Typography>
        </Paper>
      </Container>
    );
  }

  const mood = MOOD_CONFIG[journal.mood as MoodType];
  const isEdited = journal.updatedAt !== journal.createdAt;

  return (
    <>
      {/* Full-width sticky date header. It's a sibling of the content (a direct
          child of the full-width page layout), so it spans the viewport
          naturally — no `100vw` breakout, which used to include the scrollbar
          width and give the whole page a horizontal scrollbar (SWO-371). It
          pins the date under the main app bar so long entries never lose the
          "which day am I reading" context, and renders as an AppBar to reuse
          the theme's frosted header surface as a seamless second row. */}
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{
          top: { xs: 56, sm: 64 },
          border: 'none',
          borderRadius: 0,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar variant="dense" disableGutters sx={{ px: 2 }}>
          <IconButton onClick={onBackClick} sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {formatDate(journal.date)}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={CONTENT_MAX_WIDTH} sx={{ pt: 2, pb: 8 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2.5,
            }}
          >
            {mood ? (
              <Chip
                icon={<MoodIcon mood={journal.mood as MoodType} size={18} />}
                label={mood.label}
                sx={{
                  fontWeight: 600,
                  color: `${mood.color}.main`,
                  // The glassmorphism theme paints chips with a purple gradient
                  // (a background-image), so clear it before applying our tint.
                  backgroundImage: 'none',
                  bgcolor: (theme) =>
                    theme.alpha(theme.palette[mood.color].main, 0.12),
                  border: 'none',
                  '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
                }}
              />
            ) : (
              <Box />
            )}

            <IconButton
              aria-label="entry actions"
              onClick={handleMenuOpen}
              size="small"
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={isMenuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <EditOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <DeleteOutlineIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Box>

          <Typography
            variant="body1"
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '1.05rem',
              lineHeight: 1.7,
            }}
          >
            {journal.content}
          </Typography>

          {journal.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 2.5 }}>
              {journal.tags.map((tag: string) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    backgroundImage: 'none',
                    bgcolor: 'action.hover',
                    border: 'none',
                  }}
                />
              ))}
            </Box>
          )}

          <Divider sx={{ mt: 3, mb: 1.5 }} />

          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
            }}
          >
            {isEdited
              ? `Edited ${formatDateTime(journal.updatedAt)}`
              : formatDateTime(journal.createdAt)}
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export { JournalDetail };
