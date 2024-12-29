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
  <Header onProfileClick={handleToggle} />
</Box>
\`\`\`
`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onProfileClick: {
      description: 'Function called when the account button is clicked.',
      control: 'function',
      table: {
        type: { summary: '() => void' },
      },
    },
    sites: {
      description: 'Site choices for navigation links',
      control: 'object',
      table: {
        type: { summary: '{ listen: string; watch: string; play: string }' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

const defaultArgs = {
  onProfileClick: () => {
    console.log('Profile clicked');
  },
  sites: {
    listen: 'Listen',
    watch: 'Watch',
    play: 'Play',
  },
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
};

export const SignedIn: Story = {
  args: {
    ...defaultArgs,
    user: {
      id: '123',
      name: 'John Doe',
      picture: 'https://example.com/avatar.jpg',
    },
  },
};

export const NarrowContainer: Story = {
  args: {
    ...defaultArgs,
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
