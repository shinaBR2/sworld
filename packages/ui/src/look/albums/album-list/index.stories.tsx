import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import type {
  TransformedAlbum,
  TransformedPhoto,
} from 'core/look/query-hooks/types';
import type { LinkComponentType } from '../../photos/types';
import { AlbumListContainer } from '.';

const MockLink: LinkComponentType = ({ to, children, style }) => (
  <a href={to} style={style}>
    {children}
  </a>
);

const makePhotos = (albumIndex: number, count: number): TransformedPhoto[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `photo-${albumIndex}-${index}`,
    source: `https://picsum.photos/seed/al-${albumIndex}-${index}/1200/1200`,
    mediumUrl: `https://picsum.photos/seed/al-${albumIndex}-${index}/1200/1200`,
    thumbnailUrl: `https://picsum.photos/seed/al-${albumIndex}-${index}/400/400`,
    blurHash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    width: 1200,
    height: 1200,
    takenAt: `2023-0${(albumIndex % 9) + 1}-01T10:00:00Z`,
    slug: `photo-${albumIndex}-${index}`,
  }));

const TITLES = [
  'Summer 2023',
  '5cm Per Second',
  'City Nights',
  'Mountains',
  'Studio',
  'Roadtrip',
];

const makeAlbums = (count: number): TransformedAlbum[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `album-${index}`,
    title: TITLES[index % TITLES.length],
    thumbnailUrl: `https://picsum.photos/seed/album-cover-${index}/600/600`,
    slug: `album-${index}`,
    createdAt: `2023-0${(index % 9) + 1}-01T00:00:00Z`,
    description: '',
    photos: makePhotos(index, ((index * 7) % 40) + 1),
  }));

const meta: Meta<typeof AlbumListContainer> = {
  title: 'Look/AlbumListContainer',
  component: AlbumListContainer,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Stack sx={{ height: '100vh' }}>
        <Story />
      </Stack>
    ),
  ],
  args: { LinkComponent: MockLink },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AlbumListContainer>;

export const Populated: Story = {
  args: {
    queryRs: { albums: makeAlbums(6), isLoading: false, error: null },
  },
};

export const Loading: Story = {
  args: {
    queryRs: { albums: [], isLoading: true, error: null },
  },
};

export const Empty: Story = {
  args: {
    queryRs: { albums: [], isLoading: false, error: null },
  },
};
