import type { Meta, StoryObj } from '@storybook/react';
import { DialogComponent } from './index';
import { action } from '@storybook/addon-actions';

const description = `
# DialogComponent

A stateless dialog component for video URL input and validation. This component handles the presentation layer only, 
with all state management and business logic handled by its parent.

## Props
- \`state\`: Current state of the dialog (urls, validation results, etc.)
- \`open\`: Controls dialog visibility
- \`handleClose\`: Handler for closing the dialog
- \`isBusy\`: Whether the dialog is processing something
- \`isSubmitting\`: Whether a submission is in progress
- \`validateUrls\`: Handler for URL validation
- \`onUrlsChange\`: Handler for URL input changes
- \`handleSubmit\`: Handler for form submission
- \`showSubmitButton\`: Whether to show the submit button`;

const meta: Meta<typeof DialogComponent> = {
  title: 'Components/DialogComponent',
  component: DialogComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: description,
      },
      story: {
        inline: false,
        height: '500px',
      },
    },
  },
  decorators: [
    Story => (
      <div style={{ width: '600px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    state: {
      description: 'Current state of the dialog',
    },
    open: {
      description: 'Controls dialog visibility',
      control: 'boolean',
    },
    handleClose: {
      description: 'Handler for closing the dialog',
      control: null,
    },
    isBusy: {
      description: 'Whether the dialog is processing',
      control: 'boolean',
    },
    isSubmitting: {
      description: 'Whether a submission is in progress',
      control: 'boolean',
    },
    validateUrls: {
      description: 'Handler for URL validation',
      control: null,
    },
    onUrlsChange: {
      description: 'Handler for URL input changes',
      control: null,
    },
    handleSubmit: {
      description: 'Handler for form submission',
      control: null,
    },
    showSubmitButton: {
      description: 'Whether to show the submit button',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DialogComponent>;

// Mock handlers
const mockHandlers = {
  handleClose: () => console.log('Dialog closed'),
  validateUrls: async (e: React.FormEvent) => {
    e.preventDefault();
    action('Validating URLs')(e);
  },
  onUrlsChange: (e: React.ChangeEvent<HTMLInputElement>) => action('URLs changed')(e.target.value),
  handleSubmit: async (e: React.FormEvent) => {
    e.preventDefault();
    action('Form submitted')(e);
  },
};

// Initial state
const baseState = {
  urls: '',
  validating: false,
  results: [],
  error: null,
  success: null,
  closeDialogCountdown: 3,
};

// Basic empty state
export const Initial: Story = {
  args: {
    state: baseState,
    open: true,
    isBusy: false,
    isSubmitting: false,
    showSubmitButton: false,
    ...mockHandlers,
  },
};

// Validating state
export const Validating: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      urls: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      validating: true,
    },
    isBusy: true,
  },
};

// State with validation results
export const WithValidationResults: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      urls: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ,https://vimeo.com/123456',
      results: [
        { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isValid: true },
        { url: 'https://vimeo.com/123456', isValid: false },
      ],
    },
    showSubmitButton: true,
  },
};

export const ValidateUrlsValid: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      urls: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      results: [{ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isValid: true }],
    },
    showSubmitButton: true,
  },
};

// Submitting state
export const Submitting: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      urls: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      results: [{ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isValid: true }],
    },
    isBusy: true,
    isSubmitting: true,
    showSubmitButton: true,
  },
};

export const SubmitSuccessAutoClose: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      success: {
        insert_videos: {
          returning: [
            {
              id: '1',
              title: 'video 1',
              description: 'description 1',
            },
            {
              id: '2',
              title: 'video 2',
              description: 'description 1',
            },
          ],
        },
      },
      urls: '',
      results: [],
    },
    showSubmitButton: true,
    handleSubmit: async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Simulating successful submission');
      // Simulate successful upload
      await new Promise(resolve => setTimeout(resolve, 2500));
    },
  },
};

export const SubmitFailed: Story = {
  args: {
    ...Initial.args,
    state: {
      ...baseState,
      error: 'Failed to upload videos',
      urls: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      results: [{ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isValid: true }],
    },
    showSubmitButton: true,
    handleSubmit: async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Simulating successful submission');
      // Simulate successful upload
      await new Promise(resolve => setTimeout(resolve, 2500));
    },
  },
};

// Interactive story
// export const Interactive: Story = {
//   args: {
//     ...Empty.args,
//   },
//   play: async ({ canvasElement, step }) => {
//     const canvas = within(canvasElement);
//     const user = userEvent.setup();

//     await step('Locate dialog elements', async () => {
//       const dialog = await canvas.findByRole('dialog');
//       expect(dialog).toBeInTheDocument();

//       const urlInput = await canvas.findByTestId('url-input-textarea');
//       expect(urlInput).toBeInTheDocument();

//       const validateButton = await canvas.findByRole('button', { name: /Validate URLs/i });
//       expect(validateButton).toBeInTheDocument();
//     });

//     await step('Verify input is enabled', async () => {
//       const urlInput = await canvas.findByTestId('url-input-textarea');
//       expect(urlInput).toBeEnabled();
//     });

//     await step('Verify close button', async () => {
//       const closeButton = await canvas.findByLabelText(/close/i);
//       expect(closeButton).toBeInTheDocument();
//       expect(closeButton).toBeEnabled();
//     });
//   },
// };
