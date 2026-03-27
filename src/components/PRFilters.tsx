import type { FilterState, PRStatus } from '../types';

interface PRFiltersProps {
  filters: FilterState;
  authors: string[];
  repos: string[];
  onAuthorChange: (author: string) => void;
  onRepoChange: (repo: string) => void;
  onStatusChange: (status: PRStatus | 'all') => void;
  onToggleShowClosed: () => void;
}

export function PRFilters({
  filters,
  authors,
  repos,
  onAuthorChange,
  onRepoChange,
  onStatusChange,
  onToggleShowClosed,
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
          onChange={(e) =>
            onStatusChange(e.target.value as PRStatus | 'all')
          }
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="merged">Merged</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.showClosed}
            onChange={onToggleShowClosed}
          />
          Show closed/merged
        </label>
      </div>
    </div>
  );
}
