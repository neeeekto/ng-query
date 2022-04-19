import { BehaviorSubject, Observable } from 'rxjs';
import { QueryConfig } from './types/query-config.type';
import { IQueryResult, QueryStatus } from './types/query-result.type';
import { IQuery } from './types/query.type';

export class QueryResult<
  TQueryData = any,
  TError = unknown,
  TData = TQueryData
> extends BehaviorSubject<IQueryResult<TQueryData, TError, TData>> {
  private _data: TData | undefined;
  private _status: QueryStatus = 'idle';
  private _dataUpdatedAt: number = 0;
  private _error?: TError = undefined;
  private _errorUpdatedAt: number = -1;
  private _failureCount: number = 0;
  private _isFetched: boolean = false;

  constructor(
    private readonly queryConfig: QueryConfig<TQueryData, TData>,
    private readonly query: IQuery
  ) {
    super(null!);
  }
  toIdle() {
    this._data = this.makeInitData();
    this._dataUpdatedAt = this.makeInitialDataUpdatedAt(this._data);
    this._status = 'idle';
    this._error = undefined;
    this._errorUpdatedAt = -1;
    this._failureCount = 0;
    this._isFetched = false;
    this.next(this.makeResult());
  }

  toSuccess(data: TData) {
    this._status = 'success';
    if (!this._isFetched) {
      this._isFetched = true;
    }

    this._data = data;
    this._dataUpdatedAt = Date.now();
    this._failureCount = 0;
    this.next(this.makeResult());
  }

  toError(error: TError) {
    this._status = 'error';
    this._error = error;
    this._failureCount++;
    this._errorUpdatedAt = Date.now();
    this.next(this.makeResult());
  }

  toLoading() {
    this._status = 'loading';
    this._data = this.getPlaceholderData();
    this.next(this.makeResult());
  }

  toCancel() {
    this._status = 'canceled';
    this._failureCount = 0;
    this.next(this.makeResult());
  }

  get isStale() {
    return this._dataUpdatedAt + this.queryConfig.staleTime < Date.now();
  }

  get isLoading() {
    return this._status === 'loading';
  }

  get data() {
    return this._data;
  }

  private makeResult(): IQueryResult<TQueryData, TError, TData> {
    const isError = this._status === 'error';
    return {
      data: this._data,
      dataUpdatedAt: this._dataUpdatedAt,
      status: this._status,
      error: this._error,
      errorUpdatedAt: this._errorUpdatedAt,
      failureCount: this._failureCount,
      isFetched: this._isFetched,
      isError,
      isIdle: this._status === 'idle',
      isLoading: this.isLoading,
      isLoadingError: isError && !this._isFetched,
      isRefetchError: isError && this._isFetched,
      isRefetching: this._isFetched && this.isLoading,
      isSuccess: this._status === 'success',
      isStale: this._dataUpdatedAt + this.queryConfig.staleTime < Date.now(),
      query: this.query,
    };
  }

  private makeInitData() {
    if (this.queryConfig.initialData) {
      if (typeof this.queryConfig.initialData == 'function') {
        return (this.queryConfig.initialData as any)();
      } else {
        return this.queryConfig.initialData;
      }
    }
  }

  private makeInitialDataUpdatedAt(initData?: TData) {
    if (initData && this.queryConfig.initialDataUpdatedAt) {
      if (typeof this.queryConfig.initialDataUpdatedAt == 'function') {
        return this.queryConfig.initialDataUpdatedAt() || 0;
      } else {
        return this.queryConfig.initialDataUpdatedAt!;
      }
    }
    return 0;
  }

  private getPlaceholderData(): TData | undefined {
    if (this.queryConfig.placeholderData && !this.queryConfig.initialData) {
      if (typeof this.queryConfig.placeholderData === 'function') {
        return (this.queryConfig.placeholderData as any)() as TData;
      } else {
        return this.queryConfig.placeholderData;
      }
    }
    return this._data;
  }
}
