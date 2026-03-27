import { useMemo } from 'react';
import type { AppConfig } from '../types';
import { usePRFilters } from '../hooks/usePRFilters';
import { usePullRequests } from '../hooks/usePullRequests';
import { parseAuthors, parseRepositories } from '../utils/parseConfig';
import { PRFilters } from './PRFilters';
import { PRTable } from './PRTable';
import { RefreshButton } from './RefreshButton';

interface DashboardProps {
  config: AppConfig;
}

export function Dashboard({ config }: DashboardProps) {
  const { pullRequests, lastRefresh, isLoading, error, refresh } =
    usePullRequests();
  const {
    filters,
    filteredPRs,
    setAuthorFilter,
    setRepoFilter,
    setStatusFilter,
    toggleShowClosed,
  } = usePRFilters(pullRequests);

  const uniqueAuthors = useMemo(() => {
    const fromPRs = pullRequests.map((pr) => pr.author);
    const fromConfig = config.authors;
    return [...new Set([...fromConfig, ...fromPRs])].sort();
  }, [pullRequests, config.authors]);

  const uniqueRepos = useMemo(() => {
    const fromPRs = pullRequests.map((pr) => pr.repo);
    const fromConfig = parseRepositories(config.repositories.join('\n'));
    return [...new Set([...fromConfig, ...fromPRs])].sort();
  }, [pullRequests, config.repositories]);

  const handleRefresh = () => {
    const repos = parseRepositories(config.repositories.join('\n'));
    const authors = parseAuthors(config.authors.join('\n'));
    const token = config.githubToken || undefined;
    refresh(repos, authors, token);
  };

  return (
    <div className="dashboard">
      <RefreshButton
        isLoading={isLoading}
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
      />

      {error && <div className="error-message">{error}</div>}

      <PRFilters
        filters={filters}
        authors={uniqueAuthors}
        repos={uniqueRepos}
        onAuthorChange={setAuthorFilter}
        onRepoChange={setRepoFilter}
        onStatusChange={setStatusFilter}
        onToggleShowClosed={toggleShowClosed}
      />

      <PRTable pullRequests={filteredPRs} />
    </div>
  );
}
