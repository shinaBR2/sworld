import type { Meta, StoryObj } from '@storybook/react';
import { FeelingListSkeleton } from './skeleton';

const meta: Meta<typeof FeelingListSkeleton> = {
  title: 'Listen/Home/FeelingListSkeleton',
  component: FeelingListSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FeelingListSkeleton>;

// Basic story with default props
export const Default: Story = {};
