import type { Meta, StoryObj } from '@storybook/react';
import { VideoUploadDialog } from './index';
import { userEvent, within } from '@storybook/testing-library';

const meta: Meta<typeof VideoUploadDialog> = {
  title: 'Components/VideoUploadDialog',
  component: VideoUploadDialog,
  parameters: {
    layout: 'centered',
    // docs: {
    //   story: {
    //     inline: false,
    //     height: '500px',
    //   },
    // },
    docs: {
      story: {
        inline: false,
        height: '500px',
      },
      description: {
        component: `
# VideoUploadDialog Component

The VideoUploadDialog component provides a modal interface for users to input and validate video URLs. It supports batch URL validation and submission with a clean, user-friendly interface.

## Key Features

- **URL Validation**: Validates multiple video URLs using ReactPlayer
- **Batch Processing**: Handles multiple URLs input via comma separation
- **Real-time Feedback**: Shows validation status for each URL
- **Accessibility**: Fully accessible with proper ARIA labels and roles
- **Loading States**: Clear visual feedback during validation and submission
- **Error Handling**: Proper error display and management

## Component Structure

The dialog consists of:
- Title with close button
- Multi-line text input for URLs
- Validation/Submit button
- Results section showing status for each URL
- Loading indicators for both validation and submission states

## Usage Notes

- URLs should be comma-separated
- The dialog handles its own validation logic
- Supports custom submission handling via onSubmit prop
- Maintains state during validation process

## Example Implementation

\`\`\`tsx
<VideoUploadDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onSubmit={async (urls) => {
    // Handle valid URLs
    await saveVideos(urls);
  }}
/>
\`\`\`
`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      description: 'Controls the visibility of the dialog',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
      },
    },
    onOpenChange: {
      description: 'Callback function when dialog open state changes',
      control: 'function',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
    onSubmit: {
      description: 'Optional callback for handling validated URLs',
      control: 'function',
      table: {
        type: { summary: '(urls: string[]) => Promise<void>' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VideoUploadDialog>;

const defaultArgs = {
  open: true,
  onOpenChange: (open: boolean) => {
    console.log('Dialog open state:', open);
  },
};

// Basic story showing the dialog
export const Default: Story = {
  args: { ...defaultArgs },
  parameters: {
    docs: {
      story: {
        inline: false,
        height: '500px',
      },
    },
  },
};

// Story with submit handler
export const WithSubmitHandler: Story = {
  args: {
    ...defaultArgs,
    onSubmit: async (urls: string[]) => {
      console.log('Submitted URLs:', urls);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Dialog with a submit handler that processes the validated URLs.',
      },
      story: {
        inline: false,
        height: '500px',
      },
    },
  },
};

// Story showing loading state
export const Loading: Story = {
  args: {
    ...defaultArgs,
    onSubmit: async () => {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Long delay to show loading state
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Dialog in loading state while processing URLs.',
      },
    },
  },
};

// Story with pre-filled URLs
export const MixedUrlValidation: Story = {
  args: {
    ...defaultArgs,
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        height: '500px',
      },
      description: {
        story: 'Shows validation of both valid and invalid video URLs.',
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const utils = within(document.body);
    const user = userEvent.setup();

    console.log('Initial HTML:', canvasElement.innerHTML);

    await step('Enter mixed URLs', async () => {
      // const urlInput = canvas.getByPlaceholderText(
      //   'Paste video URLs, separated by commas'
      // );
      const dialog = await utils.findByRole('dialog');
      console.log('Dialog found:', dialog);

      // Now search within the dialog instead of the canvas
      const dialogElement = within(dialog);

      console.log('Canvas element:', canvasElement);
      console.log('Available elements:', canvasElement.innerHTML);

      const urlInput = dialogElement.getByPlaceholderText(
        'Paste video URLs, separated by commas'
      );

      const urls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'invalid-url',
        'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://vimeo.com/148751763',
      ].join(',\n');

      await user.type(urlInput, urls);
    });

    await step('Validate URLs', async () => {
      const validateButton = await utils.findByRole('button', {
        name: /Validate URLs/,
      });
      await user.click(validateButton);
    });
  },
};
