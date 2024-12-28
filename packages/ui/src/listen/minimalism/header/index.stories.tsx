import type { Meta, StoryObj } from '@storybook/react';
import { SetStateAction } from 'react';
import { Header } from './index';

const meta: Meta<typeof Header> = {
  title: 'Listen/Header',
  component: Header,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Header Component

The Header component serves as the main navigation bar at the top of the application. It features a responsive layout that adapts to its container width, with content properly distributed across the available space.

## Layout Structure

The header is built using Material-UI's AppBar and Toolbar components with the following structure:
- Left section: Logo and Site Choices navigation
- Right section: User account button that triggers settings panel

## Key Features

- **Responsive Width**: The header automatically adjusts to fill the width of its container
- **Fixed Position**: Uses \`position="sticky"\` to remain visible while scrolling
- **Flexible Layout**: Uses flexbox for proper content distribution
- **Elevation Control**: No shadow by default (elevation={0})
- **Accessibility**: Properly structured as a banner landmark for screen readers

## Usage Notes

- The header requires a parent container with a defined width
- The component will expand to fill the available horizontal space
- Internal spacing automatically adjusts based on the container width
- For optimal display, ensure the parent container provides sufficient width

## Container Requirements

\`\`\`tsx
// Example container setup
<Box sx={{ width: '100%' }}>
  <Header toggleSetting={handleToggle} />
</Box>
\`\`\`
`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    toggleSetting: {
      description:
        'Function called when the account button is clicked. Receives a boolean parameter.',
      control: 'function',
      table: {
        type: { summary: 'Dispatch<SetStateAction<boolean>>' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    toggleSetting: (value: SetStateAction<boolean>) => {
      console.log('Settings toggled:', value);
    },
    sites: {
      listen: 'Listen',
      watch: 'Watch',
      play: 'Play',
    },
  },
};

export const SignedIn: Story = {
  args: {
    toggleSetting: (value: SetStateAction<boolean>) => {
      console.log('Settings toggled:', value);
    },
    sites: {
      listen: 'Listen',
      watch: 'Watch',
      play: 'Play',
    },
    user: {
      id: '123',
      name: 'John Doe',
      picture: 'https://example.com/avatar.jpg',
    },
  },
};

export const NarrowContainer: Story = {
  args: {
    toggleSetting: (value: SetStateAction<boolean>) => {
      console.log('Settings toggled:', value);
    },
    sites: {
      listen: 'Listen',
      watch: 'Watch',
      play: 'Play',
    },
  },
  decorators: [
    Story => (
      <div style={{ width: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Header component in a narrow container (600px) to demonstrate responsive behavior.',
      },
    },
  },
};
