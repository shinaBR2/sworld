import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import type {
  TransformedAlbum,
  TransformedPhoto,
} from 'core/look/query-hooks/types';
import type { LinkComponentType } from '../../photos/types';
import { AlbumCard } from '.';

const MockLink: LinkComponentType = ({ to, children, style }) => (
  <a href={to} style={style}>
    {children}
  </a>
);

const makePhotos = (count: number): TransformedPhoto[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `photo-${index}`,
    source: `https://picsum.photos/seed/album-photo-${index}/1200/1200`,
    mediumUrl: `https://picsum.photos/seed/album-photo-${index}/1200/1200`,
    thumbnailUrl: `https://picsum.photos/seed/album-photo-${index}/400/400`,
    blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    width: 1200,
    height: 1200,
    takenAt: `2023-06-${String((index % 27) + 1).padStart(2, '0')}T10:00:00Z`,
    slug: `photo-${index}`,
  }));

const makeAlbum = (
  overrides: Partial<TransformedAlbum> = {},
): TransformedAlbum => ({
  id: 'album-1',
  title: 'Summer 2023',
  thumbnailUrl: 'https://picsum.photos/seed/album-cover-1/600/600',
  slug: 'summer-2023',
  createdAt: '2023-06-01T00:00:00Z',
  description: '',
  photos: makePhotos(42),
  ...overrides,
});

const meta: Meta<typeof AlbumCard> = {
  title: 'Look/AlbumCard',
  component: AlbumCard,
  args: {
    LinkComponent: MockLink,
    linkProps: { to: '/album/$albumId', params: { albumId: 'summer-2023' } },
  },
  decorators: [
    (Story) => (
      <Stack sx={{ width: '16rem', p: 2 }}>
        <Story />
      </Stack>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AlbumCard>;

export const WithCover: Story = {
  args: { album: makeAlbum() },
};

// No own thumbnail — the cover falls back to the first photo's thumbnail.
export const CoverFromFirstPhoto: Story = {
  args: { album: makeAlbum({ thumbnailUrl: '' }) },
};

// No thumbnail and no photos — the cover is a plain tinted square.
export const NoCover: Story = {
  args: {
    album: makeAlbum({ title: 'Empty Album', thumbnailUrl: '', photos: [] }),
  },
};

export const SinglePhoto: Story = {
  args: { album: makeAlbum({ title: 'One Shot', photos: makePhotos(1) }) },
};
