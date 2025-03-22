import { render, screen } from '@testing-library/react';
import { PostCard } from './index';
import { Post } from '../type';
import { describe, it, expect } from 'vitest';

const mockPost = {
  id: '123',
  title: 'Test Post Title',
  brief: 'This is a test brief description for the post card component',
  readTimeInMinutes: 5,
} as Post;

describe('PostCard', () => {
  it('renders post content correctly', () => {
    render(<PostCard {...mockPost} />);

    // Check title
    expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent(mockPost.title);

    // Check brief
    expect(screen.getByText(mockPost.brief)).toBeInTheDocument();

    // Check read time
    expect(screen.getByText(`${mockPost.readTimeInMinutes} min read`)).toBeInTheDocument();
  });
});
