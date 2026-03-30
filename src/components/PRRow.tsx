import { useState } from 'react';
import type { PullRequest } from '../types';
import { CheckStatusIndicator } from './CheckStatusIndicator';
import { StatusBadge } from './StatusBadge';

interface PRRowProps {
  pr: PullRequest;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function PRRow({ pr }: PRRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(pr.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <tr>
      <td>
        <a href={pr.url} target="_blank" rel="noopener noreferrer">
          {pr.title}
        </a>
      </td>
      <td>{pr.author}</td>
      <td>{pr.repo}</td>
      <td>
        <StatusBadge status={pr.status} />
      </td>
      <td>
        <CheckStatusIndicator status={pr.checkStatus} />
      </td>
      <td>{formatDate(pr.createdAt)}</td>
      <td>{formatDate(pr.updatedAt)}</td>
      <td>
        <button
          className={`copy-link-button ${copied ? 'copied' : ''}`}
          onClick={handleCopyLink}
          title="Copy PR link"
          aria-label="Copy PR link"
        >
          {copied ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </td>
    </tr>
  );
}
