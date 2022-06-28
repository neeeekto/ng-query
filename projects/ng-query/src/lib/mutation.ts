import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { take } from 'rxjs/operators';
import { Key } from './types/key.type';

export class Mutation<TRes = any> extends Observable<Mutation<TRes>> {
  private loading = false;
  private success = false;
  private error = false;

  private status$ = new BehaviorSubject<Mutation<TRes>>(this);

  constructor(
    public readonly key: Key,
    private executor: () => Observable<TRes>
  ) {
    super((subscriber) => {
      return this.status$.subscribe(subscriber);
    });
  }

  setExecutor(fn: () => Observable<TRes>) {
    if (this.executor !== fn) {
      this.executor = fn;
    }
  }

  // For GC
  get isUsed() {
    return this.status$.observed;
  }

  asObservableExecutor() {
    return this.run();
  }

  execute() {
    this.run().pipe(take(1)).subscribe();
    return this.pipe(take(1));
  }

  private run() {
    this.toLoading();
    return this.executor().pipe(
      tap({
        next: (res) => {
          this.toSuccess();
        },
        error: () => this.toError(),
      })
    );
  }

  private toLoading() {
    this.loading = true;
    this.emitMe();
  }

  private toSuccess() {
    this.loading = false;
    this.error = false;
    this.success = true;
    this.emitMe();
  }

  private toError() {
    this.loading = false;
    this.error = true;
    this.emitMe();
  }

  private emitMe() {
    this.status$.next(this);
  }

  get isSuccess() {
    return this.success;
  }

  get isLoading() {
    return this.loading;
  }

  get isError() {
    return this.error;
  }
}
