import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SiteChoices from './index';
import '@testing-library/jest-dom';

describe('SiteChoices', () => {
  const defaultProps = {
    activeSite: 'listen',
    sites: {
      main: 'http://example.com',
      listen: 'http://listen.example.com',
      watch: 'http://watch.example.com',
      til: 'http://til.example.com',
    },
  };

  it('renders button with correct active site name and icon', () => {
    render(<SiteChoices {...defaultProps} />);

    const button = screen.getByRole('button', { name: /site choices/i });
    expect(button).toBeInTheDocument();

    // Check if icons are present within the button
    const buttonIcons = button.querySelectorAll('svg');
    expect(buttonIcons).toHaveLength(2); // Headphones and KeyboardArrowDown
    expect(buttonIcons[0].getAttribute('data-testid')).toBe('HeadphonesIcon');
    expect(buttonIcons[1].getAttribute('data-testid')).toBe(
      'KeyboardArrowDownIcon',
    );
  });

  it('shows menu when button is clicked', () => {
    render(<SiteChoices {...defaultProps} />);

    // Menu should be closed initially
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Click button to open menu
    fireEvent.click(screen.getByRole('button'));

    // Menu should now be visible
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(4);

    // Check all menu items are present, Main first
    expect(menuItems[0]).toHaveTextContent('Main');
    expect(menuItems[1]).toHaveTextContent('Watch');
    expect(menuItems[2]).toHaveTextContent('Listen');
    expect(menuItems[3]).toHaveTextContent('TIL');
  });

  it('renders correct icons for each menu item', () => {
    render(<SiteChoices {...defaultProps} />);

    // Open menu
    fireEvent.click(screen.getByRole('button'));

    // Get all menu items
    const menuItems = screen.getAllByRole('menuitem');

    // Check icons within menu items
    const mainIcon = menuItems[0].querySelector('[data-testid="HomeIcon"]');
    const watchIcon = menuItems[1].querySelector(
      '[data-testid="OndemandVideoIcon"]',
    );
    const listenIcon = menuItems[2].querySelector(
      '[data-testid="HeadphonesIcon"]',
    );
    const tilIcon = menuItems[3].querySelector('[data-testid="MenuBookIcon"]');

    expect(mainIcon).toBeInTheDocument();
    expect(watchIcon).toBeInTheDocument();
    expect(listenIcon).toBeInTheDocument();
    expect(tilIcon).toBeInTheDocument();
  });

  it('sets correct href for menu items', () => {
    render(<SiteChoices {...defaultProps} />);

    // Open menu
    fireEvent.click(screen.getByRole('button'));

    // Check hrefs
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems[0]).toHaveAttribute('href', 'http://example.com');
    expect(menuItems[1]).toHaveAttribute('href', 'http://watch.example.com');
    expect(menuItems[2]).toHaveAttribute('href', 'http://listen.example.com');
    expect(menuItems[3]).toHaveAttribute('href', 'http://til.example.com');
  });

  // Regression guard for SWO-393: the Main entry (added in SWO-380) shipped as a
  // scheme-less bare domain, which the browser treats as a relative path. Every
  // site link, Main included, must be an absolute URL with a scheme.
  it('renders every site link as an absolute URL', () => {
    render(<SiteChoices {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    const menuItems = screen.getAllByRole('menuitem');
    for (const menuItem of menuItems) {
      expect(menuItem.getAttribute('href')).toMatch(/^https?:\/\//);
    }
  });

  it('shows correct selected state for active site', () => {
    render(<SiteChoices {...defaultProps} />);

    // Open menu
    fireEvent.click(screen.getByRole('button'));

    // Get all menu items
    const menuItems = screen.getAllByRole('menuitem');

    // Listen should be selected (index 2 in the menu items array)
    expect(menuItems[2]).toHaveClass('Mui-selected');

    // Others should not be selected
    expect(menuItems[0]).not.toHaveClass('Mui-selected');
    expect(menuItems[1]).not.toHaveClass('Mui-selected');
    expect(menuItems[3]).not.toHaveClass('Mui-selected');
  });

  it('closes menu when clicking outside', () => {
    render(<SiteChoices {...defaultProps} />);

    // Open menu
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Click outside (on the backdrop)
    const backdrop = document.querySelector('.MuiBackdrop-root');
    fireEvent.click(backdrop as Element);

    // Menu should be closed
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('handles different active sites correctly', () => {
    const propsWithWatch = {
      ...defaultProps,
      activeSite: 'watch',
    };

    const { rerender } = render(<SiteChoices {...propsWithWatch} />);

    const watchButton = screen.getByRole('button', { name: /site choices/i });
    expect(
      watchButton.querySelector('[data-testid="OndemandVideoIcon"]'),
    ).toBeInTheDocument();

    // Rerender with different active site
    rerender(<SiteChoices {...defaultProps} activeSite="main" />);

    const mainButton = screen.getByRole('button', { name: /site choices/i });
    expect(
      mainButton.querySelector('[data-testid="HomeIcon"]'),
    ).toBeInTheDocument();
  });
});
