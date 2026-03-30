import { describe, it, expect } from 'vitest';
import { filterPRs, sortPRs } from '../utils/filterPRs';
import type { FilterState, PullRequest } from '../types';

const mockPRs: PullRequest[] = [
  {
    id: 1,
    title: 'Fix bug',
    url: 'https://github.com/org/repo/pull/1',
    author: 'alice',
    repo: 'org/repo',
    status: 'open',
    checkStatus: 'passed',
    reviewRelation: 'not_involved',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: 2,
    title: 'Add feature',
    url: 'https://github.com/org/repo/pull/2',
    author: 'bob',
    repo: 'org/repo',
    status: 'merged',
    checkStatus: 'passed',
    reviewRelation: 'not_involved',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 3,
    title: 'Refactor',
    url: 'https://github.com/org/repo2/pull/3',
    author: 'alice',
    repo: 'org/repo2',
    status: 'closed',
    checkStatus: 'failed',
    reviewRelation: 'not_involved',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-21T10:00:00Z',
  },
  {
    id: 4,
    title: 'Update docs',
    url: 'https://github.com/org/repo/pull/4',
    author: 'bob',
    repo: 'org/repo',
    status: 'open',
    checkStatus: 'pending',
    reviewRelation: 'needs_my_review',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-26T10:00:00Z',
  },
];

describe('filterPRs', () => {
  it('returns only open PRs when showClosed is false', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'all',
      status: 'all',
      showClosed: false,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(2);
    expect(result.every((pr) => pr.status === 'open')).toBe(true);
  });

  it('returns all PRs when showClosed is true', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(4);
  });

  it('filters by author', () => {
    const filters: FilterState = {
      author: 'alice',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(2);
    expect(result.every((pr) => pr.author === 'alice')).toBe(true);
  });

  it('filters by author case-insensitively', () => {
    const filters: FilterState = {
      author: 'Alice',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(2);
  });

  it('filters by repository', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'org/repo2',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(1);
    expect(result[0].repo).toBe('org/repo2');
  });

  it('filters by status', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'all',
      status: 'merged',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('merged');
  });

  it('combines author, repo and status filters', () => {
    const filters: FilterState = {
      author: 'bob',
      repo: 'org/repo',
      status: 'open',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Update docs');
  });

  it('returns empty array when no PRs match', () => {
    const filters: FilterState = {
      author: 'nonexistent',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(0);
  });

  it('filters by reviewRelation', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'all',
      status: 'all',
      showClosed: false,
      reviewFilter: 'needs_my_review',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Update docs');
  });

  it('shows all review relations when reviewFilter is all', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'all',
      status: 'all',
      showClosed: false,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(2);
  });

  it('filters by build status passed', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'passed',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(2);
    expect(result.every((pr) => pr.checkStatus === 'passed')).toBe(true);
  });

  it('filters by build status failed', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'failed',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(1);
    expect(result[0].checkStatus).toBe('failed');
  });

  it('filters by build status pending', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'pending',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(1);
    expect(result[0].checkStatus).toBe('pending');
    expect(result[0].title).toBe('Update docs');
  });

  it('does not filter by build status when set to all', () => {
    const filters: FilterState = {
      author: 'all',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'all',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(4);
  });

  it('combines build status filter with other filters', () => {
    const filters: FilterState = {
      author: 'alice',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'passed',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Fix bug');
  });

  it('combines pending build status filter with author filter', () => {
    const filters: FilterState = {
      author: 'bob',
      repo: 'all',
      status: 'all',
      showClosed: true,
      reviewFilter: 'all',
      buildStatusFilter: 'pending',
    };
    const result = filterPRs(mockPRs, filters);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Update docs');
  });
});

describe('sortPRs', () => {
  it('puts open PRs before closed/merged', () => {
    const result = sortPRs(mockPRs);
    expect(result[0].status).toBe('open');
    expect(result[1].status).toBe('open');
  });

  it('sorts by date within same status group (newest first)', () => {
    const result = sortPRs(mockPRs);
    const openPRs = result.filter((pr) => pr.status === 'open');
    expect(openPRs[0].title).toBe('Update docs');
    expect(openPRs[1].title).toBe('Fix bug');
  });

  it('does not mutate original array', () => {
    const original = [...mockPRs];
    sortPRs(mockPRs);
    expect(mockPRs).toEqual(original);
  });
});
