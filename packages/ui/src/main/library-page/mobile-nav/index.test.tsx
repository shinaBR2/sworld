import { render, screen, fireEvent } from '@testing-library/react';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileNavigation } from './index';
import * as responsive from '../../../universal/responsive';

describe('MobileNavigation', () => {
  const useIsMobileMock = vi.spyOn(responsive, 'useIsMobile');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing if not mobile', () => {
    useIsMobileMock.mockReturnValue(false);
    const { container } = render(<MobileNavigation />);
    expect(container.firstChild).toBeNull();
  });

  it('renders navigation actions when mobile', () => {
    useIsMobileMock.mockReturnValue(true);
    render(<MobileNavigation value={1} />);
    // Only check for the action buttons by visible text
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
  });

  it('calls onChange when a navigation action is clicked', () => {
    useIsMobileMock.mockReturnValue(true);
    const handleChange = vi.fn();
    render(<MobileNavigation value={0} onChange={handleChange} />);
    // Find all navigation actions
    const actions = screen.getAllByRole('button');
    // Click the third action (Wishlist)
    fireEvent.click(actions[2]);
    // onChange should be called with the new index (2)
    expect(handleChange).toHaveBeenCalledWith(2);
  });
});
