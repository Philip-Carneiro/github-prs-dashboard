import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PRFilters } from '../components/PRFilters';
import type { FilterState } from '../types';

const defaultFilters: FilterState = {
  author: 'all',
  repo: 'all',
  status: 'all',
  showClosed: false,
  reviewFilter: 'all',
  buildStatusFilter: 'all',
};

const authors = ['alice', 'bob', 'charlie'];
const repos = ['org/repo', 'org/repo2'];

function renderFilters(overrides: Partial<Parameters<typeof PRFilters>[0]> = {}) {
  const defaults = {
    filters: defaultFilters,
    authors,
    repos,
    myUsername: '',
    onAuthorChange: vi.fn(),
    onRepoChange: vi.fn(),
    onStatusChange: vi.fn(),
    onToggleShowClosed: vi.fn(),
    onReviewFilterChange: vi.fn(),
    onBuildStatusChange: vi.fn(),
    ...overrides,
  };
  render(<PRFilters {...defaults} />);
  return defaults;
}

describe('PRFilters', () => {
  it('renders author dropdown with all options', () => {
    renderFilters();

    expect(screen.getByLabelText('Author')).toBeInTheDocument();
    expect(screen.getByText('All authors')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('charlie')).toBeInTheDocument();
  });

  it('renders repository dropdown with all options', () => {
    renderFilters();

    expect(screen.getByLabelText('Repository')).toBeInTheDocument();
    expect(screen.getByText('All repositories')).toBeInTheDocument();
    expect(screen.getByText('org/repo')).toBeInTheDocument();
    expect(screen.getByText('org/repo2')).toBeInTheDocument();
  });

  it('renders status dropdown', () => {
    renderFilters();

    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByText('All statuses')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.getByText('Merged')).toBeInTheDocument();
  });

  it('renders show closed checkbox', () => {
    renderFilters();

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('calls onAuthorChange when author is selected', async () => {
    const user = userEvent.setup();
    const { onAuthorChange } = renderFilters();

    await user.selectOptions(screen.getByLabelText('Author'), 'alice');
    expect(onAuthorChange).toHaveBeenCalledWith('alice');
  });

  it('calls onRepoChange when repo is selected', async () => {
    const user = userEvent.setup();
    const { onRepoChange } = renderFilters();

    await user.selectOptions(screen.getByLabelText('Repository'), 'org/repo');
    expect(onRepoChange).toHaveBeenCalledWith('org/repo');
  });

  it('calls onStatusChange when status is selected', async () => {
    const user = userEvent.setup();
    const { onStatusChange } = renderFilters();

    await user.selectOptions(screen.getByLabelText('Status'), 'open');
    expect(onStatusChange).toHaveBeenCalledWith('open');
  });

  it('calls onToggleShowClosed when checkbox is clicked', async () => {
    const user = userEvent.setup();
    const { onToggleShowClosed } = renderFilters();

    await user.click(screen.getByRole('checkbox'));
    expect(onToggleShowClosed).toHaveBeenCalledOnce();
  });

  it('reflects current filter state', () => {
    const activeFilters: FilterState = {
      author: 'bob',
      repo: 'org/repo2',
      status: 'open',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'failed',
    };

    renderFilters({ filters: activeFilters });

    expect(screen.getByLabelText('Author')).toHaveValue('bob');
    expect(screen.getByLabelText('Repository')).toHaveValue('org/repo2');
    expect(screen.getByLabelText('Status')).toHaveValue('open');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(screen.getByLabelText('Build Status')).toHaveValue('failed');
  });

  it('does not render review dropdown when myUsername is empty', () => {
    renderFilters({ myUsername: '' });

    expect(screen.queryByLabelText('Review')).not.toBeInTheDocument();
  });

  it('renders review dropdown when myUsername is set', () => {
    renderFilters({ myUsername: 'alice' });

    expect(screen.getByLabelText('Review')).toBeInTheDocument();
    expect(screen.getByText('All PRs')).toBeInTheDocument();
    expect(screen.getByText('Needs my review')).toBeInTheDocument();
    expect(screen.getByText('I requested changes')).toBeInTheDocument();
    expect(screen.getByText('I approved')).toBeInTheDocument();
  });

  it('calls onReviewFilterChange when review filter is selected', async () => {
    const user = userEvent.setup();
    const { onReviewFilterChange } = renderFilters({ myUsername: 'alice' });

    await user.selectOptions(screen.getByLabelText('Review'), 'needs_my_review');
    expect(onReviewFilterChange).toHaveBeenCalledWith('needs_my_review');
  });

  it('renders build status dropdown with all options', () => {
    renderFilters();

    expect(screen.getByLabelText('Build Status')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Passed' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Failed' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pending' })).toBeInTheDocument();
  });

  it('calls onBuildStatusChange when build status is selected', async () => {
    const user = userEvent.setup();
    const { onBuildStatusChange } = renderFilters();

    await user.selectOptions(screen.getByLabelText('Build Status'), 'passed');
    expect(onBuildStatusChange).toHaveBeenCalledWith('passed');
  });

  it('calls onBuildStatusChange with pending when pending is selected', async () => {
    const user = userEvent.setup();
    const { onBuildStatusChange } = renderFilters();

    await user.selectOptions(screen.getByLabelText('Build Status'), 'pending');
    expect(onBuildStatusChange).toHaveBeenCalledWith('pending');
  });

  it('reflects current build status filter value', () => {
    const activeFilters: FilterState = {
      ...defaultFilters,
      buildStatusFilter: 'passed',
    };

    renderFilters({ filters: activeFilters });

    expect(screen.getByLabelText('Build Status')).toHaveValue('passed');
  });

  it('reflects pending build status filter value', () => {
    const activeFilters: FilterState = {
      ...defaultFilters,
      buildStatusFilter: 'pending',
    };

    renderFilters({ filters: activeFilters });

    expect(screen.getByLabelText('Build Status')).toHaveValue('pending');
  });
});
