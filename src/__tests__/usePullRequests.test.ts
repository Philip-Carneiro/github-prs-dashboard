import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePullRequests } from '../hooks/usePullRequests';

vi.mock('../services/githubApi', () => ({
  fetchAllPRs: vi.fn(),
}));

vi.mock('../hooks/useLocalStorage', () => {
  let data = { pullRequests: [], lastRefresh: null };
  return {
    useCachedData: () => ({
      cachedData: data,
      setCachedData: vi.fn((newData) => {
        data = newData;
      }),
    }),
  };
});

import { fetchAllPRs } from '../services/githubApi';

const mockFetchAllPRs = vi.mocked(fetchAllPRs);

const MOCK_PR = {
  id: 1,
  title: 'Test PR',
  url: 'https://github.com/org/repo/pull/1',
  author: 'alice',
  repo: 'org/repo',
  status: 'open' as const,
  checkStatus: 'passed' as const,
  reviewRelation: 'not_involved' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

describe('usePullRequests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  it('should set error when repos or authors are empty', async () => {
    const { result } = renderHook(() => usePullRequests());

    await act(async () => {
      await result.current.refresh([], [], 'token');
    });

    expect(result.current.refreshStatus.error).toBe(
      'Please configure repositories and authors first.'
    );
    expect(result.current.refreshStatus.lastFailedAttempt).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should update refreshStatus on successful fetch', async () => {
    mockFetchAllPRs.mockResolvedValue([MOCK_PR]);
    const { result } = renderHook(() => usePullRequests());

    await act(async () => {
      await result.current.refresh(['org/repo'], ['alice'], 'token');
    });

    expect(result.current.refreshStatus.lastSuccessfulRefresh).not.toBeNull();
    expect(result.current.refreshStatus.error).toBeNull();
    expect(result.current.refreshStatus.lastFailedAttempt).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should preserve previous data and set error on fetch failure', async () => {
    mockFetchAllPRs.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => usePullRequests());

    await act(async () => {
      await result.current.refresh(['org/repo'], ['alice'], 'token');
    });

    expect(result.current.refreshStatus.error).toBe('Network error');
    expect(result.current.refreshStatus.lastFailedAttempt).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should keep lastSuccessfulRefresh unchanged on failure', async () => {
    mockFetchAllPRs.mockResolvedValue([MOCK_PR]);
    const { result } = renderHook(() => usePullRequests());

    await act(async () => {
      await result.current.refresh(['org/repo'], ['alice'], 'token');
    });

    const successTime = result.current.refreshStatus.lastSuccessfulRefresh;

    mockFetchAllPRs.mockRejectedValue(new Error('Connection timeout'));

    await act(async () => {
      await result.current.refresh(['org/repo'], ['alice'], 'token');
    });

    expect(result.current.refreshStatus.lastSuccessfulRefresh).toBe(successTime);
    expect(result.current.refreshStatus.error).toBe('Connection timeout');
    expect(result.current.refreshStatus.lastFailedAttempt).not.toBeNull();
  });

  it('should clear error on next successful refresh', async () => {
    mockFetchAllPRs.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => usePullRequests());

    await act(async () => {
      await result.current.refresh(['org/repo'], ['alice'], 'token');
    });

    expect(result.current.refreshStatus.error).toBe('Network error');

    mockFetchAllPRs.mockResolvedValue([MOCK_PR]);

    await act(async () => {
      await result.current.refresh(['org/repo'], ['alice'], 'token');
    });

    expect(result.current.refreshStatus.error).toBeNull();
    expect(result.current.refreshStatus.lastFailedAttempt).toBeNull();
  });

  it('should handle non-Error thrown values', async () => {
    mockFetchAllPRs.mockRejectedValue('string error');
    const { result } = renderHook(() => usePullRequests());

    await act(async () => {
      await result.current.refresh(['org/repo'], ['alice'], 'token');
    });

    expect(result.current.refreshStatus.error).toBe('An unknown error occurred');
  });
});
