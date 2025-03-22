import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SiteChoices from './index';
import '@testing-library/jest-dom';

describe('SiteChoices', () => {
  const defaultProps = {
    activeSite: 'listen',
    sites: {
      listen: 'http://listen.example.com',
      watch: 'http://watch.example.com',
      play: 'http://play.example.com',
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
    expect(buttonIcons[1].getAttribute('data-testid')).toBe('KeyboardArrowDownIcon');
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

    // Check all menu items are present
    expect(menuItems[0]).toHaveTextContent('Watch');
    expect(menuItems[1]).toHaveTextContent('Listen');
    expect(menuItems[2]).toHaveTextContent('Play');
    expect(menuItems[3]).toHaveTextContent('TIL');
  });

  it('renders correct icons for each menu item', () => {
    render(<SiteChoices {...defaultProps} />);

    // Open menu
    fireEvent.click(screen.getByRole('button'));

    // Get all menu items
    const menuItems = screen.getAllByRole('menuitem');

    // Check icons within menu items
    const watchIcon = menuItems[0].querySelector('[data-testid="OndemandVideoIcon"]');
    const listenIcon = menuItems[1].querySelector('[data-testid="HeadphonesIcon"]');
    const playIcon = menuItems[2].querySelector('[data-testid="PlayCircleIcon"]');
    const tilIcon = menuItems[3].querySelector('[data-testid="MenuBookIcon"]');

    expect(watchIcon).toBeInTheDocument();
    expect(listenIcon).toBeInTheDocument();
    expect(playIcon).toBeInTheDocument();
    expect(tilIcon).toBeInTheDocument();
  });

  it('sets correct href for menu items', () => {
    render(<SiteChoices {...defaultProps} />);

    // Open menu
    fireEvent.click(screen.getByRole('button'));

    // Check hrefs
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems[0]).toHaveAttribute('href', 'http://watch.example.com');
    expect(menuItems[1]).toHaveAttribute('href', 'http://listen.example.com');
    expect(menuItems[2]).toHaveAttribute('href', 'http://play.example.com');
    expect(menuItems[3]).toHaveAttribute('href', 'http://til.example.com');
  });

  it('shows correct selected state for active site', () => {
    render(<SiteChoices {...defaultProps} />);

    // Open menu
    fireEvent.click(screen.getByRole('button'));

    // Get all menu items
    const menuItems = screen.getAllByRole('menuitem');

    // Listen should be selected (index 1 in the menu items array)
    expect(menuItems[1]).toHaveClass('Mui-selected');

    // Others should not be selected
    expect(menuItems[0]).not.toHaveClass('Mui-selected');
    expect(menuItems[2]).not.toHaveClass('Mui-selected');
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
    expect(watchButton.querySelector('[data-testid="OndemandVideoIcon"]')).toBeInTheDocument();

    // Rerender with different active site
    rerender(<SiteChoices {...defaultProps} activeSite="play" />);

    const playButton = screen.getByRole('button', { name: /site choices/i });
    expect(playButton.querySelector('[data-testid="PlayCircleIcon"]')).toBeInTheDocument();
  });
});
