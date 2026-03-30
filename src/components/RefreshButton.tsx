import type { RefreshStatus } from '../types';

interface RefreshButtonProps {
  isLoading: boolean;
  refreshStatus: RefreshStatus;
  onRefresh: () => void;
  autoRefreshEnabled?: boolean;
}

export function RefreshButton({
  isLoading,
  refreshStatus,
  onRefresh,
  autoRefreshEnabled = false,
}: RefreshButtonProps) {
  const formattedSuccessTime = refreshStatus.lastSuccessfulRefresh
    ? new Date(refreshStatus.lastSuccessfulRefresh).toLocaleString()
    : null;

  const formattedFailTime = refreshStatus.lastFailedAttempt
    ? new Date(refreshStatus.lastFailedAttempt).toLocaleString()
    : null;

  return (
    <div className="refresh-bar">
      <button className="refresh-button" onClick={onRefresh} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Refresh'}
      </button>
      <div className="refresh-status">
        {formattedSuccessTime && (
          <span className="last-refresh">Last refresh: {formattedSuccessTime}</span>
        )}
        {refreshStatus.error && formattedFailTime && (
          <span className="refresh-error">
            {'\u26A0\uFE0F'} Failed to refresh at {formattedFailTime} &mdash; {refreshStatus.error}
          </span>
        )}
      </div>
      {autoRefreshEnabled && <span className="auto-refresh-indicator">Auto-refresh ON</span>}
    </div>
  );
}
