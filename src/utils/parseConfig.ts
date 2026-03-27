export function parseRepositories(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(normalizeRepoUrl)
    .filter((repo): repo is string => repo !== null);
}

export function normalizeRepoUrl(url: string): string | null {
  const cleaned = url.replace(/\/+$/, '').trim();

  const httpsMatch = cleaned.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)/,
  );
  if (httpsMatch) {
    return `${httpsMatch[1]}/${httpsMatch[2]}`;
  }

  const shortMatch = cleaned.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (shortMatch) {
    return `${shortMatch[1]}/${shortMatch[2]}`;
  }

  return null;
}

export function parseAuthors(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((author) => author.trim().replace(/^@/, ''))
    .filter(Boolean);
}
