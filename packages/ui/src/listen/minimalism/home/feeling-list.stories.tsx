import { Meta, StoryObj } from '@storybook/react';
import { FeelingList } from './feeling-list';
import Box from '@mui/material/Box';

const meta: Meta<typeof FeelingList> = {
  title: 'Listen/Home/FeelingList',
  component: FeelingList,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <Box width={'600px'}>
        <Story />
      </Box>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FeelingList>;

export const Loaded: Story = {
  args: {
    activeId: '',
    onSelect: () => {},
    queryRs: {
      isLoading: false,
      // @ts-ignore
      data: {
        tags: [
          { id: '1', name: 'Happy' },
          { id: '2', name: 'Sad' },
          { id: '3', name: 'Angry' },
          { id: '4', name: 'Excited' },
        ],
      },
    },
  },
};
