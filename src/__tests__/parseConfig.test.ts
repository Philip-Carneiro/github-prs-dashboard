import { describe, it, expect } from 'vitest';
import {
  parseRepositories,
  parseAuthors,
  normalizeRepoUrl,
} from '../utils/parseConfig';

describe('normalizeRepoUrl', () => {
  it('parses full GitHub URL', () => {
    expect(
      normalizeRepoUrl('https://github.com/kubeflow/model-registry'),
    ).toBe('kubeflow/model-registry');
  });

  it('strips trailing slashes', () => {
    expect(
      normalizeRepoUrl('https://github.com/kubeflow/model-registry/'),
    ).toBe('kubeflow/model-registry');
  });

  it('parses short form owner/repo', () => {
    expect(normalizeRepoUrl('kubeflow/model-registry')).toBe(
      'kubeflow/model-registry',
    );
  });

  it('returns null for invalid input', () => {
    expect(normalizeRepoUrl('not-a-repo')).toBeNull();
    expect(normalizeRepoUrl('')).toBeNull();
  });

  it('handles http URLs', () => {
    expect(
      normalizeRepoUrl('http://github.com/org/repo'),
    ).toBe('org/repo');
  });
});

describe('parseRepositories', () => {
  it('parses newline-separated URLs', () => {
    const input =
      'https://github.com/kubeflow/model-registry/\nhttps://github.com/opendatahub-io/odh-dashboard/';
    expect(parseRepositories(input)).toEqual([
      'kubeflow/model-registry',
      'opendatahub-io/odh-dashboard',
    ]);
  });

  it('parses comma-separated URLs', () => {
    const input =
      'https://github.com/org/repo1, https://github.com/org/repo2';
    expect(parseRepositories(input)).toEqual(['org/repo1', 'org/repo2']);
  });

  it('filters out invalid entries', () => {
    const input = 'https://github.com/org/repo\nnot-valid\norg2/repo2';
    expect(parseRepositories(input)).toEqual(['org/repo', 'org2/repo2']);
  });

  it('handles empty input', () => {
    expect(parseRepositories('')).toEqual([]);
  });

  it('handles whitespace-only input', () => {
    expect(parseRepositories('   \n  \n  ')).toEqual([]);
  });
});

describe('parseAuthors', () => {
  it('parses authors with @ prefix', () => {
    expect(parseAuthors('@user1\n@user2')).toEqual(['user1', 'user2']);
  });

  it('parses authors without @ prefix', () => {
    expect(parseAuthors('user1\nuser2')).toEqual(['user1', 'user2']);
  });

  it('handles comma-separated authors', () => {
    expect(parseAuthors('@user1, @user2')).toEqual(['user1', 'user2']);
  });

  it('trims whitespace', () => {
    expect(parseAuthors('  @user1  \n  user2  ')).toEqual([
      'user1',
      'user2',
    ]);
  });

  it('handles empty input', () => {
    expect(parseAuthors('')).toEqual([]);
  });
});
