import { QueryBaseConfig } from '../../types/query-config.type';

export const DefaulQueryConfigForTest: QueryBaseConfig = {
  cacheTime: 5 * 60 * 1000,
  refetchInterval: false,
  refetchIntervalInBackground: false,
  refetchOnReconnect: true,
  refetchOnSubscribe: true,
  refetchOnWindowFocus: true,
  retry: 3,
  retryDelay: 1000,
  staleTime: 10000,
  refetchOnNewSrc: false,
};
