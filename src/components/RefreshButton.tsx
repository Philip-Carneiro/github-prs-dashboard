interface RefreshButtonProps {
  isLoading: boolean;
  lastRefresh: string | null;
  onRefresh: () => void;
}

export function RefreshButton({
  isLoading,
  lastRefresh,
  onRefresh,
}: RefreshButtonProps) {
  const formattedTime = lastRefresh
    ? new Date(lastRefresh).toLocaleString()
    : null;

  return (
    <div className="refresh-bar">
      <button
        className="refresh-button"
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Refresh'}
      </button>
      {formattedTime && (
        <span className="last-refresh">Last refresh: {formattedTime}</span>
      )}
    </div>
  );
}
