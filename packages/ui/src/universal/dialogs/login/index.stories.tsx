import type { Meta, StoryObj } from '@storybook/react';
import { LoginDialog } from './index';

const meta: Meta<typeof LoginDialog> = {
  title: 'Universal/LoginDialog',
  component: LoginDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LoginDialog>;

// Basic story with default props
export const Default: Story = {};
