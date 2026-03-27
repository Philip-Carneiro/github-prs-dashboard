import { useMemo, useState } from 'react';
import type { FilterState, PRStatus, PullRequest } from '../types';
import { filterPRs, sortPRs } from '../utils/filterPRs';

interface UsePRFiltersReturn {
  filters: FilterState;
  filteredPRs: PullRequest[];
  setAuthorFilter: (author: string) => void;
  setRepoFilter: (repo: string) => void;
  setStatusFilter: (status: PRStatus | 'all') => void;
  toggleShowClosed: () => void;
}

const INITIAL_FILTERS: FilterState = {
  author: 'all',
  repo: 'all',
  status: 'all',
  showClosed: false,
};

export function usePRFilters(
  pullRequests: PullRequest[],
): UsePRFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const filteredPRs = useMemo(
    () => sortPRs(filterPRs(pullRequests, filters)),
    [pullRequests, filters],
  );

  const setAuthorFilter = (author: string) =>
    setFilters((prev) => ({ ...prev, author }));

  const setRepoFilter = (repo: string) =>
    setFilters((prev) => ({ ...prev, repo }));

  const setStatusFilter = (status: PRStatus | 'all') =>
    setFilters((prev) => ({ ...prev, status }));

  const toggleShowClosed = () =>
    setFilters((prev) => ({ ...prev, showClosed: !prev.showClosed }));

  return {
    filters,
    filteredPRs,
    setAuthorFilter,
    setRepoFilter,
    setStatusFilter,
    toggleShowClosed,
  };
}
