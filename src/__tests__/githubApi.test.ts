import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchPRsForRepo,
  fetchAllPRs,
  extractPRNumber,
  extractRepoFromUrl,
} from '../services/githubApi';

const mockPRDetailResponse = {
  head: { sha: 'abc123' },
};

const mockStatusResponse = {
  state: 'success',
};

const mockGitHubResponse = {
  items: [
    {
      id: 1,
      title: 'Fix bug',
      html_url: 'https://github.com/org/repo/pull/1',
      user: { login: 'alice' },
      state: 'open',
      pull_request: { merged_at: null },
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      title: 'Add feature',
      html_url: 'https://github.com/org/repo/pull/2',
      user: { login: 'alice' },
      state: 'closed',
      pull_request: { merged_at: '2024-01-12T10:00:00Z' },
      created_at: '2024-01-10T10:00:00Z',
    },
    {
      id: 3,
      title: 'Update docs',
      html_url: 'https://github.com/org/repo/pull/3',
      user: { login: 'alice' },
      state: 'closed',
      pull_request: { merged_at: null },
      created_at: '2024-01-05T10:00:00Z',
    },
  ],
};

function mockFetchForSearchAndStatus() {
  vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
    const urlStr = String(url);
    if (urlStr.includes('search/issues')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGitHubResponse),
      } as Response);
    }
    if (urlStr.includes('/pulls/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPRDetailResponse),
      } as Response);
    }
    if (urlStr.includes('/status')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStatusResponse),
      } as Response);
    }
    return Promise.resolve({ ok: false, status: 404 } as Response);
  });
}

describe('extractPRNumber', () => {
  it('extracts PR number from URL', () => {
    expect(
      extractPRNumber('https://github.com/org/repo/pull/42'),
    ).toBe(42);
  });

  it('returns null for invalid URL', () => {
    expect(extractPRNumber('https://github.com/org/repo')).toBeNull();
  });
});

describe('extractRepoFromUrl', () => {
  it('extracts repo from PR URL', () => {
    expect(
      extractRepoFromUrl('https://github.com/org/repo/pull/42'),
    ).toBe('org/repo');
  });

  it('returns null for non-PR URL', () => {
    expect(extractRepoFromUrl('https://example.com')).toBeNull();
  });
});

describe('fetchPRsForRepo', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches PRs with check status', async () => {
    mockFetchForSearchAndStatus();

    const result = await fetchPRsForRepo('org/repo', ['alice']);

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      id: 1,
      title: 'Fix bug',
      author: 'alice',
      repo: 'org/repo',
      status: 'open',
      checkStatus: 'passed',
    });
    expect(result[1].status).toBe('merged');
    expect(result[2].status).toBe('closed');
  });

  it('sets checkStatus to none when status API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('search/issues')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [mockGitHubResponse.items[0]],
            }),
        } as Response);
      }
      return Promise.resolve({ ok: false, status: 500 } as Response);
    });

    const result = await fetchPRsForRepo('org/repo', ['alice']);
    expect(result[0].checkStatus).toBe('none');
  });

  it('throws on rate limit (403)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
    } as Response);

    await expect(fetchPRsForRepo('org/repo', ['alice'])).rejects.toThrow(
      'rate limit',
    );
  });

  it('throws on other HTTP errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(fetchPRsForRepo('org/repo', ['alice'])).rejects.toThrow(
      '500',
    );
  });

  it('handles null user gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('search/issues')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                {
                  id: 99,
                  title: 'PR with null user',
                  html_url: 'https://github.com/org/repo/pull/99',
                  user: null,
                  state: 'open',
                  pull_request: { merged_at: null },
                  created_at: '2024-01-01T00:00:00Z',
                },
              ],
            }),
        } as Response);
      }
      if (urlStr.includes('/pulls/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPRDetailResponse),
        } as Response);
      }
      if (urlStr.includes('/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ state: 'pending' }),
        } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    });

    const result = await fetchPRsForRepo('org/repo', ['someone']);
    expect(result[0].author).toBe('unknown');
  });
});

describe('fetchAllPRs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('combines PRs from multiple repos', async () => {
    mockFetchForSearchAndStatus();

    const result = await fetchAllPRs(['org/repo1', 'org/repo2'], ['alice']);
    expect(result).toHaveLength(6);
  });

  it('throws when all fetches fail', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(
      fetchAllPRs(['org/repo'], ['alice']),
    ).rejects.toThrow('All fetches failed');
  });

  it('returns partial results when some repos fail', async () => {
    let searchCallCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes('search/issues')) {
        searchCallCount++;
        if (searchCallCount === 1) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                items: [mockGitHubResponse.items[0]],
              }),
          } as Response);
        }
        return Promise.resolve({ ok: false, status: 500 } as Response);
      }
      if (urlStr.includes('/pulls/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPRDetailResponse),
        } as Response);
      }
      if (urlStr.includes('/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStatusResponse),
        } as Response);
      }
      return Promise.resolve({ ok: false, status: 404 } as Response);
    });

    const result = await fetchAllPRs(
      ['org/repo1', 'org/repo2'],
      ['alice'],
    );
    expect(result).toHaveLength(1);
  });
});
