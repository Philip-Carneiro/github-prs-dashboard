import type { CheckStatus, PRStatus, PullRequest, ReviewRelation } from '../types';

interface GitHubPR {
  id: number;
  number: number;
  title: string;
  html_url: string;
  user: { login: string } | null;
  state: string;
  pull_request?: { merged_at: string | null };
  created_at: string;
  updated_at: string;
}

interface GitHubCombinedStatus {
  state: 'success' | 'failure' | 'pending' | 'error';
}

interface GitHubReview {
  user: { login: string } | null;
  state: string;
  submitted_at: string;
}

interface GitHubRequestedReviewers {
  users: { login: string }[];
}

function resolvePRStatus(item: GitHubPR): PRStatus {
  if (item.pull_request?.merged_at) return 'merged';
  if (item.state === 'closed') return 'closed';
  return 'open';
}

function mapCheckState(state: string): CheckStatus {
  switch (state) {
    case 'success':
      return 'passed';
    case 'failure':
    case 'error':
      return 'failed';
    case 'pending':
      return 'pending';
    default:
      return 'none';
  }
}

function buildHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function extractPRNumber(prUrl: string): number | null {
  const match = prUrl.match(/\/pull\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export function extractRepoFromUrl(prUrl: string): string | null {
  const match = prUrl.match(/github\.com\/([^/]+\/[^/]+)\/pull/);
  return match ? match[1] : null;
}

async function fetchCommitStatus(
  repoFullName: string,
  prNumber: number,
  token?: string
): Promise<CheckStatus> {
  try {
    const headers = buildHeaders(token);

    const prResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`,
      { headers }
    );

    if (!prResponse.ok) return 'none';

    const prData = await prResponse.json();
    const headSha: string = prData.head?.sha;
    if (!headSha) return 'none';

    const statusResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/commits/${headSha}/status`,
      { headers }
    );

    if (!statusResponse.ok) return 'none';

    const statusData: GitHubCombinedStatus = await statusResponse.json();
    return mapCheckState(statusData.state);
  } catch {
    return 'none';
  }
}

export async function fetchReviewRelation(
  repoFullName: string,
  prNumber: number,
  myUsername: string,
  token?: string
): Promise<ReviewRelation> {
  try {
    const headers = buildHeaders(token);

    const reviewersResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/requested_reviewers`,
      { headers }
    );

    if (reviewersResponse.ok) {
      const reviewersData: GitHubRequestedReviewers = await reviewersResponse.json();
      const isRequested = reviewersData.users?.some(
        (u) => u.login.toLowerCase() === myUsername.toLowerCase()
      );
      if (isRequested) return 'needs_my_review';
    }

    const reviewsResponse = await fetch(
      `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/reviews`,
      { headers }
    );

    if (!reviewsResponse.ok) return 'not_involved';

    const reviews: GitHubReview[] = await reviewsResponse.json();
    const myReviews = reviews.filter(
      (r) => r.user?.login.toLowerCase() === myUsername.toLowerCase()
    );

    if (myReviews.length === 0) return 'not_involved';

    const latestReview = myReviews[myReviews.length - 1];
    if (latestReview.state === 'CHANGES_REQUESTED') return 'changes_requested_by_me';
    if (latestReview.state === 'APPROVED') return 'approved_by_me';

    return 'not_involved';
  } catch {
    return 'not_involved';
  }
}

export async function fetchPRsForRepo(
  repoFullName: string,
  authors: string[],
  token?: string,
  myUsername?: string
): Promise<PullRequest[]> {
  const allPRs: PullRequest[] = [];
  const headers = buildHeaders(token);

  for (const author of authors) {
    const url =
      `https://api.github.com/search/issues?q=` +
      encodeURIComponent(`repo:${repoFullName} type:pr author:${author}`) +
      `&per_page=100&sort=created&order=desc`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error(`GitHub API rate limit exceeded. Try again later.`);
      }
      throw new Error(`Failed to fetch PRs for ${repoFullName}: ${response.status}`);
    }

    const data = await response.json();
    const items: GitHubPR[] = data.items ?? [];

    const prsWithoutExtras: Omit<PullRequest, 'checkStatus' | 'reviewRelation'>[] = items.map(
      (item) => ({
        id: item.id,
        title: item.title,
        url: item.html_url,
        author: item.user?.login ?? 'unknown',
        repo: repoFullName,
        status: resolvePRStatus(item),
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })
    );

    const checkResults = await Promise.allSettled(
      prsWithoutExtras.map((pr) => {
        const prNumber = extractPRNumber(pr.url);
        if (!prNumber) return Promise.resolve('none' as CheckStatus);
        return fetchCommitStatus(repoFullName, prNumber, token);
      })
    );

    const reviewResults = await Promise.allSettled(
      prsWithoutExtras.map((pr) => {
        if (pr.status !== 'open' || !myUsername) {
          return Promise.resolve('not_involved' as ReviewRelation);
        }
        const prNumber = extractPRNumber(pr.url);
        if (!prNumber) return Promise.resolve('not_involved' as ReviewRelation);
        return fetchReviewRelation(repoFullName, prNumber, myUsername, token);
      })
    );

    const prs: PullRequest[] = prsWithoutExtras.map((pr, index) => ({
      ...pr,
      checkStatus: checkResults[index].status === 'fulfilled' ? checkResults[index].value : 'none',
      reviewRelation:
        reviewResults[index].status === 'fulfilled' ? reviewResults[index].value : 'not_involved',
    }));

    allPRs.push(...prs);
  }

  return allPRs;
}

export async function fetchAllPRs(
  repos: string[],
  authors: string[],
  token?: string,
  myUsername?: string
): Promise<PullRequest[]> {
  const results = await Promise.allSettled(
    repos.map((repo) => fetchPRsForRepo(repo, authors, token, myUsername))
  );

  const allPRs: PullRequest[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allPRs.push(...result.value);
    } else {
      errors.push(`${repos[index]}: ${result.reason}`);
    }
  });

  if (errors.length > 0 && allPRs.length === 0) {
    throw new Error(`All fetches failed:\n${errors.join('\n')}`);
  }

  return allPRs;
}
