import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import type { LinkComponentType } from '../../videos/types';
import { ContinueWatchingSection } from '.';
import type { ContinueWatchingItem } from './types';

const MockLink: LinkComponentType = ({ to, children, style }) => (
  <a href={to} style={style}>
    {children}
  </a>
);

const makeItem = (
  index: number,
  overrides: Partial<ContinueWatchingItem> = {},
): ContinueWatchingItem => ({
  id: `video-${index}`,
  type: 'video',
  title: `Continue watching video ${index}`,
  thumbnailUrl: `https://picsum.photos/seed/${index}/536/354`,
  source:
    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  slug: `video-${index}`,
  duration: 600,
  createdAt: '2024-12-15T04:32:47.424952+00:00',
  user: { username: 'shinabr2' },
  progressSeconds: 120 + index * 40,
  lastWatchedAt: '2026-06-29T10:00:00.000000+00:00',
  ...overrides,
});

const meta: Meta<typeof ContinueWatchingSection> = {
  title: 'Watch/ContinueWatchingSection',
  component: ContinueWatchingSection,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    LinkComponent: MockLink,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ContinueWatchingSection>;

// More items than a single row holds — the component slices to the breakpoint.
export const Populated: Story = {
  args: {
    videos: Array.from({ length: 8 }, (_, i) => makeItem(i + 1)),
  },
};

// Fewer items than a full row.
export const FewItems: Story = {
  args: {
    videos: [makeItem(1), makeItem(2)],
  },
};

// A video watched inside a playlist (links to the in-playlist route).
export const WithPlaylistItem: Story = {
  args: {
    videos: [
      makeItem(1, {
        title: 'Episode 3 — inside a playlist',
        playlist: { id: 'playlist-1', slug: 'my-playlist' },
      }),
      makeItem(2),
      makeItem(3),
    ],
  },
};
