import type { PRStatus } from '../types';

interface StatusBadgeProps {
  status: PRStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-${status}`}>{status}</span>;
}
