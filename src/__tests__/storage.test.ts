import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AppConfig, CachedData } from '../types';

vi.mock('../services/localApi', () => ({
  loadDashboardTitle: vi.fn(),
  saveDashboardTitle: vi.fn(),
  loadAuthors: vi.fn(),
  saveAuthors: vi.fn(),
  loadRepositories: vi.fn(),
  saveRepositories: vi.fn(),
  loadToken: vi.fn(),
  saveToken: vi.fn(),
  loadPullRequests: vi.fn(),
  savePullRequests: vi.fn(),
}));

import {
  loadDashboardTitle,
  saveDashboardTitle,
  loadAuthors,
  saveAuthors,
  loadRepositories,
  saveRepositories,
  loadToken,
  saveToken,
  loadPullRequests,
  savePullRequests,
} from '../services/localApi';

import { loadConfig, saveConfig, loadCachedData, saveCachedData } from '../utils/storage';

const mockedLoadDashboardTitle = vi.mocked(loadDashboardTitle);
const mockedSaveDashboardTitle = vi.mocked(saveDashboardTitle);
const mockedLoadAuthors = vi.mocked(loadAuthors);
const mockedLoadRepositories = vi.mocked(loadRepositories);
const mockedLoadToken = vi.mocked(loadToken);
const mockedSaveAuthors = vi.mocked(saveAuthors);
const mockedSaveRepositories = vi.mocked(saveRepositories);
const mockedSaveToken = vi.mocked(saveToken);
const mockedLoadPullRequests = vi.mocked(loadPullRequests);
const mockedSavePullRequests = vi.mocked(savePullRequests);

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('storage utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('loadConfig', () => {
    it('loads config from all sources including localStorage', async () => {
      mockedLoadDashboardTitle.mockResolvedValue('My Team');
      mockedLoadAuthors.mockResolvedValue(['alice', 'bob']);
      mockedLoadRepositories.mockResolvedValue(['org/repo']);
      mockedLoadToken.mockResolvedValue('ghp_test');
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'github-prs-dashboard:myUsername') return 'alice';
        if (key === 'github-prs-dashboard:autoRefreshEnabled') return 'true';
        return null;
      });

      const config = await loadConfig();

      expect(config).toEqual({
        dashboardTitle: 'My Team',
        authors: ['alice', 'bob'],
        repositories: ['org/repo'],
        githubToken: 'ghp_test',
        myUsername: 'alice',
        autoRefreshEnabled: true,
      });
    });

    it('returns empty defaults when no data exists', async () => {
      mockedLoadDashboardTitle.mockResolvedValue('');
      mockedLoadAuthors.mockResolvedValue([]);
      mockedLoadRepositories.mockResolvedValue([]);
      mockedLoadToken.mockResolvedValue('');
      localStorageMock.getItem.mockReturnValue(null);

      const config = await loadConfig();

      expect(config).toEqual({
        dashboardTitle: '',
        authors: [],
        repositories: [],
        githubToken: '',
        myUsername: '',
        autoRefreshEnabled: false,
      });
    });
  });

  describe('saveConfig', () => {
    it('saves config to all destinations including localStorage', async () => {
      const config: AppConfig = {
        dashboardTitle: 'My Team',
        authors: ['alice'],
        repositories: ['org/repo'],
        githubToken: 'ghp_token',
        myUsername: 'alice',
        autoRefreshEnabled: true,
      };

      mockedSaveDashboardTitle.mockResolvedValue();
      mockedSaveAuthors.mockResolvedValue();
      mockedSaveRepositories.mockResolvedValue();
      mockedSaveToken.mockResolvedValue();

      await saveConfig(config);

      expect(mockedSaveDashboardTitle).toHaveBeenCalledWith('My Team');
      expect(mockedSaveAuthors).toHaveBeenCalledWith(['alice']);
      expect(mockedSaveRepositories).toHaveBeenCalledWith(['org/repo']);
      expect(mockedSaveToken).toHaveBeenCalledWith('ghp_token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'github-prs-dashboard:myUsername',
        'alice'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'github-prs-dashboard:autoRefreshEnabled',
        'true'
      );
    });
  });

  describe('loadCachedData', () => {
    it('loads cached pull requests', async () => {
      mockedLoadPullRequests.mockResolvedValue({
        pullRequests: [{ id: 1, title: 'PR' }],
        lastRefresh: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const data = await loadCachedData();

      expect(data.pullRequests).toHaveLength(1);
      expect(data.lastRefresh).toBe('2024-01-01T00:00:00Z');
    });

    it('returns empty defaults when no cached data', async () => {
      mockedLoadPullRequests.mockResolvedValue(null);

      const data = await loadCachedData();

      expect(data).toEqual({ pullRequests: [], lastRefresh: null });
    });
  });

  describe('saveCachedData', () => {
    it('saves pull requests data', async () => {
      const cached: CachedData = {
        pullRequests: [],
        lastRefresh: '2024-01-01T00:00:00Z',
      };

      mockedSavePullRequests.mockResolvedValue();

      await saveCachedData(cached);

      expect(mockedSavePullRequests).toHaveBeenCalledWith([], '2024-01-01T00:00:00Z');
    });
  });
});
