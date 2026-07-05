import Notifications from '@mui/icons-material/Notifications';
import IconButton from '@mui/material/IconButton';
import type { Meta, StoryObj } from '@storybook/tanstack-react';
import { GlassmorphismProvider } from '../minimalism';
import { Header } from './index';

const meta: Meta<typeof Header> = {
  title: 'Universal/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  // ThemeToggleButton reads the glassmorphism theme context.
  decorators: [
    (Story) => (
      <GlassmorphismProvider>
        <Story />
      </GlassmorphismProvider>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

const user = {
  id: '123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  picture: 'https://i.pravatar.cc/80',
};

const siteChoices = {
  activeSite: 'watch',
  sites: {
    main: 'https://main.example.com',
    listen: 'https://listen.example.com',
    watch: 'https://watch.example.com',
    til: 'https://til.example.com',
  },
};

// Main-style: no site switcher, empty slot.
export const Default: Story = {
  args: {
    user,
  },
};

export const SignedOut: Story = {
  args: {
    user: null,
  },
};

export const WithSiteSwitcher: Story = {
  args: {
    user,
    siteChoices,
  },
};

// Demonstrates the slot rendered between the theme toggle and the avatar.
export const WithActions: Story = {
  args: {
    user,
    siteChoices,
    actions: (
      <IconButton aria-label="notifications">
        <Notifications />
      </IconButton>
    ),
  },
};
