import { useState, useMemo } from 'react';
import type { PullRequest, SortField, SortDirection } from '../types';
import { PRRow } from './PRRow';

interface PRTableProps {
  pullRequests: PullRequest[];
}

function SortIcon({ direction, active }: { direction: SortDirection; active: boolean }) {
  const color = active ? 'currentColor' : '#888';
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ marginLeft: 4, verticalAlign: 'middle' }}
    >
      {direction === 'desc' ? (
        <polyline points="6 9 12 15 18 9" />
      ) : (
        <polyline points="6 15 12 9 18 15" />
      )}
    </svg>
  );
}

export function PRTable({ pullRequests }: PRTableProps) {
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedPRs = useMemo(() => {
    const sorted = [...pullRequests];
    sorted.sort((a, b) => {
      const dateA = new Date(sortField === 'created' ? a.createdAt : a.updatedAt).getTime();
      const dateB = new Date(sortField === 'created' ? b.createdAt : b.updatedAt).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [pullRequests, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (pullRequests.length === 0) {
    return (
      <div className="empty-state">
        No pull requests to display. Configure repositories and authors, then click Refresh.
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
            <th
              className={`sortable-header ${sortField === 'created' ? 'active' : ''}`}
              onClick={() => handleSort('created')}
              aria-sort={
                sortField === 'created'
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
            >
              Created
              <SortIcon
                direction={sortField === 'created' ? sortDirection : 'desc'}
                active={sortField === 'created'}
              />
            </th>
            <th
              className={`sortable-header ${sortField === 'updated' ? 'active' : ''}`}
              onClick={() => handleSort('updated')}
              aria-sort={
                sortField === 'updated'
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
            >
              Updated
              <SortIcon
                direction={sortField === 'updated' ? sortDirection : 'desc'}
                active={sortField === 'updated'}
              />
            </th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {sortedPRs.map((pr) => (
            <PRRow key={pr.id} pr={pr} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
