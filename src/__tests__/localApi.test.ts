import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadAuthors,
  saveAuthors,
  loadRepositories,
  saveRepositories,
  loadToken,
  saveToken,
  loadPullRequests,
  savePullRequests,
} from '../services/localApi';

describe('localApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadAuthors', () => {
    it('returns authors from API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            authors: ['alice', 'bob'],
            updatedAt: '2024-01-01T00:00:00Z',
          }),
      } as Response);

      const result = await loadAuthors();
      expect(result).toEqual(['alice', 'bob']);
    });

    it('returns empty array on fetch failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await loadAuthors();
      expect(result).toEqual([]);
    });

    it('returns empty array on network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await loadAuthors();
      expect(result).toEqual([]);
    });
  });

  describe('saveAuthors', () => {
    it('sends PUT request with authors', async () => {
      const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            authors: ['alice'],
            updatedAt: '2024-01-01T00:00:00Z',
          }),
      } as Response);

      await saveAuthors(['alice']);

      expect(mockFetch).toHaveBeenCalledWith('/api/authors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authors: ['alice'] }),
      });
    });
  });

  describe('loadRepositories', () => {
    it('returns repositories from API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            repositories: ['org/repo'],
            updatedAt: '2024-01-01T00:00:00Z',
          }),
      } as Response);

      const result = await loadRepositories();
      expect(result).toEqual(['org/repo']);
    });
  });

  describe('saveRepositories', () => {
    it('sends PUT request with repositories', async () => {
      const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await saveRepositories(['org/repo']);

      expect(mockFetch).toHaveBeenCalledWith('/api/repositories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositories: ['org/repo'] }),
      });
    });
  });

  describe('loadToken', () => {
    it('returns token from API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ githubToken: 'ghp_test' }),
      } as Response);

      const result = await loadToken();
      expect(result).toBe('ghp_test');
    });

    it('returns empty string when not found', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await loadToken();
      expect(result).toBe('');
    });
  });

  describe('saveToken', () => {
    it('sends PUT request with token', async () => {
      const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await saveToken('ghp_token');

      expect(mockFetch).toHaveBeenCalledWith('/api/token', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubToken: 'ghp_token' }),
      });
    });
  });

  describe('loadPullRequests', () => {
    it('returns cached PR data from API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            pullRequests: [{ id: 1 }],
            lastRefresh: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          }),
      } as Response);

      const result = await loadPullRequests();
      expect(result?.pullRequests).toHaveLength(1);
      expect(result?.lastRefresh).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('savePullRequests', () => {
    it('sends PUT request with PR data', async () => {
      const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await savePullRequests([{ id: 1 }], '2024-01-01T00:00:00Z');

      expect(mockFetch).toHaveBeenCalledWith('/api/pull-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pullRequests: [{ id: 1 }],
          lastRefresh: '2024-01-01T00:00:00Z',
        }),
      });
    });
  });
});
