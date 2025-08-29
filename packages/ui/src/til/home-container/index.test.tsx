import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeContainer } from './index';
import { texts } from './texts';

vi.mock('../posts/post-card/skeleton', () => ({
  SkeletonPostCard: () => <div data-testid="skeleton-post-card" />,
}));

vi.mock('../posts/post-card', () => ({
  PostCard: ({ post }: { post: { id: string } }) => (
    <div data-testid={`post-card-${post.id}`} />
  ),
}));

describe('HomeContainer', () => {
  const mockQueryRs = (isLoading: boolean, posts: Array<{ id: string }>) => ({
    posts,
    isLoading,
    isError: false,
    refetch: vi.fn(),
  });

  it('displays loading skeletons when data is loading', () => {
    render(<HomeContainer queryRs={mockQueryRs(true, [])} />);

    const skeletons = screen.getAllByTestId('skeleton-post-card');
    expect(skeletons).toHaveLength(12); // Matches the 12 skeleton array
  });

  it('renders post cards when data is loaded', () => {
    const mockPosts = [
      { id: '1', title: 'Post 1' },
      { id: '2', title: 'Post 2' },
    ];

    render(<HomeContainer queryRs={mockQueryRs(false, mockPosts)} />);

    expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-2')).toBeInTheDocument();
  });

  it('shows no posts message when empty', () => {
    const { container } = render(
      <HomeContainer queryRs={mockQueryRs(false, [])} />,
    );

    expect(container).toHaveTextContent(texts.noPosts);
    expect(screen.queryByTestId('post-card-1')).not.toBeInTheDocument();
  });
});
