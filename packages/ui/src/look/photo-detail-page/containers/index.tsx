import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
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

const EDGE_BUTTON_SX = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1,
  color: 'text.primary',
  bgcolor: 'action.hover',
  '&:hover': { bgcolor: 'action.selected' },
} as const;

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
        paper: {
          sx: { bgcolor: 'background.default', backgroundImage: 'none' },
        },
      }}
    >
      <Stack sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 1,
            right: 1,
            zIndex: 1,
            color: 'text.primary',
          }}
        >
          <CloseIcon />
        </IconButton>
        <IconButton
          aria-label="Previous photo"
          onClick={() => prevId && onActiveIdChange(prevId)}
          disabled={!prevId}
          sx={{ ...EDGE_BUTTON_SX, left: 1 }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          aria-label="Next photo"
          onClick={() => nextId && onActiveIdChange(nextId)}
          disabled={!nextId}
          sx={{ ...EDGE_BUTTON_SX, right: 1 }}
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
