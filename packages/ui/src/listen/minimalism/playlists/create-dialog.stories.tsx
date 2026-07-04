import type { Meta, StoryObj } from '@storybook/tanstack-react';
import { CreatePlaylistDialog } from './create-dialog';

const meta: Meta<typeof CreatePlaylistDialog> = {
  title: 'Listen/Playlists/CreatePlaylistDialog',
  component: CreatePlaylistDialog,
  parameters: {
    layout: 'centered',
  },
  args: {
    onClose: () => {},
    onCreate: () => {},
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CreatePlaylistDialog>;

export const Open: Story = {
  args: {
    open: true,
  },
};

export const Creating: Story = {
  args: {
    open: true,
    isCreating: true,
  },
};

export const Closed: Story = {
  args: {
    open: false,
  },
};
