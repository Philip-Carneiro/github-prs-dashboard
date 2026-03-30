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

const MY_USERNAME_KEY = 'github-prs-dashboard:myUsername';
const AUTO_REFRESH_KEY = 'github-prs-dashboard:autoRefreshEnabled';

export async function loadConfig(): Promise<AppConfig> {
  const [dashboardTitle, authors, repositories, githubToken] = await Promise.all([
    loadDashboardTitle(),
    loadAuthors(),
    loadRepositories(),
    loadToken(),
  ]);

  const myUsername = localStorage.getItem(MY_USERNAME_KEY) ?? '';
  const autoRefreshEnabled = localStorage.getItem(AUTO_REFRESH_KEY) === 'true';

  return { dashboardTitle, authors, repositories, githubToken, myUsername, autoRefreshEnabled };
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await Promise.all([
    saveDashboardTitle(config.dashboardTitle),
    saveAuthors(config.authors),
    saveRepositories(config.repositories),
    saveToken(config.githubToken),
  ]);

  localStorage.setItem(MY_USERNAME_KEY, config.myUsername);
  localStorage.setItem(AUTO_REFRESH_KEY, String(config.autoRefreshEnabled));
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
