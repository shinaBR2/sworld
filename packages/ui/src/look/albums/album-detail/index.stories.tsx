import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import type {
  TransformedAlbum,
  TransformedPhoto,
} from 'core/look/query-hooks/types';
import type { LinkComponentType } from '../../photos/types';
import { AlbumDetailContainer } from '.';

const MockLink: LinkComponentType = ({ to, children, style }) => (
  <a href={to} style={style}>
    {children}
  </a>
);

const makePhotos = (count: number): TransformedPhoto[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `photo-${index}`,
    type: 'image',
    source: `https://picsum.photos/seed/detail-${index}/1200/1200`,
    mediumUrl: `https://picsum.photos/seed/detail-${index}/1200/1200`,
    thumbnailUrl: `https://picsum.photos/seed/detail-${index}/400/400`,
    blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    width: 1200,
    height: 1200,
    duration: null,
    takenAt: `2023-06-${String((index % 27) + 1).padStart(2, '0')}T10:00:00Z`,
    slug: `photo-${index}`,
  }));

const makeAlbum = (
  overrides: Partial<TransformedAlbum> = {},
): TransformedAlbum => ({
  id: 'album-1',
  title: '5cm Per Second',
  thumbnailUrl: 'https://picsum.photos/seed/detail-cover/600/600',
  slug: '5cm-per-second',
  createdAt: '2023-06-01T00:00:00Z',
  description: 'A quiet set of stills.',
  photos: makePhotos(24),
  ...overrides,
});

const meta: Meta<typeof AlbumDetailContainer> = {
  title: 'Look/AlbumDetailContainer',
  component: AlbumDetailContainer,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Stack sx={{ height: '100vh' }}>
        <Story />
      </Stack>
    ),
  ],
  args: { LinkComponent: MockLink, albumId: 'album-1' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AlbumDetailContainer>;

export const Populated: Story = {
  args: {
    queryRs: { album: makeAlbum(), isLoading: false, error: null },
  },
};

export const Loading: Story = {
  args: {
    queryRs: { album: null, isLoading: true, error: null },
  },
};

export const NotFound: Story = {
  args: {
    queryRs: { album: null, isLoading: false, error: null },
  },
};

export const NoPhotos: Story = {
  args: {
    queryRs: {
      album: makeAlbum({ description: '', photos: [] }),
      isLoading: false,
      error: null,
    },
  },
};
