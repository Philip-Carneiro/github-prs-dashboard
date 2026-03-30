import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RefreshButton } from '../components/RefreshButton';
import type { RefreshStatus } from '../types';

const BASE_STATUS: RefreshStatus = {
  lastSuccessfulRefresh: null,
  lastFailedAttempt: null,
  error: null,
};

describe('RefreshButton', () => {
  it('should render refresh button', () => {
    render(<RefreshButton isLoading={false} refreshStatus={BASE_STATUS} onRefresh={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<RefreshButton isLoading={true} refreshStatus={BASE_STATUS} onRefresh={vi.fn()} />);

    const button = screen.getByRole('button', { name: 'Loading...' });
    expect(button).toBeDisabled();
  });

  it('should display last successful refresh timestamp', () => {
    const status: RefreshStatus = {
      ...BASE_STATUS,
      lastSuccessfulRefresh: '2024-06-15T10:30:00Z',
    };

    render(<RefreshButton isLoading={false} refreshStatus={status} onRefresh={vi.fn()} />);

    expect(screen.getByText(/Last refresh:/)).toBeInTheDocument();
  });

  it('should not display error when there is none', () => {
    const status: RefreshStatus = {
      ...BASE_STATUS,
      lastSuccessfulRefresh: '2024-06-15T10:30:00Z',
    };

    render(<RefreshButton isLoading={false} refreshStatus={status} onRefresh={vi.fn()} />);

    expect(screen.queryByText(/Failed to refresh/)).not.toBeInTheDocument();
  });

  it('should display error message when refresh fails', () => {
    const status: RefreshStatus = {
      lastSuccessfulRefresh: '2024-06-15T10:00:00Z',
      lastFailedAttempt: '2024-06-15T10:30:00Z',
      error: 'Connection error',
    };

    render(<RefreshButton isLoading={false} refreshStatus={status} onRefresh={vi.fn()} />);

    expect(screen.getByText(/Failed to refresh/)).toBeInTheDocument();
    expect(screen.getByText(/Connection error/)).toBeInTheDocument();
    expect(screen.getByText(/Last refresh:/)).toBeInTheDocument();
  });

  it('should show auto-refresh indicator when enabled', () => {
    render(
      <RefreshButton
        isLoading={false}
        refreshStatus={BASE_STATUS}
        onRefresh={vi.fn()}
        autoRefreshEnabled={true}
      />
    );

    expect(screen.getByText('Auto-refresh ON')).toBeInTheDocument();
  });

  it('should call onRefresh when button is clicked', () => {
    const onRefresh = vi.fn();

    render(<RefreshButton isLoading={false} refreshStatus={BASE_STATUS} onRefresh={onRefresh} />);

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should show error with warning icon styling', () => {
    const status: RefreshStatus = {
      lastSuccessfulRefresh: null,
      lastFailedAttempt: '2024-06-15T10:30:00Z',
      error: 'Network error',
    };

    const { container } = render(
      <RefreshButton isLoading={false} refreshStatus={status} onRefresh={vi.fn()} />
    );

    const errorElement = container.querySelector('.refresh-error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement?.textContent).toContain('Network error');
  });
});
