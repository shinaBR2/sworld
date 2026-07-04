import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import { CollectionSelect } from '.';

const meta: Meta<typeof CollectionSelect> = {
  title: 'Listen/CollectionSelect',
  component: CollectionSelect,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Box width={'240px'}>
        <Story />
      </Box>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CollectionSelect>;

const playlists = [
  { id: '1', title: 'Focus' },
  { id: '2', title: 'Chill' },
  { id: '3', title: 'Workout' },
];

export const AllSelected: Story = {
  args: {
    value: 'all',
    playlists,
    onSelect: () => {},
    onCreateNew: () => {},
  },
};

export const PlaylistSelected: Story = {
  args: {
    value: '2',
    playlists,
    onSelect: () => {},
    onCreateNew: () => {},
  },
};

export const EmptyPlaylists: Story = {
  args: {
    value: 'all',
    playlists: [],
    onSelect: () => {},
    onCreateNew: () => {},
  },
};
