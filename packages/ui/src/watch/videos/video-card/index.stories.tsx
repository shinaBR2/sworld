import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import { VideoCard } from '.';

const meta: Meta<typeof VideoCard> = {
  title: 'Watch/VideoCard',
  component: VideoCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <Box width={'400px'}>
        <Story />
      </Box>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VideoCard>;

// Basic story with default props
export const Default: Story = {
  args: {
    video: {
      id: '2e061abc-3dfe-47d7-b266-edc890f69e9c',
      title: 'Title',
      source: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      // thumbnailUrl: 'https://example.com/video-thumbnail.png',
      // slug: 'video-slug',
      createdAt: '2024-12-15T04:32:47.424952+00:00',
      user: {
        username: 'shinabr2',
      },
    },
  },
};

export const WithThumbnail: Story = {
  args: {
    video: {
      id: '2e061abc-3dfe-47d7-b266-edc890f69e9c',
      title: 'Title',
      source: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://picsum.photos/536/354',
      // slug: 'video-slug',
      createdAt: '2024-12-15T04:32:47.424952+00:00',
      user: {
        username: 'shinabr2',
      },
    },
  },
};
