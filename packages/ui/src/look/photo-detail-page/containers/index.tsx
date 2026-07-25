import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { alpha, type Theme } from '@mui/material/styles';
import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { useEffect, useMemo } from 'react';
import { LightboxImage } from '../lightbox-image';
import { stepPhotoId } from '../utils';

interface PhotoLightboxProps {
  photos: TransformedPhoto[];
  activeId: string;
  open: boolean;
  onClose: () => void;
  onActiveIdChange: (id: string) => void;
}

// The viewer is always solid black (see the paper sx below), so the controls
// can't use theme text/action tokens — those follow the app's light/dark mode
// and vanish against black. Pin them to white with a translucent-white hover
// scrim, derived from the palette (not a raw rgba), so they read on black and
// over any photo.
const CONTROL_COLOR = 'common.white';
const EDGE_BUTTON_SX = (theme: Theme) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1,
  color: CONTROL_COLOR,
  bgcolor: alpha(theme.palette.common.white, 0.12),
  '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.24) },
  // At the first/last photo the button is disabled; keep it dimmed-but-visible
  // on black instead of MUI's default action.disabled, a near-invisible dark
  // token here.
  '&.Mui-disabled': {
    color: alpha(theme.palette.common.white, 0.3),
    bgcolor: alpha(theme.palette.common.white, 0.06),
  },
});

// Full-screen photo viewer. MUI Dialog gives the focus trap, backdrop, and
// Escape-to-close; a document-level key listener adds ←/→ navigation. Navigation
// is controlled — the active photo comes from an in-memory list by id, so moving
// between photos never refetches.
const PhotoLightbox = (props: PhotoLightboxProps) => {
  const { photos, activeId, open, onClose, onActiveIdChange } = props;

  const activePhoto = useMemo(
    () => photos.find((photo) => photo.id === activeId) ?? null,
    [photos, activeId],
  );
  const prevId = useMemo(
    () => stepPhotoId(photos, activeId, -1),
    [photos, activeId],
  );
  const nextId = useMemo(
    () => stepPhotoId(photos, activeId, 1),
    [photos, activeId],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && prevId) {
        event.preventDefault();
        onActiveIdChange(prevId);
        return;
      }
      if (event.key === 'ArrowRight' && nextId) {
        event.preventDefault();
        onActiveIdChange(nextId);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, prevId, nextId, onActiveIdChange]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      aria-label="Photo viewer"
      slotProps={{
        // Solid black viewer, like Google Photos: the photo is letterboxed
        // (object-fit: contain) and everything around it stays pure black in
        // both themes, not the app's tinted surface color. Clear the
        // glassmorphism paper's border + backdrop blur so nothing frames the
        // black.
        paper: {
          sx: {
            bgcolor: 'common.black',
            backgroundImage: 'none',
            border: 'none',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
          },
        },
      }}
    >
      <Stack sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={(theme) => ({
            position: 'absolute',
            top: 1,
            right: 1,
            zIndex: 1,
            color: CONTROL_COLOR,
            // Bare white X at rest (like Google Photos), but a translucent-white
            // hover so it gets the same feedback as the nav arrows on black —
            // the theme default hover is a near-invisible dark tint here.
            '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.24) },
          })}
        >
          <CloseIcon />
        </IconButton>
        <IconButton
          aria-label="Previous photo"
          onClick={() => prevId && onActiveIdChange(prevId)}
          disabled={!prevId}
          sx={[EDGE_BUTTON_SX, { left: 1 }]}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          aria-label="Next photo"
          onClick={() => nextId && onActiveIdChange(nextId)}
          disabled={!nextId}
          sx={[EDGE_BUTTON_SX, { right: 1 }]}
        >
          <ChevronRightIcon />
        </IconButton>
        {activePhoto ? (
          <LightboxImage key={activePhoto.id} photo={activePhoto} />
        ) : null}
      </Stack>
    </Dialog>
  );
};

export { PhotoLightbox };
