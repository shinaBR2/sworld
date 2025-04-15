import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LandingGrid } from './index';

// Mock the LandingCard component
vi.mock('../landing-card', () => ({
  LandingCard: ({ icon, title, LinkComponent, to, isExternal }: any) => (
    <div 
      data-testid="landing-card" 
      data-icon={icon} 
      data-title={title} 
      data-to={to} 
      data-external={isExternal ? 'true' : 'false'}
      data-has-link-component={LinkComponent ? 'true' : 'false'}
    />
  )
}));

describe('LandingGrid', () => {
  const mockItems = [
    { icon: '🚀', title: 'Item 1', to: '/item1' },
    { icon: '🔍', title: 'Item 2', to: '/item2' },
    { icon: '📊', title: 'Item 3', to: '/item3', isExternal: true },
    { icon: '💡', title: 'Item 4', to: '/item4' },
  ];

  it('renders the correct number of items', () => {
    render(<LandingGrid items={mockItems} />);
    
    const cards = screen.getAllByTestId('landing-card');
    expect(cards).toHaveLength(4);
  });

  it('passes correct props to each LandingCard', () => {
    render(<LandingGrid items={mockItems} />);
    
    const cards = screen.getAllByTestId('landing-card');
    
    expect(cards[0]).toHaveAttribute('data-icon', '🚀');
    expect(cards[0]).toHaveAttribute('data-title', 'Item 1');
    expect(cards[0]).toHaveAttribute('data-to', '/item1');
    expect(cards[0]).toHaveAttribute('data-external', 'false');
    
    expect(cards[2]).toHaveAttribute('data-icon', '📊');
    expect(cards[2]).toHaveAttribute('data-title', 'Item 3');
    expect(cards[2]).toHaveAttribute('data-to', '/item3');
    expect(cards[2]).toHaveAttribute('data-external', 'true');
  });

  it('passes LinkComponent to all LandingCards when provided', () => {
    const MockLinkComponent = ({ to, children }: any) => (
      <a data-testid="mock-link" href={to}>{children}</a>
    );
    
    render(<LandingGrid items={mockItems} LinkComponent={MockLinkComponent} />);
    
    const cards = screen.getAllByTestId('landing-card');
    
    // All cards should have the LinkComponent
    cards.forEach(card => {
      expect(card).toHaveAttribute('data-has-link-component', 'true');
    });
  });

  it('renders grid items with correct responsive sizes', () => {
    render(<LandingGrid items={mockItems} />);
    
    // Check for Grid container
    const container = document.querySelector('.MuiGrid-container');
    expect(container).toBeInTheDocument();
    
    // Check for Grid items with correct props
    const items = document.querySelectorAll('.MuiGrid-item');
    expect(items.length).toBe(4);
    
    items.forEach(item => {
      // Check for xs={6} and md={3} classes
      expect(item.className).toContain('MuiGrid-grid-xs-6');
      expect(item.className).toContain('MuiGrid-grid-md-3');
    });
  });

  it('handles empty items array', () => {
    render(<LandingGrid items={[]} />);
    
    const cards = screen.queryAllByTestId('landing-card');
    expect(cards).toHaveLength(0);
  });
});