import type { AppConfig, CachedData, PullRequest } from '../types';
import {
  loadAuthors,
  loadDashboardTitle,
  loadPullRequests,
  loadRepositories,
  loadToken,
  saveAuthors,
  saveDashboardTitle,
  savePullRequests,
  saveRepositories,
  saveToken,
} from '../services/localApi';

export async function loadConfig(): Promise<AppConfig> {
  const [dashboardTitle, authors, repositories, githubToken] = await Promise.all([
    loadDashboardTitle(),
    loadAuthors(),
    loadRepositories(),
    loadToken(),
  ]);

  return { dashboardTitle, authors, repositories, githubToken };
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await Promise.all([
    saveDashboardTitle(config.dashboardTitle),
    saveAuthors(config.authors),
    saveRepositories(config.repositories),
    saveToken(config.githubToken),
  ]);
}

export async function loadCachedData(): Promise<CachedData> {
  const data = await loadPullRequests();
  if (!data) {
    return { pullRequests: [], lastRefresh: null };
  }
  return {
    pullRequests: data.pullRequests as PullRequest[],
    lastRefresh: data.lastRefresh,
  };
}

export async function saveCachedData(cached: CachedData): Promise<void> {
  await savePullRequests(cached.pullRequests, cached.lastRefresh);
}
