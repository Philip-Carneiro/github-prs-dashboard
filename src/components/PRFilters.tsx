import type { BuildStatusFilter, FilterState, PRStatus, ReviewRelation } from '../types';

interface PRFiltersProps {
  filters: FilterState;
  authors: string[];
  repos: string[];
  myUsername: string;
  onAuthorChange: (author: string) => void;
  onRepoChange: (repo: string) => void;
  onStatusChange: (status: PRStatus | 'all') => void;
  onToggleShowClosed: () => void;
  onReviewFilterChange: (review: ReviewRelation | 'all') => void;
  onBuildStatusChange: (buildStatus: BuildStatusFilter) => void;
}

export function PRFilters({
  filters,
  authors,
  repos,
  myUsername,
  onAuthorChange,
  onRepoChange,
  onStatusChange,
  onToggleShowClosed,
  onReviewFilterChange,
  onBuildStatusChange,
}: PRFiltersProps) {
  return (
    <div className="pr-filters">
      <div className="filter-group">
        <label htmlFor="author-filter">Author</label>
        <select
          id="author-filter"
          value={filters.author}
          onChange={(e) => onAuthorChange(e.target.value)}
        >
          <option value="all">All authors</option>
          {authors.map((author) => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="repo-filter">Repository</label>
        <select
          id="repo-filter"
          value={filters.repo}
          onChange={(e) => onRepoChange(e.target.value)}
        >
          <option value="all">All repositories</option>
          {repos.map((repo) => (
            <option key={repo} value={repo}>
              {repo}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) => onStatusChange(e.target.value as PRStatus | 'all')}
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="merged">Merged</option>
        </select>
      </div>

      {myUsername && (
        <div className="filter-group">
          <label htmlFor="review-filter">Review</label>
          <select
            id="review-filter"
            value={filters.reviewFilter}
            onChange={(e) => onReviewFilterChange(e.target.value as ReviewRelation | 'all')}
          >
            <option value="all">All PRs</option>
            <option value="needs_my_review">Needs my review</option>
            <option value="changes_requested_by_me">I requested changes</option>
            <option value="approved_by_me">I approved</option>
          </select>
        </div>
      )}

      <div className="filter-group">
        <label htmlFor="build-status-filter">Build Status</label>
        <select
          id="build-status-filter"
          value={filters.buildStatusFilter}
          onChange={(e) => onBuildStatusChange(e.target.value as BuildStatusFilter)}
        >
          <option value="all">All</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="checkbox-label">
          <input type="checkbox" checked={filters.showClosed} onChange={onToggleShowClosed} />
          Show closed/merged
        </label>
      </div>
    </div>
  );
}
