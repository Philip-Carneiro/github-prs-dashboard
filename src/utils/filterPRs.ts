import type { FilterState, PullRequest } from '../types';

export function filterPRs(pullRequests: PullRequest[], filters: FilterState): PullRequest[] {
  return pullRequests.filter((pr) => {
    if (filters.author !== 'all' && pr.author.toLowerCase() !== filters.author.toLowerCase()) {
      return false;
    }

    if (filters.repo !== 'all' && pr.repo !== filters.repo) {
      return false;
    }

    if (filters.status !== 'all' && pr.status !== filters.status) {
      return false;
    }

    if (!filters.showClosed && pr.status !== 'open') {
      return false;
    }

    if (filters.reviewFilter !== 'all' && pr.reviewRelation !== filters.reviewFilter) {
      return false;
    }

    if (filters.buildStatusFilter === 'passed' && pr.checkStatus !== 'passed') {
      return false;
    }

    if (filters.buildStatusFilter === 'failed' && pr.checkStatus !== 'failed') {
      return false;
    }

    if (filters.buildStatusFilter === 'pending' && pr.checkStatus !== 'pending') {
      return false;
    }

    return true;
  });
}

export function sortPRs(pullRequests: PullRequest[]): PullRequest[] {
  return [...pullRequests].sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (a.status !== 'open' && b.status === 'open') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
