import type { PullRequest } from '../types';
import { PRRow } from './PRRow';

interface PRTableProps {
  pullRequests: PullRequest[];
}

export function PRTable({ pullRequests }: PRTableProps) {
  if (pullRequests.length === 0) {
    return (
      <div className="empty-state">
        No pull requests to display. Configure repositories and authors,
        then click Refresh.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="pr-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Repository</th>
            <th>Status</th>
            <th>Build</th>
            <th>Created</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {pullRequests.map((pr) => (
            <PRRow key={pr.id} pr={pr} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
