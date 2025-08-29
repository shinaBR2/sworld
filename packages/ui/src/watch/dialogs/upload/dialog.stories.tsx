import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { DialogComponent } from './dialog';
import { CREATE_NEW_PLAYLIST } from './utils';

const description = `
# DialogComponent

A stateless dialog component for video URL input and validation. This component handles the presentation layer only, 
with all state management and business logic handled by its parent.

## Props
- \`state\`: Current state of the dialog (urls, validation results, etc.)
- \`open\`: Controls dialog visibility
- \`handleClose\`: Handler for closing the dialog
- \`playlists\`: Available playlists
- \`handleSubmit\`: Handler for form submission`;

const meta: Meta<typeof DialogComponent> = {
  title: 'Watch/Dialogs/Upload',
  component: DialogComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: description,
      },
      story: {
        inline: false,
        height: '500px',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    state: {
      description: 'Current state of the dialog',
    },
    open: {
      description: 'Controls dialog visibility',
      control: 'boolean',
    },
    handleClose: {
      description: 'Handler for closing the dialog',
      control: null,
    },
    playlists: {
      description: 'Available playlists from the system',
      control: null,
    },
    onFormFieldChange: {
      description: 'Handler for form field changes',
      control: null,
    },
    handleSubmit: {
      description: 'Handler for form submission',
      control: null,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DialogComponent>;

// Mock handlers
const mockHandlers = {
  handleClose: () => console.log('Dialog closed'),
  onFormFieldChange:
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      action(`${field} changed`)(e.target.value),
  handleSubmit: async (e: React.FormEvent) => {
    e.preventDefault();
    action('Form submitted')(e);
  },
  playlists: [
    { id: '1', title: 'Favorites', slug: 'favorites' },
    { id: '2', title: 'Watch Later', slug: 'watch-later' },
    { id: '3', title: 'Music Videos', slug: 'music-videos' },
  ],
};

// Initial state
const baseState = {
  title: 'Video title',
  url: '',
  description: 'Video long description',
  isSubmitting: false,
  error: null,
  closeDialogCountdown: null,
  playlistId: '',
  newPlaylistName: '',
  videoPositionInPlaylist: 0,
};

// Basic empty state
export const Initial: Story = {
  args: {
    state: baseState,
    open: true,
    ...mockHandlers,
  },
};

// Submitting state
export const Submitting: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isSubmitting: true,
    },
  },
};

export const WithPlaylist: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      playlistId: '1',
      videoPositionInPlaylist: 2,
    },
  },
};

export const CreatingNewPlaylist: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      playlistId: CREATE_NEW_PLAYLIST,
      newPlaylistName: 'My New Playlist',
    },
  },
};

export const InvalidUrl: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      error: '✗ Invalid video URL',
      url: 'invalid-url',
    },
  },
};

export const SubmitSuccessAutoClose: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      title: '',
      url: '',
      error: '',
      description: '',
      closeDialogCountdown: 3,
    },
  },
};

export const SubmitFailed: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      error: 'Failed to upload videos',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
  },
};
