import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import { LookCollectionSelect } from '.';

const meta: Meta<typeof LookCollectionSelect> = {
  title: 'Look/CollectionSelect',
  component: LookCollectionSelect,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Stack sx={{ width: '15rem' }}>
        <Story />
      </Stack>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LookCollectionSelect>;

const albums = [
  { id: '1', title: 'Summer 2023' },
  { id: '2', title: 'Winter Trip' },
  { id: '3', title: 'Family' },
];

export const AllSelected: Story = {
  args: {
    value: 'all',
    albums,
    onSelect: () => {},
  },
};

export const AlbumSelected: Story = {
  args: {
    value: '2',
    albums,
    onSelect: () => {},
  },
};

export const EmptyAlbums: Story = {
  args: {
    value: 'all',
    albums: [],
    onSelect: () => {},
  },
};
