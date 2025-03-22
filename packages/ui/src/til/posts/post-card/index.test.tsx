import { render, screen } from '@testing-library/react';
import { PostCard } from './index';
import { Post } from '../types';
import { describe, it, expect, vi } from 'vitest';

const mockPost = {
  id: '123',
  title: 'Test Post Title',
  brief: 'This is a test brief description for the post card component',
  readTimeInMinutes: 5,
} as Post;

describe('PostCard', () => {
  it('renders post content correctly', () => {
    render(<PostCard post={mockPost} LinkComponent={({ children }) => <div>{children}</div>} />);

    // Check title
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent(mockPost.title);

    // Check brief
    expect(screen.getByText(mockPost.brief)).toBeInTheDocument();

    // Check read time
    expect(screen.getByText(`${mockPost.readTimeInMinutes} min read`)).toBeInTheDocument();
  });

  it('applies correct link props', () => {
    const mockLinkComponent = vi.fn(({ children }) => <div>{children}</div>);

    render(<PostCard post={mockPost} LinkComponent={mockLinkComponent} />);

    expect(mockLinkComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        children: expect.anything(),
        style: { textDecoration: 'none' },
      }),
      expect.anything()
    );
  });
});
