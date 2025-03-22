import { render, screen } from '@testing-library/react';
import { PostMetadata } from './metadata';
import { describe, it, expect } from 'vitest';

describe('PostMetadata', () => {
  const mockProps = {
    title: 'Test Post Title',
    readTimeInMinutes: 5,
    sx: { margin: 2 },
  };

  it('renders post metadata correctly', () => {
    render(<PostMetadata {...mockProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(mockProps.title);
    expect(screen.getByText(`${mockProps.readTimeInMinutes} min read`)).toBeInTheDocument();
  });
});
