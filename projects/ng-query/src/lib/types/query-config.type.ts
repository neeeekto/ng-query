import { Key } from './key.type';

export interface QueryBaseConfig {
  runInZone?: true;

  /**
   * How many times a query should be retried before ending up in the `error` state
   */
  retry: number | ((failureCount: number, error: unknown) => boolean);

  /**
   * Delay between retries
   */
  retryDelay: number | ((failureCount: number, error: unknown) => number);
  /**
   * How long an item remains in the cache (in milliseconds) when there are no subscribers
   */
  cacheTime: number;

  /**
   * The time in milliseconds after data is considered stale.
   * If set to `Infinity`, the data will never be considered stale.
   */
  staleTime: number;
  /**
   * If set to a number, the query will continuously refetch at this frequency in milliseconds.
   * Defaults to `false`.
   */
  refetchInterval: number | false;
  /**
   * If set to `true`, the query will continue to refetch while their tab/window is in the background.
   * Defaults to `false`.
   */
  refetchIntervalInBackground: boolean;
  /**
   * If set to `true`, the query will refetch on window focus if the data is stale.
   * If set to `false`, the query will not refetch on window focus.
   * If set to `'always'`, the query will always refetch on window focus.
   * Defaults to `true`.
   */
  refetchOnWindowFocus: boolean | 'always';
  /**
   * If set to `true`, the query will refetch on reconnect if the data is stale.
   * If set to `false`, the query will not refetch on reconnect.
   * If set to `'always'`, the query will always refetch on reconnect.
   * Defaults to `true`.
   */
  refetchOnReconnect: boolean | 'always';
  /**
   * If set to `true`, the query will refetch on subscribe if the data is stale.
   * If set to `false`, will disable additional instances of a query to trigger background refetches.
   * If set to `'always'`, the query will always refetch on subscribe.
   * Defaults to `true`.
   */
  refetchOnSubscribe: boolean | 'always';

  refetchOnArgumentChange: boolean;
  argumentComparator?: (prev: any, next: any) => boolean;
}

export interface QueryConfig<
  TQueryData = unknown,
  TData = TQueryData,
  TQueryKey extends Key = Key
> extends QueryBaseConfig {
  isDataEqual?: (oldData: TData | undefined, newData: TData) => boolean;
  /**
   * This option can be used to transform or select a part of the data returned by the query function.
   */
  select?: (data: TQueryData) => TData;

  /**
   * If set, this value will be use as the default data.
   */
  initialData?: TData | (() => TData | undefined);
  initialDataUpdatedAt?: number | (() => number | undefined);

  /**
   * If set, this value will be used as the placeholder data for this particular query observer while the query is still in the `loading`
   * data and no initialData has been provided.
   */
  placeholderData?: TData | (() => TData);
}
