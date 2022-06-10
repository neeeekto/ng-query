import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Key } from './types/key.type';
import { QueryConfig } from './types/query-config.type';
import { Query } from './query';
import { QueryTrigger } from './query-trigger';
import { GlobalTriggers } from './global-triggers';
import { QueryStore } from './query-store';
import { QueryConfigFactory } from './query-config-factory';
import { GcPlanner } from './gc-planner';
import { IQueryObservable } from './types/query.type';

@Injectable()
export class QueryFactory {
  constructor(
    private readonly queryConfigFactory: QueryConfigFactory,
    private readonly globalTriggers: GlobalTriggers,
    private readonly queryStore: QueryStore,
    private readonly gcPlanner: GcPlanner
  ) {}

  public build<TRes, TData = TRes, TError = unknown>(
    src: () => Observable<TRes>,
    key: Key,
    config?: Partial<QueryConfig<TRes, TData>>
  ) {
    let exist: Query<TRes, TError, TData> | undefined =
      this.queryStore.get(key);
    if (!exist) {
      const queryConfig = this.queryConfigFactory.make(config);
      const trigger = new QueryTrigger(
        queryConfig,
        this.globalTriggers.focus$,
        this.globalTriggers.blur$,
        this.globalTriggers.online$
      );
      exist = new Query<TRes, TError, TData>(
        key,
        queryConfig,
        src,
        trigger,
        this.gcPlanner
      );
      this.queryStore.add(exist);
    }
    exist.setSrc(src);
    return exist as IQueryObservable<TRes, TError, TData>;
  }
}
