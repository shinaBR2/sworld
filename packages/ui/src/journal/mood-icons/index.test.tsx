import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MoodIcon } from './index';

describe('MoodIcon', () => {
  it('renders happy mood icon correctly', () => {
    render(<MoodIcon mood="happy" />);
    const icon = screen.getByTestId('SentimentSatisfiedAltIcon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ color: 'rgb(0, 128, 0)' });
  });

  it('renders sad mood icon correctly', () => {
    render(<MoodIcon mood="sad" />);
    const icon = screen.getByTestId('SentimentVeryDissatisfiedIcon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('renders neutral mood icon correctly', () => {
    render(<MoodIcon mood="neutral" />);
    const icon = screen.getByTestId('SentimentNeutralIcon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ color: 'rgb(0, 0, 255)' });
  });

  it('applies custom size correctly', () => {
    const customSize = 32;
    render(<MoodIcon mood="happy" size={customSize} />);
    const icon = screen.getByTestId('SentimentSatisfiedAltIcon');
    expect(icon).toHaveStyle({ width: `${customSize}px`, height: `${customSize}px` });
  });

  it('applies custom className correctly', () => {
    const customClass = 'custom-icon';
    render(<MoodIcon mood="happy" className={customClass} />);
    const icon = screen.getByTestId('SentimentSatisfiedAltIcon');
    expect(icon).toHaveClass(customClass);
  });

  it('returns null for invalid mood', () => {
    // @ts-expect-error testing invalid mood
    const { container } = render(<MoodIcon mood="invalid" />);
    expect(container.firstChild).toBeNull();
  });
});
