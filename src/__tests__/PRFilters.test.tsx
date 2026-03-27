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
};

const authors = ['alice', 'bob', 'charlie'];
const repos = ['org/repo', 'org/repo2'];

function renderFilters(overrides: Partial<Parameters<typeof PRFilters>[0]> = {}) {
  const defaults = {
    filters: defaultFilters,
    authors,
    repos,
    onAuthorChange: vi.fn(),
    onRepoChange: vi.fn(),
    onStatusChange: vi.fn(),
    onToggleShowClosed: vi.fn(),
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
    };

    renderFilters({ filters: activeFilters });

    expect(screen.getByLabelText('Author')).toHaveValue('bob');
    expect(screen.getByLabelText('Repository')).toHaveValue('org/repo2');
    expect(screen.getByLabelText('Status')).toHaveValue('open');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
