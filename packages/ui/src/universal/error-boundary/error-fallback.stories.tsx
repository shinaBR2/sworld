import type { Meta, StoryObj } from '@storybook/react';
import { ErrorFallback } from './index';

const meta: Meta<typeof ErrorFallback> = {
  title: 'Universal/ErrorFallback',
  component: ErrorFallback,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorFallback>;

// Basic story with default props
export const Default: Story = {};
