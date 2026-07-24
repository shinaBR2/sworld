import type {
  transformAlbumFragment,
  transformPhotoFragment,
} from './transformers';

type TransformedPhoto = ReturnType<typeof transformPhotoFragment>;
type TransformedAlbum = ReturnType<typeof transformAlbumFragment>;

interface BaseQueryProps {
  getAccessToken: () => Promise<string>;
}

interface DetailQueryProps extends BaseQueryProps {
  id: string;
}

export type {
  BaseQueryProps,
  DetailQueryProps,
  TransformedAlbum,
  TransformedPhoto,
};
