import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SummaryCardSkeleton } from './skeleton';

// Mock the styled components
vi.mock('./styled', () => ({
  StyledCard: ({ children, category, selected, 'aria-busy': ariaBusy }: any) => (
    <div 
      data-testid="styled-card" 
      data-category={category} 
      data-selected={selected.toString()}
      aria-busy={ariaBusy}
    >
      {children}
    </div>
  ),
  StyledAmount: ({ children }: any) => <div data-testid="styled-amount">{children}</div>,
  StyledCategoryName: ({ children }: any) => <div data-testid="styled-category-name">{children}</div>,
  StyledCategoryWrapper: ({ children }: any) => <div data-testid="styled-category-wrapper">{children}</div>,
}));

// Mock the Skeleton component
vi.mock('@mui/material', () => ({
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  Skeleton: ({ variant, width, height }: any) => (
    <div 
      data-testid="skeleton" 
      data-variant={variant || 'text'} 
      data-width={width} 
      data-height={height}
    />
  ),
  Typography: ({ children, variant, color }: any) => (
    <div data-testid={`typography-${variant}`} data-color={color}>
      {children}
    </div>
  ),
}));

describe('SummaryCardSkeleton', () => {
  it('renders with aria-busy attribute', () => {
    render(<SummaryCardSkeleton />);
    
    const card = screen.getByTestId('styled-card');
    expect(card).toHaveAttribute('aria-busy', 'true');
  });

  it('renders with empty category and not selected', () => {
    render(<SummaryCardSkeleton />);
    
    const card = screen.getByTestId('styled-card');
    expect(card).toHaveAttribute('data-category', '');
    expect(card).toHaveAttribute('data-selected', 'false');
  });

  it('renders the category name skeleton with circular icon', () => {
    render(<SummaryCardSkeleton />);
    
    const categoryName = screen.getByTestId('styled-category-name');
    expect(categoryName).toBeInTheDocument();
    
    const skeletons = screen.getAllByTestId('skeleton');
    
    // Find the circular skeleton for the icon
    const iconSkeleton = skeletons.find(
      skeleton => 
        skeleton.getAttribute('data-variant') === 'circular' && 
        skeleton.getAttribute('data-width') === '24' &&
        skeleton.getAttribute('data-height') === '24'
    );
    
    expect(iconSkeleton).toBeInTheDocument();
    
    // Find the text skeleton for the category name
    const nameSkeleton = skeletons.find(
      skeleton => 
        skeleton.getAttribute('data-variant') === 'text' && 
        skeleton.getAttribute('data-width') === '40'
    );
    
    expect(nameSkeleton).toBeInTheDocument();
  });

  it('renders the amount skeleton', () => {
    render(<SummaryCardSkeleton />);
    
    const amount = screen.getByTestId('styled-amount');
    expect(amount).toBeInTheDocument();
    
    const skeletons = screen.getAllByTestId('skeleton');
    
    // Find the skeleton for the amount
    const amountSkeleton = skeletons.find(
      skeleton => 
        skeleton.getAttribute('data-width') === '100' &&
        skeleton.getAttribute('data-height') === '40'
    );
    
    expect(amountSkeleton).toBeInTheDocument();
  });

  it('renders the transaction count skeleton', () => {
    render(<SummaryCardSkeleton />);
    
    const typography = screen.getByTestId('typography-body2');
    expect(typography).toBeInTheDocument();
    expect(typography).toHaveAttribute('data-color', 'text.secondary');
    
    const skeletons = screen.getAllByTestId('skeleton');
    
    // Find the skeleton for the transaction count
    const countSkeleton = skeletons.find(
      skeleton => skeleton.getAttribute('data-width') === '80'
    );
    
    expect(countSkeleton).toBeInTheDocument();
  });
});