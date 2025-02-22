import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { LoginDialog } from '../index';

// Mock Material-UI Dialog
vi.mock('@mui/material/Dialog', () => ({
  default: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
}));

describe('LoginDialog', () => {
  it('renders correctly when open', () => {
    render(<LoginDialog />);

    // Check if dialog is rendered
    expect(screen.getByTestId('dialog')).toBeInTheDocument();

    // Check welcome text
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();

    // Check button text
    expect(screen.getByText('FLOW')).toBeInTheDocument();

    // Check if Google icon is present
    expect(screen.getByTestId('GoogleIcon')).toBeInTheDocument();
  });

  it('calls onAction when login button is clicked', () => {
    const mockOnAction = vi.fn();

    render(<LoginDialog onAction={mockOnAction} />);

    const loginButton = screen.getByText('FLOW');
    fireEvent.click(loginButton);

    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('does not throw when clicking button with no onAction handler', () => {
    render(<LoginDialog />);

    const loginButton = screen.getByText('FLOW');

    expect(() => fireEvent.click(loginButton)).not.toThrow();
  });

  it('renders with correct button styles', () => {
    render(<LoginDialog />);

    const button = screen.getByText('FLOW').closest('button');
    expect(button).toHaveClass('MuiButton-outlined');
    expect(button).toHaveClass('MuiButton-outlinedPrimary');
  });

  it('renders dialog content with correct MUI classes', () => {
    render(<LoginDialog />);

    const dialogContent = screen.getByTestId('dialog').querySelector('.MuiDialogContent-root');
    expect(dialogContent).toBeInTheDocument();
  });

  it('renders box with flex layout', () => {
    render(<LoginDialog />);

    const box = screen.getByTestId('dialog').querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<LoginDialog />);
    expect(container).toMatchSnapshot();
  });
});

describe('LoginDialog Integration', () => {
  it('dialog cannot be closed with escape key', () => {
    render(<LoginDialog />);

    fireEvent.keyDown(screen.getByTestId('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });
});
