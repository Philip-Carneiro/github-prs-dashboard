import { useEffect, useRef } from 'react';

export function useAutoRefresh(
  enabled: boolean,
  intervalMs: number,
  onRefresh: () => void,
  isLoading: boolean
): void {
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const id = setInterval(() => {
      if (!isLoading) {
        onRefreshRef.current();
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [enabled, intervalMs, isLoading]);
}
