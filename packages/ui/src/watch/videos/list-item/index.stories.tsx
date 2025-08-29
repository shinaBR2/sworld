import type { Meta, StoryObj } from '@storybook/react';
import { VideoListItemSkeleton } from './skeleton';

const meta: Meta<typeof VideoListItemSkeleton> = {
  title: 'Watch/VideoListItemSkeleton',
  component: VideoListItemSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VideoListItemSkeleton>;

// Basic story with default props
export const Default: Story = {};
