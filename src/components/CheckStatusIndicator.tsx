import type { CheckStatus } from '../types';

interface CheckStatusIndicatorProps {
  status: CheckStatus;
}

const STATUS_CONFIG: Record<CheckStatus, { label: string; className: string }> = {
  passed: { label: 'Passed', className: 'check-passed' },
  failed: { label: 'Failed', className: 'check-failed' },
  pending: { label: 'Pending', className: 'check-pending' },
  none: { label: 'No checks', className: 'check-none' },
};

export function CheckStatusIndicator({ status }: CheckStatusIndicatorProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.none;

  return (
    <span className={`check-status ${config.className}`}>
      {config.label}
    </span>
  );
}
