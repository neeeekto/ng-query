import { Observable } from 'rxjs';
import { IQueryResult } from './query-result.type';
import { Key } from './key.type';

export interface IQuery {
  refetch(): void;
}

export interface IQueryObservable<TQueryData, TError, TData>
  extends Observable<IQueryResult<TQueryData, TError, TData>> {
  readonly key: Key;
  refetch(): void;
  get lastResult(): IQueryResult<TQueryData, TError, TData>;
}
