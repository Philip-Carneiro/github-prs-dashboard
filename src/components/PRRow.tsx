import type { PullRequest } from '../types';
import { CheckStatusIndicator } from './CheckStatusIndicator';
import { StatusBadge } from './StatusBadge';

interface PRRowProps {
  pr: PullRequest;
}

export function PRRow({ pr }: PRRowProps) {
  const formattedDate = new Date(pr.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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
      <td>{formattedDate}</td>
    </tr>
  );
}
