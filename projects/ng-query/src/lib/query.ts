import {
  BehaviorSubject,
  EMPTY,
  iif,
  MonoTypeOperatorFunction,
  Observable,
  of,
  Subject,
  Subscription,
  throwError,
  timer,
  merge,
} from 'rxjs';
import {
  switchMap,
  tap,
  scan,
  retryWhen,
  mergeMap,
  filter,
  distinctUntilChanged,
  delayWhen,
} from 'rxjs/operators';
import { QueryResult } from './query-result';
import { QueryConfig } from './types/query-config.type';
import { QueryTrigger } from './query-trigger';
import { IQueryResult } from './types/query-result.type';
import { Key } from './types/key.type';
import { IGcPlaner } from './types/gc.type';
import { IQueryObservable } from './types/query.type';

// То что отвечает за запросы, резапросы, их обнуления и планировку очистки
export class Query<TQueryData = any, TError = unknown, TData = TQueryData>
  extends Observable<IQueryResult<TQueryData, TError, TData>>
  implements IQueryObservable<TQueryData, TError, TData>
{
  private subscribers = 0;

  private readonly loader$: Observable<any>;
  private readonly refetch$ = new BehaviorSubject<any>(null);
  private readonly onSubscribe$ = new Subject<any>();
  private readonly result$: QueryResult<TQueryData, TError, TData>;
  private loaderSubscription?: Subscription;

  constructor(
    public readonly key: Key,
    private readonly config: QueryConfig<TQueryData, TData>,
    private src: () => Observable<TQueryData>,
    private readonly trigger$: QueryTrigger,
    private readonly gcPlanner: IGcPlaner
  ) {
    super((subscriber) => {
      this.subscribers++;
      const resultSubscription = this.result$.subscribe(subscriber);
      if (this.loaderSubscription == undefined) {
        // Once, lazy subscription
        this.loaderSubscription = this.loader$.subscribe();

        this.gcPlanner.schedule(() => {
          const needClean =
            this.lastResult.dataUpdatedAt + this.config.cacheTime <
              Date.now() && this.subscribers === 0;
          if (needClean) {
            this.loaderSubscription?.unsubscribe();
            this.loaderSubscription = undefined;
            this.result$.toIdle();
          }
          return needClean;
        }, this.config.cacheTime);
      }
      resultSubscription.add(() => {
        this.subscribers--;
        if (this.subscribers === 0) {
          if (this.result$.isLoading) {
            this.result$.toCancel();
          }
        }
      });
      this.onSubscribe$.next(null);
      return resultSubscription;
    });
    this.result$ = new QueryResult<TQueryData, TError, TData>(this.config, {
      refetch: () => this.refetch(),
    });
    const emitter$ = this.createEmitter();
    this.loader$ = this.createLoader(emitter$);
  }

  refetch() {
    this.refetch$.next(null);
  }

  update(data: TData) {
    this.toSuccess(data);
  }

  setSrc(newSrc: () => Observable<TQueryData>) {
    if (this.src !== newSrc) {
      this.src = newSrc;
      if (this.config.refetchOnNewSrc) {
        this.refetch$.next(null);
      }
    }
  }

  get lastResult() {
    return this.result$.getValue();
  }

  private createEmitter() {
    return merge(
      this.trigger$.pipe(
        filter((trigger) => {
          if (
            (trigger.type === 'focus' &&
              this.config.refetchOnWindowFocus !== 'always') ||
            trigger.type === 'interval' ||
            (trigger.type === 'online' &&
              this.config.refetchOnReconnect !== 'always')
          ) {
            return this.result$.isStale;
          }
          return true;
        })
      ),
      iif(
        () => !!this.config.refetchOnSubscribe,
        this.onSubscribe$.pipe(
          filter(() => {
            return (
              this.config.refetchOnSubscribe === 'always' ||
              this.result$.isStale
            );
          })
        ),
        EMPTY
      ),
      this.refetch$
    );
  }

  private toSuccess(newData: TData) {
    const prevData = this.result$.data;
    if (this.config.isDataEqual?.(prevData, newData) ?? false) {
      newData = prevData as any;
    }
    this.result$.toSuccess(newData);
  }

  private createLoader(emitter$: Observable<any>) {
    const errorRetry = this.createErrorRetry();
    const resultHandler = tap({
      next: (data: TQueryData) => {
        let newData: TData = this.config.select?.(data) ?? (data as any);
        this.toSuccess(newData);
      },
      error: (err) => this.result$.toError(err, true),
    });
    return emitter$.pipe(
      filter(() => !this.result$.value.isLoading),
      tap(() => this.result$.toLoading()),
      switchMap(() =>
        this.src().pipe(
          errorRetry,
          resultHandler,
          retryWhen((errors) => this.trigger$)
        )
      )
    );
  }

  private createErrorRetry(): MonoTypeOperatorFunction<TQueryData> {
    return retryWhen((errors) =>
      errors.pipe(
        scan((acc, error) => ({ count: acc.count + 1, error }), {
          count: 0,
          error: undefined as any,
        }),
        delayWhen((retryResult) =>
          timer(
            typeof this.config.retryDelay === 'function'
              ? this.config.retryDelay(retryResult.count, retryResult.error)
              : this.config.retryDelay
          )
        ),
        mergeMap((retryResult) => {
          if (typeof this.config.retry === 'function') {
            if (this.config.retry(retryResult.count, retryResult.error)) {
              this.result$.toError(retryResult.error);
              return of(retryResult);
            }
          }
          if (this.config.retry > retryResult.count) {
            this.result$.toError(retryResult.error);
            return of(retryResult);
          }
          return throwError(retryResult.error);
        })
      )
    );
  }
}
