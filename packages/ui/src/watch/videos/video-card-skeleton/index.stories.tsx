import type { Meta, StoryObj } from '@storybook/react';
import { VideoSkeleton } from './index';

const meta: Meta<typeof VideoSkeleton> = {
  title: 'Watch/VideoSkeleton',
  component: VideoSkeleton,
  decorators: [
    Story => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VideoSkeleton>;

// Basic story with default props
export const Default: Story = {};
