import { useMemo, useState } from 'react';
import type {
  BuildStatusFilter,
  FilterState,
  PRStatus,
  PullRequest,
  ReviewRelation,
} from '../types';
import { filterPRs, sortPRs } from '../utils/filterPRs';

interface UsePRFiltersReturn {
  filters: FilterState;
  filteredPRs: PullRequest[];
  setAuthorFilter: (author: string) => void;
  setRepoFilter: (repo: string) => void;
  setStatusFilter: (status: PRStatus | 'all') => void;
  toggleShowClosed: () => void;
  setReviewFilter: (review: ReviewRelation | 'all') => void;
  setBuildStatusFilter: (buildStatus: BuildStatusFilter) => void;
}

const INITIAL_FILTERS: FilterState = {
  author: 'all',
  repo: 'all',
  status: 'all',
  showClosed: false,
  reviewFilter: 'all',
  buildStatusFilter: 'all',
};

export function usePRFilters(pullRequests: PullRequest[]): UsePRFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const filteredPRs = useMemo(
    () => sortPRs(filterPRs(pullRequests, filters)),
    [pullRequests, filters]
  );

  const setAuthorFilter = (author: string) => setFilters((prev) => ({ ...prev, author }));

  const setRepoFilter = (repo: string) => setFilters((prev) => ({ ...prev, repo }));

  const setStatusFilter = (status: PRStatus | 'all') => setFilters((prev) => ({ ...prev, status }));

  const toggleShowClosed = () => setFilters((prev) => ({ ...prev, showClosed: !prev.showClosed }));

  const setReviewFilter = (review: ReviewRelation | 'all') =>
    setFilters((prev) => ({ ...prev, reviewFilter: review }));

  const setBuildStatusFilter = (buildStatus: BuildStatusFilter) =>
    setFilters((prev) => ({ ...prev, buildStatusFilter: buildStatus }));

  return {
    filters,
    filteredPRs,
    setAuthorFilter,
    setRepoFilter,
    setStatusFilter,
    toggleShowClosed,
    setReviewFilter,
    setBuildStatusFilter,
  };
}
