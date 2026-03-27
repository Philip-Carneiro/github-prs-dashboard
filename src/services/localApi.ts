interface DashboardFile {
  dashboardTitle: string;
  updatedAt: string;
}

interface AuthorsFile {
  authors: string[];
  updatedAt: string;
}

interface RepositoriesFile {
  repositories: string[];
  updatedAt: string;
}

interface TokenResponse {
  githubToken: string;
}

interface PullRequestsFile {
  pullRequests: unknown[];
  lastRefresh: string | null;
  updatedAt: string;
}

async function apiGet<T>(resource: string): Promise<T | null> {
  try {
    const response = await fetch(`/api/${resource}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.error) return null;
    return data as T;
  } catch {
    return null;
  }
}

async function apiPut<T>(resource: string, data: T): Promise<T> {
  const response = await fetch(`/api/${resource}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function loadDashboardTitle(): Promise<string> {
  const data = await apiGet<DashboardFile>('dashboard');
  return data?.dashboardTitle ?? '';
}

export async function saveDashboardTitle(dashboardTitle: string): Promise<void> {
  await apiPut('dashboard', { dashboardTitle });
}

export async function loadAuthors(): Promise<string[]> {
  const data = await apiGet<AuthorsFile>('authors');
  return data?.authors ?? [];
}

export async function saveAuthors(authors: string[]): Promise<void> {
  await apiPut('authors', { authors });
}

export async function loadRepositories(): Promise<string[]> {
  const data = await apiGet<RepositoriesFile>('repositories');
  return data?.repositories ?? [];
}

export async function saveRepositories(repositories: string[]): Promise<void> {
  await apiPut('repositories', { repositories });
}

export async function loadToken(): Promise<string> {
  const data = await apiGet<TokenResponse>('token');
  return data?.githubToken ?? '';
}

export async function saveToken(githubToken: string): Promise<void> {
  await apiPut('token', { githubToken });
}

export async function loadPullRequests(): Promise<PullRequestsFile | null> {
  return apiGet<PullRequestsFile>('pull-requests');
}

export async function savePullRequests(
  pullRequests: unknown[],
  lastRefresh: string | null,
): Promise<void> {
  await apiPut('pull-requests', { pullRequests, lastRefresh });
}
