import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FabButton } from './index';

describe('FabButton', () => {
  it('renders correctly', () => {
    const onClick = vi.fn();
    render(<FabButton onClick={onClick} />);

    // Check if the button is rendered
    const button = screen.getByRole('button', { name: /add/i });
    expect(button).toBeInTheDocument();

    // Check if the button has the correct color
    expect(button).toHaveClass('MuiFab-secondary');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<FabButton onClick={onClick} />);

    // Find and click the button
    const button = screen.getByRole('button', { name: /add/i });
    fireEvent.click(button);

    // Check if onClick was called
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('contains the add icon', () => {
    const onClick = vi.fn();
    render(<FabButton onClick={onClick} />);

    // Check if the SVG icon is present
    // Note: This is a simplified check since the actual icon is an SVG
    const iconElement = document.querySelector('svg');
    expect(iconElement).toBeInTheDocument();
  });
});
