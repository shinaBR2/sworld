import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import { PhotoLightboxSkeleton } from './skeleton';

const meta: Meta<typeof PhotoLightboxSkeleton> = {
  title: 'Look/PhotoLightboxSkeleton',
  component: PhotoLightboxSkeleton,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Stack sx={{ height: '100vh' }}>
        <Story />
      </Stack>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PhotoLightboxSkeleton>;

export const Default: Story = {};
