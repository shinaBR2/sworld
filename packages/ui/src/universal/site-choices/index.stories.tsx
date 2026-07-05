import type { Meta, StoryObj } from '@storybook/tanstack-react';
import SiteChoices from './index';

const meta: Meta<typeof SiteChoices> = {
  title: 'Universal/SiteChoices',
  component: SiteChoices,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SiteChoices>;

// Basic story with default props
export const Default: Story = {
  args: {
    activeSite: 'listen',
    sites: {
      main: 'https://example.com',
      listen: 'https://listen.example.com',
      watch: 'https://watch.example.com',
      til: 'https://til.example.com',
    },
  },
};
