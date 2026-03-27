import { useCallback, useEffect, useState } from 'react';
import type { AppConfig, CachedData } from '../types';
import {
  loadCachedData,
  loadConfig,
  saveCachedData,
  saveConfig,
} from '../utils/storage';

export function useAppConfig(): {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
  isLoading: boolean;
} {
  const [config, setConfigState] = useState<AppConfig>({
    repositories: [],
    authors: [],
    githubToken: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig().then((loaded) => {
      setConfigState(loaded);
      setIsLoading(false);
    });
  }, []);

  const setConfig = useCallback((next: AppConfig) => {
    setConfigState(next);
    saveConfig(next);
  }, []);

  return { config, setConfig, isLoading };
}

export function useCachedData(): {
  cachedData: CachedData;
  setCachedData: (data: CachedData) => void;
} {
  const [cachedData, setCachedDataState] = useState<CachedData>({
    pullRequests: [],
    lastRefresh: null,
  });

  useEffect(() => {
    loadCachedData().then(setCachedDataState);
  }, []);

  const setCachedData = useCallback((data: CachedData) => {
    setCachedDataState(data);
    saveCachedData(data);
  }, []);

  return { cachedData, setCachedData };
}
