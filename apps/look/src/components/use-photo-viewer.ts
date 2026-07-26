import { useCanGoBack, useRouter } from '@tanstack/react-router';
import type { TransformedPhoto } from 'core/look/query-hooks/types';
import { useCallback } from 'react';

interface UsePhotoViewerArgs {
  photos: TransformedPhoto[];
  activePhotoId: string;
  // Where to go when closing the viewer with no in-app history to return to (a
  // photo URL opened directly or reloaded) — the grid route this viewer sits on.
  onCloseFallback: () => void;
}

// Shared open-state + close logic for the full-screen photo viewer, used by both
// the timeline and album photo routes. The viewer is open only when the URL's
// photo id is one of the loaded photos, so an unknown id (bad link, deleted
// photo, load error → empty list) leaves the grid showing with the viewer closed
// rather than a blank screen. Closing steps back in history so it returns to
// wherever the photo was opened from, falling back to the grid route when there
// is no in-app history.
const usePhotoViewer = (args: UsePhotoViewerArgs) => {
  const { photos, activePhotoId, onCloseFallback } = args;
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const isPhotoOpen = photos.some((photo) => photo.id === activePhotoId);

  const onClose = useCallback(
    () => (canGoBack ? router.history.back() : onCloseFallback()),
    [canGoBack, router, onCloseFallback],
  );

  return { isPhotoOpen, onClose };
};

export { usePhotoViewer };
