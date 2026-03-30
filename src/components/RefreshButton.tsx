interface RefreshButtonProps {
  isLoading: boolean;
  lastRefresh: string | null;
  onRefresh: () => void;
  autoRefreshEnabled?: boolean;
}

export function RefreshButton({
  isLoading,
  lastRefresh,
  onRefresh,
  autoRefreshEnabled = false,
}: RefreshButtonProps) {
  const formattedTime = lastRefresh ? new Date(lastRefresh).toLocaleString() : null;

  return (
    <div className="refresh-bar">
      <button className="refresh-button" onClick={onRefresh} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Refresh'}
      </button>
      {formattedTime && <span className="last-refresh">Last refresh: {formattedTime}</span>}
      {autoRefreshEnabled && <span className="auto-refresh-indicator">Auto-refresh ON</span>}
    </div>
  );
}
