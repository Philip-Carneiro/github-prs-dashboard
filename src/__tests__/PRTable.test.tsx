import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    title: 'Add new feature',
    url: 'https://github.com/org/repo/pull/2',
    author: 'bob',
    repo: 'org/repo2',
    status: 'merged',
    checkStatus: 'failed',
    createdAt: '2024-01-10T10:00:00Z',
  },
];

describe('PRTable', () => {
  it('shows empty state when no PRs', () => {
    render(<PRTable pullRequests={[]} />);
    expect(screen.getByText(/no pull requests/i)).toBeInTheDocument();
  });

  it('renders table headers including Build', () => {
    render(<PRTable pullRequests={mockPRs} />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Repository')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('renders PR titles as links', () => {
    render(<PRTable pullRequests={mockPRs} />);
    const link = screen.getByText('Fix critical bug');
    expect(link.closest('a')).toHaveAttribute(
      'href',
      'https://github.com/org/repo/pull/1',
    );
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
});
