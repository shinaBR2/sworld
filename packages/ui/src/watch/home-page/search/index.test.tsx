import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeSearch } from './index';

describe('HomeSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces input before emitting the query', () => {
    const onQueryChange = vi.fn();
    render(<HomeSearch onQueryChange={onQueryChange} />);

    const input = screen.getByRole('textbox', { name: 'Search videos' });
    fireEvent.change(input, { target: { value: 'react' } });

    // Not emitted synchronously.
    expect(onQueryChange).not.toHaveBeenCalledWith('react');

    vi.advanceTimersByTime(200);
    expect(onQueryChange).toHaveBeenCalledWith('react');
  });

  it('emits only the latest value when typing quickly', () => {
    const onQueryChange = vi.fn();
    render(<HomeSearch onQueryChange={onQueryChange} />);

    const input = screen.getByRole('textbox', { name: 'Search videos' });
    fireEvent.change(input, { target: { value: 'r' } });
    fireEvent.change(input, { target: { value: 're' } });
    fireEvent.change(input, { target: { value: 'rea' } });

    vi.advanceTimersByTime(200);
    expect(onQueryChange).not.toHaveBeenCalledWith('r');
    expect(onQueryChange).not.toHaveBeenCalledWith('re');
    expect(onQueryChange).toHaveBeenCalledWith('rea');
  });
});
