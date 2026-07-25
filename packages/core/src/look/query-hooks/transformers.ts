import { type FragmentType, getFragmentData } from '../../graphql';
import { AppError } from '../../universal/error-boundary/app-error';
import { AlbumFragment, PhotoFragment } from './fragments';

const transformPhotoFragment = (
  photoData: FragmentType<typeof PhotoFragment>,
) => {
  const photo = getFragmentData(PhotoFragment, photoData);
  if (!photo.thumbnailUrl) {
    // TODO
    // Use error code instead of hard code strings
    throw new AppError(
      'Required photo fields are missing',
      'Photo data is missing',
      false,
    );
  }

  // The DB CHECK constraint guarantees `type` is 'image' | 'video'; narrow it here
  // so consumers get a proper union instead of a bare string. For a video, `source`
  // is the HLS manifest URL and `duration` is its length in seconds.
  const isVideo = photo.type === 'video';

  return {
    id: photo.id,
    type: isVideo ? ('video' as const) : ('image' as const),
    source: photo.source,
    mediumUrl: photo.mediumUrl || '',
    thumbnailUrl: photo.thumbnailUrl,
    blurHash: photo.blurHash || '',
    width: photo.width ?? null,
    height: photo.height ?? null,
    duration: photo.duration ?? null,
    takenAt: photo.takenAt ?? null,
    slug: photo.slug ?? null,
  };
};

const transformAlbumFragment = (
  albumData: FragmentType<typeof AlbumFragment>,
) => {
  const album = getFragmentData(AlbumFragment, albumData);
  const photos = album.playlist_photos.map((playlistPhoto) =>
    transformPhotoFragment(playlistPhoto.photo),
  );

  return {
    id: album.id,
    title: album.title,
    thumbnailUrl: album.thumbnailUrl || '',
    slug: album.slug,
    createdAt: album.createdAt,
    description: album.description || '',
    photos,
  };
};

export { transformAlbumFragment, transformPhotoFragment };
