export type PRStatus = 'open' | 'closed' | 'merged';

export type CheckStatus = 'passed' | 'failed' | 'pending' | 'none';

export type ReviewRelation =
  | 'needs_my_review'
  | 'changes_requested_by_me'
  | 'approved_by_me'
  | 'not_involved';

export type BuildStatusFilter = 'all' | 'passed' | 'failed' | 'pending';

export type SortField = 'created' | 'updated';
export type SortDirection = 'asc' | 'desc';

export interface PullRequest {
  id: number;
  title: string;
  url: string;
  author: string;
  repo: string;
  status: PRStatus;
  checkStatus: CheckStatus;
  reviewRelation: ReviewRelation;
  createdAt: string;
  updatedAt: string;
}

export interface AppConfig {
  dashboardTitle: string;
  repositories: string[];
  authors: string[];
  githubToken: string;
  myUsername: string;
  autoRefreshEnabled: boolean;
}

export interface FilterState {
  author: string;
  repo: string;
  status: PRStatus | 'all';
  showClosed: boolean;
  reviewFilter: ReviewRelation | 'all';
  buildStatusFilter: BuildStatusFilter;
}

export interface RefreshStatus {
  lastSuccessfulRefresh: string | null;
  lastFailedAttempt: string | null;
  error: string | null;
}

export interface CachedData {
  pullRequests: PullRequest[];
  lastRefresh: string | null;
}
