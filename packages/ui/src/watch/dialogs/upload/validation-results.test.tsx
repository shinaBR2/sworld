import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { texts } from './texts';
import { type ValidationResult, ValidationResults } from './validation-results';

describe('ValidationResults', () => {
  const createMockResults = (
    count: number,
    allValid: boolean = false,
  ): ValidationResult[] =>
    Array.from({ length: count }, (_, index) => ({
      url: `http://example${index}.com`,
      isValid: allValid ? true : index % 2 === 0,
    }));

  it('does not render when there are no results', () => {
    const { container } = render(<ValidationResults results={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders multiple validation results correctly', () => {
    const results = createMockResults(4);

    act(() => {
      render(<ValidationResults results={results} />);
    });

    const resultsList = screen.getByRole('list', {
      name: 'Validation results',
    });
    expect(resultsList).toBeInTheDocument();
    expect(resultsList).toHaveAttribute('aria-label', 'Validation results');

    const resultItems = screen.getAllByRole('listitem');
    expect(resultItems).toHaveLength(4);

    results.forEach((result, index) => {
      const resultItem = resultItems[index];

      // Check URL is displayed
      expect(resultItem).toHaveTextContent(result.url);

      // Check severity based on validation
      if (result.isValid) {
        expect(resultItem).toHaveAttribute(
          'aria-label',
          texts.validation.valid.ariaLabel,
        );
        expect(resultItem).toHaveTextContent(texts.validation.valid.status);
      } else {
        expect(resultItem).toHaveAttribute(
          'aria-label',
          texts.validation.invalid.ariaLabel,
        );
        expect(resultItem).toHaveTextContent(texts.validation.invalid.status);
      }
    });
  });

  it('renders all valid results correctly', () => {
    const results = createMockResults(3, true);

    act(() => {
      render(<ValidationResults results={results} />);
    });

    const resultItems = screen.getAllByRole('listitem');

    resultItems.forEach((resultItem) => {
      expect(resultItem).toHaveAttribute(
        'aria-label',
        texts.validation.valid.ariaLabel,
      );
      expect(resultItem).toHaveTextContent(texts.validation.valid.status);
    });
  });

  it('renders all invalid results correctly', () => {
    const results = [
      { url: 'http://invalid1.com', isValid: false },
      { url: 'http://invalid2.com', isValid: false },
      { url: '', isValid: false },
    ];

    act(() => {
      render(<ValidationResults results={results} />);
    });

    const resultItems = screen.getAllByRole('listitem');

    resultItems.forEach((resultItem) => {
      expect(resultItem).toHaveAttribute(
        'aria-label',
        texts.validation.invalid.ariaLabel,
      );
      expect(resultItem).toHaveTextContent(texts.validation.invalid.status);
    });
  });

  it('uses unique keys for each result', () => {
    const results = createMockResults(4);

    act(() => {
      render(<ValidationResults results={results} />);
    });

    const { container } = render(<ValidationResults results={results} />);

    // Query for all result items
    const resultItems = container.querySelectorAll('[role="listitem"]');
    expect(resultItems.length).toBe(4);

    const dataKeys = Array.from(resultItems).map((item) =>
      item.getAttribute('data-key'),
    );

    const uniqueDataKeys = new Set(dataKeys);
    expect(uniqueDataKeys.size).toBe(4);
    const urls = Array.from(resultItems).map((item) => item?.textContent);
    expect(urls.length).toBe(4);
  });

  it('breaks long URLs', () => {
    const results = [
      {
        url: 'http://verylongurl.com/with/very/long/path/that/should/break',
        isValid: true,
      },
    ];

    act(() => {
      render(<ValidationResults results={results} />);
    });

    const urlBox = screen.getByText(results[0].url);
    expect(urlBox).toHaveStyle({ wordBreak: 'break-all' });
  });
});
