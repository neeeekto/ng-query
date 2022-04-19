import {
  BehaviorSubject,
  delayWhen,
  distinctUntilChanged,
  EMPTY,
  filter,
  iif,
  merge,
  mergeMap,
  MonoTypeOperatorFunction,
  Observable,
  of,
  retryWhen,
  scan,
  Subject,
  switchMap,
  tap,
  throwError,
  timer,
} from 'rxjs';
import { QueryResult } from './query-result';
import { QueryConfig } from './types/query-config.type';
import { QueryTrigger } from './query-trigger';
import { GlobalTriggers } from './global-triggers';
import { IQueryResult } from './types/query-result.type';
import { Key } from './types/key.type';

export class Query<
  TQueryData = any,
  TError = unknown,
  TData = TQueryData
> extends Observable<IQueryResult<TQueryData, TError, TData>> {
  private subscribers = 0;

  private readonly loader$: Observable<any>;
  private readonly arg$: BehaviorSubject<any>;
  private readonly refetch$ = new Subject<any>();
  private readonly onSubscribe$ = new Subject<any>();
  private readonly result$: QueryResult<TQueryData, TError, TData>;

  constructor(
    private readonly key: Key[],
    private readonly config: QueryConfig<TQueryData, TData>,
    private readonly srcFactory: (args: any) => Observable<TQueryData>,
    initialArgs: any,
    private readonly trigger$: QueryTrigger
  ) {
    super((subscriber) => {
      this.subscribers++;
      const resultSubscription = this.result$.subscribe(subscriber);
      const loaderSubscription = this.loader$.subscribe();
      resultSubscription.add(loaderSubscription);
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
    this.arg$ = new BehaviorSubject<any>(initialArgs);
    this.result$ = new QueryResult<TQueryData, TError, TData>(this.config, {
      refecth: () => this.refecth(),
    });
    const emitter$ = this.createEmitter();
    this.loader$ = this.createLoader(emitter$);
  }

  setArg(arg: any) {
    this.arg$.next(arg);
  }

  private refecth() {
    this.refetch$.next(null);
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
            return !this.result$.isStale;
          }
          return true;
        })
      ),
      this.arg$.pipe(
        distinctUntilChanged(),
        filter(() => this.config.refetchOnArgumentChange)
      ),
      iif(
        () => !!this.config.refetchOnSubscribe,
        this.onSubscribe$.pipe(
          filter(() => {
            return (
              this.config.refetchOnSubscribe === 'always' ||
              !this.result$.isStale
            );
          })
        ),
        EMPTY
      ),
      this.refetch$
    );
  }

  private createLoader(emitter$: Observable<any>) {
    const errorRetry = this.createErrorRetry();
    const resultHandler = tap({
      next: (data: TQueryData) => {
        const prevData = this.result$.data;
        let newData: TData = this.config.select?.(data) ?? (data as any);
        if (this.config.isDataEqual?.(prevData, newData) ?? false) {
          newData = prevData as any;
        }
        this.result$.toSuccess(newData);
      },
      error: (err) => this.result$.toError(err),
    });
    return emitter$.pipe(
      filter(() => !this.result$.value.isLoading),
      tap(() => this.result$.toLoading()),
      switchMap(() =>
        this.srcFactory(this.arg$.value).pipe(
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
              return of(retryResult);
            }
          }
          if (this.config.retry > retryResult.count) {
            return of(retryResult);
          }
          return throwError(retryResult.error);
        })
      )
    );
  }
}
