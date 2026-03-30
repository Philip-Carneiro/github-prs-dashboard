import { useCallback, useState } from 'react';
import { fetchAllPRs } from '../services/githubApi';
import type { PullRequest, RefreshStatus } from '../types';
import { useCachedData } from './useLocalStorage';

interface UsePullRequestsReturn {
  pullRequests: PullRequest[];
  isLoading: boolean;
  refreshStatus: RefreshStatus;
  refresh: (
    repos: string[],
    authors: string[],
    token?: string,
    myUsername?: string
  ) => Promise<void>;
}

export function usePullRequests(): UsePullRequestsReturn {
  const { cachedData, setCachedData } = useCachedData();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>(() => ({
    lastSuccessfulRefresh: cachedData.lastRefresh,
    lastFailedAttempt: null,
    error: null,
  }));

  const refresh = useCallback(
    async (repos: string[], authors: string[], token?: string, myUsername?: string) => {
      if (repos.length === 0 || authors.length === 0) {
        setRefreshStatus((prev) => ({
          ...prev,
          lastFailedAttempt: new Date().toISOString(),
          error: 'Please configure repositories and authors first.',
        }));
        return;
      }

      setIsLoading(true);

      try {
        const pullRequests = await fetchAllPRs(repos, authors, token, myUsername);
        const now = new Date().toISOString();
        setCachedData({ pullRequests, lastRefresh: now });
        setRefreshStatus({
          lastSuccessfulRefresh: now,
          lastFailedAttempt: null,
          error: null,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setRefreshStatus((prev) => ({
          ...prev,
          lastFailedAttempt: new Date().toISOString(),
          error: errorMessage,
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [setCachedData]
  );

  return {
    pullRequests: cachedData.pullRequests,
    isLoading,
    refreshStatus,
    refresh,
  };
}
