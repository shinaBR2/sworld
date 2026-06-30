import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WatchEmptyState } from './index';

const mockUseQueryContext = vi.fn();

vi.mock('core', () => ({
  Query: {
    useQueryContext: () => mockUseQueryContext(),
  },
}));

vi.mock('../../dialogs/upload', () => ({
  VideoUploadDialog: vi.fn(() => <div>VideoUploadDialog</div>),
}));

describe('WatchEmptyState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the message and an upload CTA when the upload flag is on', () => {
    mockUseQueryContext.mockReturnValue({
      featureFlags: { data: { upload: true }, isLoading: false },
    });

    render(<WatchEmptyState />);

    expect(screen.getByText('No videos yet')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /upload a video/i }),
    ).toBeInTheDocument();
  });

  it('hides the upload CTA when the upload flag is off', () => {
    mockUseQueryContext.mockReturnValue({
      featureFlags: { data: { upload: false }, isLoading: false },
    });

    render(<WatchEmptyState />);

    expect(screen.getByText('No videos yet')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /upload a video/i }),
    ).not.toBeInTheDocument();
  });
});
