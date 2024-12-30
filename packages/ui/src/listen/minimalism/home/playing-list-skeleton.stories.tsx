import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import { PlayingListSkeleton } from './playing-list-skeleton';

const meta: Meta<typeof PlayingListSkeleton> = {
  title: 'Listen/Home/PlayingListSkeleton',
  component: PlayingListSkeleton,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <Box width={'600px'}>
        <Story />
      </Box>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PlayingListSkeleton>;

// Basic story with default props
export const Default: Story = {};
