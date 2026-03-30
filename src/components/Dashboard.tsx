import { useCallback, useMemo } from 'react';
import type { AppConfig } from '../types';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
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
  const { pullRequests, isLoading, refreshStatus, refresh } = usePullRequests();
  const {
    filters,
    filteredPRs,
    setAuthorFilter,
    setRepoFilter,
    setStatusFilter,
    toggleShowClosed,
    setReviewFilter,
    setBuildStatusFilter,
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

  const handleRefresh = useCallback(() => {
    const repos = parseRepositories(config.repositories.join('\n'));
    const authors = parseAuthors(config.authors.join('\n'));
    const token = config.githubToken || undefined;
    const myUsername = config.myUsername || undefined;
    refresh(repos, authors, token, myUsername);
  }, [config, refresh]);

  useAutoRefresh(config.autoRefreshEnabled, 300_000, handleRefresh, isLoading);

  return (
    <div className="dashboard">
      <RefreshButton
        isLoading={isLoading}
        refreshStatus={refreshStatus}
        onRefresh={handleRefresh}
        autoRefreshEnabled={config.autoRefreshEnabled}
      />

      <PRFilters
        filters={filters}
        authors={uniqueAuthors}
        repos={uniqueRepos}
        myUsername={config.myUsername}
        onAuthorChange={setAuthorFilter}
        onRepoChange={setRepoFilter}
        onStatusChange={setStatusFilter}
        onToggleShowClosed={toggleShowClosed}
        onReviewFilterChange={setReviewFilter}
        onBuildStatusChange={setBuildStatusFilter}
      />

      <PRTable pullRequests={filteredPRs} />
    </div>
  );
}
