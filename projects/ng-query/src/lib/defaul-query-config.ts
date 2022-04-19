import { QueryBaseConfig } from './types/query-config.type';

export const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

export const DefaulQueryConfig: QueryBaseConfig = {
  cacheTime: DEFAULT_CACHE_TIME,
  refetchInterval: false,
  refetchIntervalInBackground: false,
  refetchOnArgumentChange: true,
  refetchOnReconnect: true,
  refetchOnSubscribe: true,
  refetchOnWindowFocus: true,
  retry: 3,
  retryDelay: 1000,
  staleTime: 10000,
};
