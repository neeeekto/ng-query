import { IQuery } from './query.type';

export type QueryStatus = 'idle' | 'loading' | 'error' | 'success' | 'canceled';
export interface IQueryResult<
  TQueryData = any,
  TError = unknown,
  TData = TQueryData
> {
  readonly data: TData | undefined;
  readonly dataUpdatedAt: number;
  readonly error?: TError;
  readonly errorUpdatedAt: number;
  readonly failureCount: number;
  readonly isError: boolean;
  readonly isFetched: boolean;
  readonly isIdle: boolean;
  readonly isLoading: boolean;
  readonly isLoadingError: boolean;
  readonly isRefetchError: boolean;
  readonly isRefetching: boolean;
  readonly isStale: boolean;
  readonly isSuccess: boolean;
  readonly status: QueryStatus;
  readonly query: IQuery;
}
