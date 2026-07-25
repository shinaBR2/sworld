import type { TransformedPhoto } from 'core/look/query-hooks/types';

// The id of the photo `delta` positions from the active one, or null at the
// ends (no wrap) or when the active id isn't in the list. Drives ←/→ navigation.
const stepPhotoId = (
  photos: TransformedPhoto[],
  activeId: string,
  delta: number,
): string | null => {
  const index = photos.findIndex((photo) => photo.id === activeId);
  if (index === -1) {
    return null;
  }

  const nextIndex = index + delta;
  if (nextIndex < 0 || nextIndex >= photos.length) {
    return null;
  }

  return photos[nextIndex].id;
};

export { stepPhotoId };
