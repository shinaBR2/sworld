import type { Meta, StoryObj } from '@storybook/react';
import SearchBar from './index';

const meta: Meta<typeof SearchBar> = {
  title: 'Universal/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

// Basic story with default props
export const Default: Story = {};
