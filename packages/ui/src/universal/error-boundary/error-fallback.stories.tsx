import type { Meta, StoryObj } from '@storybook/react';
import { ErrorFallback } from './index';

const meta: Meta<typeof ErrorFallback> = {
  title: 'Universal/ErrorFallback',
  component: ErrorFallback,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# ErrorFallback Component

The ErrorFallback component is a universal error handling UI that provides a user-friendly interface when an unexpected error occurs in the application.

## Key Features

- Centered error message display
- Customizable error text
- Optional retry functionality
- Responsive design
- Accessibility-friendly

## Usage

\`\`\`tsx
// Basic usage
<ErrorFallback />

// With custom error message
<ErrorFallback 
  errorMessage="Something specific went wrong" 
/>

// Disable retry option
<ErrorFallback 
  canRetry={false} 
/>
\`\`\`

## Props

- \`errorMessage\`: Optional custom error message to display
- \`canRetry\`: Optional boolean to show/hide retry button (default: true)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    errorMessage: {
      control: 'text',
      description: 'Custom error message to display',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Default error message from texts' },
      },
    },
    canRetry: {
      control: 'boolean',
      description: 'Whether to show the retry button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorFallback>;

// Basic story with default props
export const Default: Story = {};

// Story with custom error message
export const CustomMessage: Story = {
  args: {
    errorMessage: 'Connection failed. Please check your network.',
  },
  parameters: {
    docs: {
      description: {
        story: 'ErrorFallback with a custom, more specific error message.',
      },
    },
  },
};

// Story without retry option
export const NoRetry: Story = {
  args: {
    canRetry: false,
    errorMessage: 'Fatal error. Retry is not possible.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'ErrorFallback without the retry button, useful for critical errors.',
      },
    },
  },
};

// Story with a longer error message
export const LongErrorMessage: Story = {
  args: {
    errorMessage:
      'An unexpected error occurred while processing your request. This might be due to a temporary system issue or network problem. Please try again later or contact support if the problem persists.',
  },
  parameters: {
    docs: {
      description: {
        story: 'ErrorFallback with a more detailed error message.',
      },
    },
  },
};
