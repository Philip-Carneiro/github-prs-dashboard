export type PRStatus = 'open' | 'closed' | 'merged';

export type CheckStatus = 'passed' | 'failed' | 'pending' | 'none';

export interface PullRequest {
  id: number;
  title: string;
  url: string;
  author: string;
  repo: string;
  status: PRStatus;
  checkStatus: CheckStatus;
  createdAt: string;
}

export interface AppConfig {
  dashboardTitle: string;
  repositories: string[];
  authors: string[];
  githubToken: string;
}

export interface FilterState {
  author: string;
  repo: string;
  status: PRStatus | 'all';
  showClosed: boolean;
}

export interface CachedData {
  pullRequests: PullRequest[];
  lastRefresh: string | null;
}
