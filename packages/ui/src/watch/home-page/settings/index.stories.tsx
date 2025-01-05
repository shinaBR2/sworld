import type { Meta, StoryObj } from '@storybook/react';
import { SettingsPanel } from '.';

const meta: Meta<typeof SettingsPanel> = {
  title: 'Watch/SettingsPanel',
  component: SettingsPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SettingsPanel>;

// Basic story with default props
export const Default: Story = {
  args: {
    open: true,
    toggle: () => {},
  },
};
