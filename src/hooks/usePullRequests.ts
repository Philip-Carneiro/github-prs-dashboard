import { useCallback, useState } from 'react';
import { fetchAllPRs } from '../services/githubApi';
import type { PullRequest } from '../types';
import { useCachedData } from './useLocalStorage';

interface UsePullRequestsReturn {
  pullRequests: PullRequest[];
  lastRefresh: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: (repos: string[], authors: string[], token?: string) => Promise<void>;
}

export function usePullRequests(): UsePullRequestsReturn {
  const { cachedData, setCachedData } = useCachedData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (repos: string[], authors: string[], token?: string) => {
      if (repos.length === 0 || authors.length === 0) {
        setError('Please configure repositories and authors first.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const pullRequests = await fetchAllPRs(repos, authors, token);
        setCachedData({
          pullRequests,
          lastRefresh: new Date().toISOString(),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setCachedData],
  );

  return {
    pullRequests: cachedData.pullRequests,
    lastRefresh: cachedData.lastRefresh,
    isLoading,
    error,
    refresh,
  };
}
