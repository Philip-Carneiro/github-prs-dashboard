import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { PRTable } from '../components/PRTable';
import type { PullRequest } from '../types';

const mockPRs: PullRequest[] = [
  {
    id: 1,
    title: 'Fix critical bug',
    url: 'https://github.com/org/repo/pull/1',
    author: 'alice',
    repo: 'org/repo',
    status: 'open',
    checkStatus: 'passed',
    reviewRelation: 'not_involved',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 2,
    title: 'Add new feature',
    url: 'https://github.com/org/repo/pull/2',
    author: 'bob',
    repo: 'org/repo2',
    status: 'merged',
    checkStatus: 'failed',
    reviewRelation: 'not_involved',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
  },
];

describe('PRTable', () => {
  it('shows empty state when no PRs', () => {
    render(<PRTable pullRequests={[]} />);
    expect(screen.getByText(/no pull requests/i)).toBeInTheDocument();
  });

  it('renders table headers including Build, Updated, and Link', () => {
    render(<PRTable pullRequests={mockPRs} />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Repository')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
  });

  it('renders PR titles as links', () => {
    render(<PRTable pullRequests={mockPRs} />);
    const link = screen.getByText('Fix critical bug');
    expect(link.closest('a')).toHaveAttribute('href', 'https://github.com/org/repo/pull/1');
  });

  it('renders author names', () => {
    render(<PRTable pullRequests={mockPRs} />);
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('renders repo names', () => {
    render(<PRTable pullRequests={mockPRs} />);
    expect(screen.getByText('org/repo')).toBeInTheDocument();
    expect(screen.getByText('org/repo2')).toBeInTheDocument();
  });

  it('renders status badges', () => {
    render(<PRTable pullRequests={mockPRs} />);
    expect(screen.getByText('open')).toBeInTheDocument();
    expect(screen.getByText('merged')).toBeInTheDocument();
  });

  it('renders check status indicators', () => {
    render(<PRTable pullRequests={mockPRs} />);
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('sorts by Updated descending by default', () => {
    render(<PRTable pullRequests={mockPRs} />);
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Add new feature')).toBeInTheDocument();
  });

  it('toggles sort direction when clicking the active sort header', () => {
    render(<PRTable pullRequests={mockPRs} />);

    const updatedHeader = screen.getByText('Updated').closest('th')!;
    fireEvent.click(updatedHeader);

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Fix critical bug')).toBeInTheDocument();
  });

  it('switches sort field when clicking a different header', () => {
    render(<PRTable pullRequests={mockPRs} />);

    const createdHeader = screen.getByText('Created').closest('th')!;
    fireEvent.click(createdHeader);

    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Fix critical bug')).toBeInTheDocument();
  });

  it('sets aria-sort on sortable headers', () => {
    render(<PRTable pullRequests={mockPRs} />);

    const updatedHeader = screen.getByText('Updated').closest('th')!;
    const createdHeader = screen.getByText('Created').closest('th')!;

    expect(updatedHeader).toHaveAttribute('aria-sort', 'descending');
    expect(createdHeader).toHaveAttribute('aria-sort', 'none');
  });

  it('renders the Updated date in each row', () => {
    render(<PRTable pullRequests={mockPRs} />);
    expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 25, 2024')).toBeInTheDocument();
  });
});
