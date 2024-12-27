import type { Meta, StoryObj } from '@storybook/react';
import Logo from './index';

const meta: Meta<typeof Logo> = {
  title: 'Universal/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Logo>;

// Basic story with default props
export const Default: Story = {};
